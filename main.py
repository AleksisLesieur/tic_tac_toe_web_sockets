from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import json

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

    # def sending_data(self, websocket: WebSocket):
    #     # if len(self.players_ID) == 2 and len(self.players_names) == 2:
    #     websocket.send_text(json.dumps({
    #         "message_type": "forcefully_sending_data",
    #         "playerIDS": self.players_ID,
    #         "playerNames": self.players_names
    #     }))

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
                print('2 players connected thingy')
                await self.broadcast(json.dumps({
                    "message_type": "game_started", 
                    "firstPlayerID": game_state.refreshed_game_ID,
                    "firstPlayerMove": game_state.current_player,
                    "board": game_state.board,
                    "playerID": self.players_ID,
                    "playerNames": self.players_names
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
        self.connection_count = 0

    async def reset(self):
        self.active_connections.clear()
        self.connection_count = 0
        self.players_ID = []
        self.players_names = []

connection_manager = ConnectionManager()

class GameState:
    def __init__(self):
        self.board = [None] * 9
        self.current_player = 'X'
        self.current_ID = None
        self.refreshed_game_ID = None
        # self.first_player = {}
        # self.second_player = {}
        self.winner = None
        # self.players_data = []

        # def set_player_names(self, player_name: str):
        #     self.players_data.append(player_name)

    # def set_player_ID(self, ID: str):
    #     if not self.current_ID:
    #         self.current_ID = ID
    #         self.refreshed_game_ID = ID

    #     self.players_data.append(ID)


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
        # checking horizontally for X
        if board[0] == 'X' and board[1] == 'X' and board[2] == 'X' or board[3] == 'X' and board[4] == 'X' and board[5] == 'X' or board[6] == 'X' and board[7] == 'X' and board[8] == 'X':
            if board[0] == 'X' or board[3] == 'X' or board[6] == 'X':
                print('check winner function is run 1')
                self.winner = 'X'

        # checking vertically for X
        if board[0] == 'X' and board[3] == 'X' and board[6] == 'X' or board[1] == 'X' and board[4] == 'X' and board[7] == 'X' or board[2] == 'X' and board[5] == 'X' and board[8] == 'X':
            print('check winner function is run 2')
            if board[0] == 'X' or board[1] == 'X' or board[2] == 'X':
                self.winner = 'X'

        # checking diagonally for X
        if board[0] == 'X' and board[4] == 'X' and board[8] == 'X' or board[2] == 'X' and board[4] == 'X' and board[6] == 'X':
            print('check winner function is run 3')
            if board[4] == 'X':
                self.winner = 'X'

        # checking horizontally for O
        if board[0] == 'O' and board[1] == 'O' and board[2] == 'O' or board[3] == 'O' and board[4] == 'O' and board[5] == 'O' or board[6] == 'O' and board[7] == 'O' and board[8] == 'O':
            if board[0] == 'O' or board[3] == 'O' or board[6] == 'O':
                print('check winner function is run 1')
                self.winner = 'O'

        # checking vertically for O
        if board[0] == 'O' and board[3] == 'O' and board[6] == 'O' or board[1] == 'O' and board[4] == 'O' and board[7] == 'O' or board[2] == 'O' and board[5] == 'O' and board[8] == 'O':
            print('check winner function is run 2')
            if board[0] == 'O' or board[1] == 'O' or board[2] == 'O':
                self.winner = 'O'

        # checking diagonally for O
        if board[0] == 'O' and board[4] == 'O' and board[8] == 'O' or board[2] == 'O' and board[4] == 'O' and board[6] == 'O':
            print('check winner function is run 3')
            if board[4] == 'O':
                self.winner = 'O'

        if self.is_board_full():
            self.winner = 'Tie'

        return self.winner
    
    def reset_board(self):
        self.board = [None] * 9
        self.current_player = 'X'
        self.winner = None

    def reset_names(self):
        # self.first_player = {}
        # self.second_player = {}
        # self.players_data = []
        # self.pl
        pass
        
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
    print(connection_manager.players_ID, ' line 188')
    print(connection_manager.players_names, ' line 189')
    print('before try thingy')
    # connection_manager.sending_data()
    try:
        while True:
            print('after try thingy')

            # game_state.set_player_ID(client_id)

            player_index = await websocket.receive_text()

            # if player_index.isdigit():

            game_coordinates = int(player_index)

            game_state.make_move(game_coordinates, client_id)

            result = game_state.check_winner(game_state.board)

            await connection_manager.broadcast(json.dumps({
                "message_type": "player_data",
                "board": game_state.board,
                "currentPlayer": game_state.current_player,
                "connectionCount": connection_manager.connection_count,
                "playerIndex": game_coordinates,
                "clientID": client_id,
                "playerNames": connection_manager.players_names,
                "playerIDs": connection_manager.players_ID,
                "result": result
            }))


            # await connection_manager.broadcast(json.dumps({
            #     "message_type": "game_state",
            #     "board": game_state.board,
            #     "currentPlayer": game_state.current_player,
            #     "connectionCount": connection_manager.connection_count,
            #     "playerIndex": game_coordinates,
            #     "clientID": client_id,
            # }))

            # result = game_state.check_winner(game_state.board)
            # await connection_manager.broadcast(json.dumps({
            #     "message_type": "result",
            #     "result": result,
            # }))

    except WebSocketDisconnect:
        await connection_manager.disconnect(websocket)
        await connection_manager.broadcast(json.dumps({"message_type": "player_dc"}))
        await connection_manager.reset()
        game_state.reset_board()
        game_state.reset_names()