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
        self.first_move = 0

    async def register_names(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        if self.connection_count < 2:
            self.active_connections.append(websocket)
            self.connection_count += 1

            if self.connection_count == 1:
                await self.broadcast(json.dumps({
                    "message_type": "waiting_for_player"
                }))

        else:
            await websocket.send_text(json.dumps({
                    "message_type": "full_room"
                }))
            await websocket.close(code=1000)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        self.connection_count = 0

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, data: str):
        for connection in self.active_connections:
            await connection.send_text(data)

    async def reset(self):
        self.active_connections.clear()

manager = ConnectionManager()

class GameState:
    def __init__(self):
        self.board = [None] * 9
        self.current_player = 'X'
        self.last_player = None
        self.temporary_id = None
        self.first_name = ''
        self.second_name = ''

    def set_player_name(self, player_name: str):
        if self.first_name == '':
            self.first_name = player_name
        else:
            self.second_name = player_name

    def set_player_id(self, client_id):
        if not self.temporary_id:
            self.temporary_id = client_id

    def make_move(self, index: int, client_id):
        # if self.last_player == client_id:
        #     return False

        if self.board[index] is None:
            self.board[index] = self.current_player
            self.current_player = 'O' if self.current_player == 'X' else 'X'
            self.last_player = client_id
            return True

        return False

    def reset(self):
        self.board = [None] * 9
        self.current_player = 'X'

    # def begin_game(self)

game_state = GameState()

# @app.get('/getUserName')
# async def get_username():
#     return {"message": 'data received!'}

@app.get("/")
async def read_root(request: Request):
    return templates.TemplateResponse('playerName.html', {"request": request})

@app.get("/game")
async def read_game(request: Request):
    return templates.TemplateResponse('index.html', {"request": request})

@app.websocket("/ws/user/{user_name}")
async def websocket_endpoint_user(websocket: WebSocket, user_name: str):
    await manager.connect(websocket)
    while True:
        name = await websocket.receive_text()
        game_state.set_player_name(name)
        print(name)
        print(game_state.first_name)
        print(game_state.second_name)
        if (game_state.first_name or game_state.second_name):
            await manager.broadcast(json.dumps({
                "message_type": "player_names",
                "firstName": game_state.first_name,
                "secondName": game_state.second_name,
            }))

@app.websocket("/ws/lobby/{client_id}")
async def websocket_endpoint_client(websocket: WebSocket, client_id: str):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            array_data = json.loads(data)
            index = int(array_data[0])
            received_client_id = array_data[1]
            game_state.set_player_id(received_client_id)

            if game_state.make_move(index, client_id):
                await manager.broadcast(json.dumps({
                    "message_type": "game_state",
                    "board": game_state.board,
                    "currentPlayer": game_state.current_player,
                    "playerId": received_client_id,
                    "connectionCount": manager.connection_count,
                    "playerIndex": index,
                }))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(json.dumps({"message_type": "player_dc"}))
        await manager.reset()
        game_state.reset()


