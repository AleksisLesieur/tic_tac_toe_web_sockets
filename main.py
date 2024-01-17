# from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
# from fastapi.templating import Jinja2Templates
# from fastapi.staticfiles import StaticFiles
# from fastapi.middleware.cors import CORSMiddleware
# import json

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # Allows all origins
#     allow_credentials=True,
#     allow_methods=["*"],  # Allows all methods
#     allow_headers=["*"],  # Allows all headers
# )

# app.mount("/static", StaticFiles(directory="static"), name="static")

# templates = Jinja2Templates(directory="templates")

# class ConnectionManager:
#     def __init__(self):
#         self.active_connections: list[WebSocket] = []
#         self.connection_count = 0
#         self.first_move = 0

#     async def register_names(self, websocket: WebSocket):
#         await websocket.accept()
#         self.active_connections.append(websocket)

#     async def connect(self, websocket: WebSocket):
#         await websocket.accept()
#         if self.connection_count < 3:
#             self.active_connections.append(websocket)
#             self.connection_count += 1
            # self.connection_count = bool(game_state.first_player) + bool(game_state.second_player)

            # if self.connection_count == 1:
            #     await self.broadcast(json.dumps({
            #         "message_type": "waiting_for_player"
            #     }))
                
            # if self.connection_count == 2:
            #     await manager.broadcast(json.dumps({
            #         "message_type": "player_data",
            #         "first_player": game_state.first_player,
            #         "second_player": game_state.second_player,
            #     }))

    #     else:
    #         await websocket.send_text(json.dumps({
    #                 "message_type": "full_room",
    #                 "playerCount": self.connection_count
    #             }))
    #         await websocket.close(code=1000)

    # def disconnect(self, websocket: WebSocket):
    #     self.active_connections.remove(websocket)
    #     self.connection_count = 0

    # async def send_personal_message(self, message: str, websocket: WebSocket):
    #     await websocket.send_text(message)

    # async def broadcast(self, data: str):
    #     for connection in self.active_connections:
    #         await connection.send_text(data)

    # async def reset(self):
    #     self.active_connections.clear()

# manager = ConnectionManager()

# class GameState:
#     def __init__(self):
#         self.board = [None] * 9
#         self.current_player = 'X'
#         self.last_player = None
#         self.temporary_id = None
#         self.first_player = {}
#         self.second_player = {}

#     def is_board_empty(board):
#         return all(element is None for element in board)

#     def set_player_data(self, player_name: str, player_id: str):
#         if not self.first_player:
#             self.first_player['name'] = player_name
#             self.first_player['ID'] = player_id
#         else:
#             self.second_player['name'] = player_name
#             self.second_player['ID'] = player_id

#     def set_player_id(self, client_id):
#         if not self.temporary_id:
#             self.temporary_id = client_id

#     def make_move(self, index: int, client_id):
#         if self.last_player == client_id:
#             return False

#         if self.board[index] is None:
#             self.board[index] = self.current_player
#             self.current_player = 'O' if self.current_player == 'X' else 'X'
#             self.last_player = client_id
#             return True

#         return False

#     def reset(self):
#         self.board = [None] * 9
#         self.current_player = 'X'

#     # def begin_game(self)

# game_state = GameState()

# # @app.get('/getUserName')
# # async def get_username():
# #     return {"message": 'data received!'}

# @app.get("/")
# async def read_root(request: Request):
#     return templates.TemplateResponse('inputName.html', {"request": request})

# @app.get("/game")
# async def read_game(request: Request):
#     return templates.TemplateResponse('gameLobby.html', {"request": request})

# @app.websocket("/ws/name/{client_id}")
# async def websocket_endpoint_client(websocket: WebSocket, client_id: str):
#     await manager.connect(websocket)
#     try:
#         while True:
#             player_data = await websocket.receive_text()
#             parsed_player_data = json.loads(player_data)
#             received_player_name = parsed_player_data[0]
#             received_player_id = parsed_player_data[1]
#             game_state.set_player_data(received_player_name, received_player_id)
#             game_state.set_player_id(client_id)
#             print("client ID name:", client_id)
#             await manager.broadcast(json.dumps({
#                 "message_type": "player_data",
#                 "first_player": game_state.first_player,
#                 "second_player": game_state.second_player,
#             }))
        
#     except WebSocketDisconnect:
#         manager.disconnect(websocket)
#         # await manager.broadcast(json.dumps({"message_type": "player_dc"}))
#         # await manager.reset()
#         # game_state.reset()


# @app.websocket("/ws/lobby/{client_id}")
# async def websocket_endpoint_client(websocket: WebSocket, client_id: str):
#     await manager.connect(websocket)
#     try:
#         while True:
#             # data = client_id
#             # print(data)
#             # print('printing client id')
#             player_index = await websocket.receive_text()
#             player_index = int(player_index)
#             # empty_board = game_state.is_board_empty(game_state.board)
            
#             await manager.broadcast(json.dumps({
#                 "message_type": "player_data",
#                 "first_player": game_state.first_player,
#                 "second_player": game_state.second_player,
#             }))
#             print(game_state.first_player)
            # print(game_state.second_player)
            # print("client ID lobby:", client_id)
      
            # if game_state.make_move(player_index, client_id):
            #     await manager.broadcast(json.dumps({
            #         "message_type": "game_state",
            #         "board": game_state.board,
            #         "currentPlayer": game_state.current_player,
            #         "connectionCount": manager.connection_count,
            #         "playerID": client_id,
            #         "playerIndex": player_index,
#                 }))

#     except WebSocketDisconnect:
#         manager.disconnect(websocket)
#         await manager.broadcast(json.dumps({"message_type": "player_dc"}))
#         await manager.reset()
#         game_state.reset()
#         game_state.first_player = {}
#         game_state.second_player = {}


from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
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
                    "message_type": "game_started"
                }))

        else:
            # await self.broadcast(json.dumps({
            #     "message_type": "full_room",
            #     "connectionCount": self.connection_count
            # }))
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
        self.first_player = {}
        self.second_player = {}
    
    def set_player_names(self, player_name: str, player_id: str):
        if not self.first_player:
            self.first_player['name'] = player_name
            self.first_player['ID'] = player_id
        else:
            self.second_player['name'] = player_name
            self.second_player['ID'] = player_id

    def set_player_ID(self, ID: str):
        if not self.current_ID:
            self.current_ID = ID
    
    def is_board_empty(board):
        return all(element is None for element in board)

    def make_move(self, index: int, client_id: str):        
        if self.current_ID == client_id:
            return False
        
        if self.board[index] is None:
            self.board[index] = self.current_player
            self.current_player = 'O' if self.current_player == 'X' else 'X'
            self.current_ID = client_id
            return True
        
        return False
    
    def reset(self):
        self.board = [None] * 9
        self.current_player = 'X'
        self.first_player = {}
        self.second_player = {}

# class GameData:
#     def __init__(self):
#         self.board = [None] * 9
#         self.current_player = 'X'
#         self.current_ID = None
#         self.last_player = 0
#         self.first_player = {}
#         self.second_player = {}
#         self.active_connections: list[WebSocket] = []
#         self.connection_count = 0
#     # setting up the board data
    
#     def set_player_names(self, player_name: str, player_id: str):
#         if not self.first_player:
#             self.first_player['name'] = player_name
#             self.first_player['ID'] = player_id
#         else:
#             self.second_player['name'] = player_name
#             self.second_player['ID'] = player_id

#     def set_player_ID(self, ID: str):
#         if not self.current_ID:
#             self.current_ID = ID
    
#     def is_board_empty(board):
#         return all(element is None for element in board)

#     def make_move(self, index: int, client_id: str):        
#         if self.current_ID == client_id:
#             return False
        
#         if self.board[index] is None:
#             self.board[index] = self.current_player
#             self.current_player = 'O' if self.current_player == 'X' else 'X'
#             self.current_ID = client_id
#             return True
        
#         return False
    
#     def reset(self):
#         self.board = [None] * 9
#         self.current_player = 'X'

#     # setting up the websocket connections

#     async def connect(self, websocket: WebSocket):
#         await websocket.accept()
#         self.connection_count += 1
#         if self.connection_count < 3:
#             self.active_connections.append(websocket)

#             if self.connection_count == 1:
#                 await self.broadcast(json.dumps({
#                     "message_type": "waiting_for_player"
#                 }))
#             # elif self.connection_count == 2 and self.is_board_empty(self.board):
#             #     await self.broadcast(json.dumps({
#             #         "message_type": "waiting_for_first_move",
#             #         "second_player_ID": self.second_player['ID'],
#             #     }))
#         if self.connection_count > 2:
#             await self.broadcast(json.dumps({
#                 "message_type": "full_room",
#                 "playerCount": self.connection_count
#             }))
#             await websocket.close(code=1000)
        
#     async def disconnect(self, websocket: WebSocket):
#         self.active_connections.remove(websocket)
#         self.connection_count = 0
#         self.first_name_sent = False
#         self.second_name_sent = False

#     async def broadcast(self, data: str):
#         for connection in self.active_connections:
#             await connection.send_text(data)
            
#     async def reset(self):
#         self.active_connections.clear()

# game_data = GameData()
        
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
    player_ID = data['playerID']
    game_state.set_player_names(player_name, player_ID)
    return {"message": [game_state.first_player, game_state.second_player]} 

@app.websocket('/ws/lobby/{client_id}')
async def websocket_endpoint_client(websocket: WebSocket, client_id: str):
    await connection_manager.connect(websocket)
    try:
        while True:
            await connection_manager.broadcast(json.dumps({
                "message_type": "player_data",
                "first_player": game_state.first_player,
                "second_player": game_state.second_player,
            }))
            player_index = await websocket.receive_text()
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

    except WebSocketDisconnect:
        await connection_manager.disconnect(websocket)
        await connection_manager.broadcast(json.dumps({"message_type": "player_dc"}))
        await connection_manager.reset()
        game_state.reset()