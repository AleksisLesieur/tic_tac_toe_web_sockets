from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from mangum import Mangum
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

handler = Mangum(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],  
)

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
        self.connection_count = 0
    
    async def connect(self, websocket: WebSocket):
        
        await websocket.accept() 
        self.connection_count += 1

        if self.connection_count < 3:
            self.active_connections.append(websocket)

            if self.connection_count == 1:
                await self.broadcast(json.dumps({
                    "message_type": "waiting_for_player"
                }))

            if self.connection_count == 2:
                await self.broadcast(json.dumps({
                    "message_type": "game_started", 
                    "firstPlayerID": game_state.refreshed_game_ID
                }))
                # await websocket.send_text(json.dumps({
                #     "message_type": "game_started"
                # }))

        else:
            await websocket.send_text(json.dumps({
                "message_type": "full_room",
                "connectionCount": self.connection_count
            }))
            await websocket.close(code=1000)
    
    async def broadcast(self, data: str):
        for connection in self.active_connections:
            await connection.send_text(data)
        
    async def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        self.connection_count -= 1

    async def reset(self):
        self.active_connections.clear()
        self.connection_count = 0

connection_manager = ConnectionManager()

class GameState:
    def __init__(self):
        self.board = [None] * 9
        self.current_player = 'X'
        self.current_ID = None
        self.refreshed_game_ID = None
        self.first_player = {}
        self.second_player = {}
        self.winner = None
    
    def set_player_names(self, player_name: str):
        if not self.first_player:
            self.first_player['name'] = player_name
        else:
            self.second_player['name'] = player_name


    def set_player_ID(self, ID: str):
        if not self.current_ID:
            self.current_ID = ID
            self.refreshed_game_ID = ID

        if len(self.first_player) <= 1:
            self.first_player['ID'] = ID
        else:
            self.second_player['ID'] = ID

    def make_move(self, index: int, client_id: str):        
        if self.current_ID == client_id:
            return False
        
        if self.board[index] is None:
            self.board[index] = self.current_player
            self.current_player = 'O' if self.current_player == 'X' else 'X'
            self.current_ID = client_id
            return True
        
        return False
    
    def is_board_full(self):
        for item in self.board:
            if item is None:
                return False
        return True
    
    def check_winner(self, board: list):
        # checking horizontal
        if board[0] == board[1] == board[2] or board[3] == board[4] == board[5] or board[6] == board[7] == board[8]:
            if board[0] == 'X' or board[3] == 'X' or board[6] == 'X':
                self.winner = 'X'
            else:
                self.winner = 'O'

        # checking vertically
        if board[0] == board[3] == board[6] or board[1] == board[4] == board[7] or board[2] == board[5] == board[8]:
            if board[0] == 'X' or board[1] == 'X' or board[2] == 'X':
                self.winner = 'X'
            else:
                self.winner = 'O'

        # checking diagonally
        if board[0] == board[4] == board[8] or board[2] == board[4] == board[6]:
            if board[4] == 'X':
                self.winner = 'X'
            else:
                self.winner = 'O'

        if self.is_board_full():
            self.winner = 'Tie'

        return self.winner
    
    def reset_board(self):
        self.board = [None] * 9
        self.current_player = 'X'
        self.winner = None

    def reset_names(self):
        self.first_player = {}
        self.second_player = {}
        
game_state = GameState()

@app.get("/")
async def read_root(request: Request):
    return templates.TemplateResponse('inputName.html', {"request": request})

@app.get("/game")
async def read_game(request: Request):
    return templates.TemplateResponse('gameLobby.html', {"request": request})

@app.post("/player_data")
async def received_names(data: dict):
    player_name = data['playerName']
    game_state.set_player_names(player_name)
    return {"message": [game_state.first_player, game_state.second_player]} 

@app.websocket('/ws/lobby/{client_id}')
async def websocket_endpoint_client(websocket: WebSocket, client_id: str):
    await connection_manager.connect(websocket)
    game_state.set_player_ID(client_id)
    try:
        while True:
            await connection_manager.broadcast(json.dumps({
                "message_type": "player_data",
                "first_player": game_state.first_player,
                "second_player": game_state.second_player,
            }))

            player_index = await websocket.receive_text()

            if player_index.isdigit():

                game_coordinates = int(player_index)

                game_state.make_move(game_coordinates, client_id)

                await connection_manager.broadcast(json.dumps({
                    "message_type": "game_state",
                    "board": game_state.board,
                    "currentPlayer": game_state.current_player,
                    "connectionCount": connection_manager.connection_count,
                    "playerIndex": game_coordinates,
                    "clientID": client_id,
                }))

            result = game_state.check_winner(game_state.board)
            await connection_manager.broadcast(json.dumps({
                "message_type": "result",
                "result": result,
            }))
            print(game_state.first_player)
            print(game_state.second_player)

    except WebSocketDisconnect:
        await connection_manager.disconnect(websocket)
        await connection_manager.broadcast(json.dumps({
            "message_type": "player_dc"
            }))
        await connection_manager.reset()
        game_state.reset_board()
        game_state.reset_names()