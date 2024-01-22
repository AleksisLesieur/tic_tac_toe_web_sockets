from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import json, asyncio

app = FastAPI()

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
        self.players_ID = []
        self.players_names = []

    def setting_ID(self, ID: str):
        self.players_ID.append(ID)

    def set_player_names(self, name: str):
        self.players_names.append(name)
    
    async def connect(self, websocket: WebSocket):
        
        await websocket.accept() 
        self.connection_count += 1

        if self.connection_count < 3:
            self.active_connections.append(websocket)

            if self.connection_count == 1:
                await self.broadcast(json.dumps({
                    "message_type": "waiting_for_player",
                    "playerID": self.players_ID,
                    "playerNames": self.players_names
                }))
                
            if self.connection_count == 2:
                await self.broadcast(json.dumps({
                    "message_type": "game_started", 
                    "firstPlayerID": game_state.refreshed_game_ID,
                    "firstPlayerMove": game_state.current_player,
                    "board": game_state.board,
                    "playerID": self.players_ID,
                    "playerNames": self.players_names
                }))

            if self.connection_count > len(self.players_names):
                await self.broadcast(json.dumps({
                    "message_type": "hacker",
                    "clientID": self.players_ID
                }))

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
        self.connection_count = 0

    async def reset(self):
        self.active_connections.clear()
        self.connection_count = 0
        self.players_ID = []
        self.players_names = []
        game_state.first_score = 0
        game_state.second_score = 0

connection_manager = ConnectionManager()

class GameState:
    def __init__(self):
        self.board = [None] * 9
        self.current_player = None
        self.current_ID = None
        self.refreshed_game_ID = None
        self.play_again = 0
        self.first_score = 0
        self.second_score = 0
        self.winner = None

    def make_move(self, index: int, client_id: str):        
        if self.current_ID == client_id:
            return False
        
        if self.board[index] is None:
            self.board[index] = self.current_player
            self.current_player = 'X' if self.current_player == 'O' or None else 'O'
            self.current_ID = client_id
            return True
        
        return False
    
    def is_board_full(self):
        for item in self.board:
            if item is None:
                return False
        return True
    
    def check_winner(self, board: list):
        # checking horizontally for X
        if board[0] == 'X' and board[1] == 'X' and board[2] == 'X' or board[3] == 'X' and board[4] == 'X' and board[5] == 'X' or board[6] == 'X' and board[7] == 'X' and board[8] == 'X':
            if board[0] == 'X' or board[3] == 'X' or board[6] == 'X':
                self.winner = 'X'

        # checking vertically for X
        if board[0] == 'X' and board[3] == 'X' and board[6] == 'X' or board[1] == 'X' and board[4] == 'X' and board[7] == 'X' or board[2] == 'X' and board[5] == 'X' and board[8] == 'X':
            if board[0] == 'X' or board[1] == 'X' or board[2] == 'X':
                self.winner = 'X'

        # checking diagonally for X
        if board[0] == 'X' and board[4] == 'X' and board[8] == 'X' or board[2] == 'X' and board[4] == 'X' and board[6] == 'X':
            if board[4] == 'X':
                self.winner = 'X'

        # checking horizontally for O
        if board[0] == 'O' and board[1] == 'O' and board[2] == 'O' or board[3] == 'O' and board[4] == 'O' and board[5] == 'O' or board[6] == 'O' and board[7] == 'O' and board[8] == 'O':
            if board[0] == 'O' or board[3] == 'O' or board[6] == 'O':
                self.winner = 'O'

        # checking vertically for O
        if board[0] == 'O' and board[3] == 'O' and board[6] == 'O' or board[1] == 'O' and board[4] == 'O' and board[7] == 'O' or board[2] == 'O' and board[5] == 'O' and board[8] == 'O':
            if board[0] == 'O' or board[1] == 'O' or board[2] == 'O':
                self.winner = 'O'

        # checking diagonally for O
        if board[0] == 'O' and board[4] == 'O' and board[8] == 'O' or board[2] == 'O' and board[4] == 'O' and board[6] == 'O':
            if board[4] == 'O':
                self.winner = 'O'

        if self.is_board_full():
            self.winner = 'Tie'

        return self.winner
    
    def update_scores(self):
        if self.winner == 'X':
            self.first_score += 1
            
        if self.winner == 'O':
            self.second_score += 1
    
    def reset_board(self):
        self.board = [None] * 9
        self.winner = None
        # self.current_ID = None

game_state = GameState()

@app.get("/")
async def read_root(request: Request):
    return templates.TemplateResponse('home.html', {"request": request})

@app.get("/game")
async def read_game(request: Request):
    return templates.TemplateResponse('game.html', {"request": request})

@app.post("/player_data")
async def received_names(data: dict):
    player_name = data['playerName']
    connection_manager.set_player_names(player_name)
    return {"message": 'data has been sent!'}

@app.websocket('/ws/lobby/{client_id}')
async def websocket_endpoint_client(websocket: WebSocket, client_id: str):
    await connection_manager.connect(websocket)
    connection_manager.setting_ID(client_id)
    try:
        while True:
            player_index = await websocket.receive_text()

            if player_index.isdigit():

                game_coordinates = int(player_index)

                game_state.make_move(game_coordinates, client_id)

                result = game_state.check_winner(game_state.board)

                game_state.update_scores()

                await connection_manager.broadcast(json.dumps({
                    "message_type": "player_data",
                    "board": game_state.board,
                    "currentPlayer": game_state.current_player,
                    "connectionCount": connection_manager.connection_count,
                    "playerIndex": game_coordinates,
                    "clientID": client_id,
                    "playerNames": connection_manager.players_names,
                    "playerIDs": connection_manager.players_ID,
                    "result": result,
                    "score": [game_state.first_score, game_state.second_score]
                }))

            else:
                game_state.reset_board()
                if (player_index == connection_manager.players_ID[0]):
                    game_state.current_player = 'O'
                elif (player_index == connection_manager.players_ID[1]):
                    game_state.current_player = 'X'
                game_state.play_again += 1
                if game_state.play_again == 1:
                    await connection_manager.broadcast(json.dumps({
                        "message_type": "waiting_to_play_again",
                    }))
                if game_state.play_again == 2:
                    await connection_manager.broadcast(json.dumps({
                        "message_type": "ready_to_play",
                        "clientID": client_id,
                    }))
                    game_state.play_again = 0
                

    except WebSocketDisconnect:
        await connection_manager.disconnect(websocket)
        await connection_manager.broadcast(json.dumps({"message_type": "player_dc"}))
        await connection_manager.reset()
        game_state.reset_board()