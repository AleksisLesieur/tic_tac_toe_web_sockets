from typing import Optional, List
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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


class BoxData(BaseModel):
    cell_1_1: Optional[str] = None
    cell_1_2: Optional[str] = None
    cell_1_3: Optional[str] = None
    cell_1_4: Optional[str] = None
    cell_1_5: Optional[str] = None
    cell_1_6: Optional[str] = None
    cell_1_7: Optional[str] = None
    cell_1_8: Optional[str] = None
    cell_1_9: Optional[str] = None


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

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
        self.first_player = False
        self.second_player = False
        self.temporary_id = None
        # self.player2_id = None

    def set_player_id(self, client_id):
        if not self.temporary_id:
            self.temporary_id = client_id
        # elif not self.player2_id and self.player1_id != client_id:
        #     self.player2_id = client_id

    def switch_player(self, current_id):
        self.first_player = self.temporary_id < current_id
        self.second_player = self.temporary_id >= current_id

    def make_move(self, index: int, client_id):
        if self.last_player == client_id:
            return False

        if self.board[index] is None:
            self.board[index] = self.current_player
            self.current_player = 'O' if self.current_player == 'X' else 'X'
            self.last_player = client_id
            return True

        return False

    def reset(self):
        self.board = [None] * 9
        self.current_player = 'X'

game_state = GameState()


@app.get("/")
async def read_root(request: Request):
    return templates.TemplateResponse('index.html', {"request": request})


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await manager.connect(websocket)
    print(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            array_data = json.loads(data)
            # add game logic here
            print(array_data)
            index = int(array_data[0])
            received_client_id = int(array_data[1])
            game_state.set_player_id(received_client_id)
            game_state.switch_player(received_client_id)
            print(game_state.first_player, game_state.second_player)
            if game_state.make_move(index, client_id):
                await manager.broadcast(json.dumps(
                    {"board": game_state.board, "currentPlayer": game_state.current_player,
                     "firstPlayer": game_state.first_player, "secondPlayer": game_state.second_player}))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.reset()
        await manager.broadcast(json.dumps({"type": "disconnection", "message": f"Player {client_id} disconnected"}))
        game_state.reset()
