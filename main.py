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

# box_data = BoxData()

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
            # add game logic here
            index = int(data)
            if game_state.make_move(index, client_id):
                await manager.broadcast(json.dumps({"board": game_state.board, "currentPlayer": game_state.current_player}))
            # await manager.send_personal_message(f"You wrote: {data}", websocket)
            # await manager.broadcast(f"Client #{client_id} says: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        # game_state.board = []
        # game_state.board = [None] * 9
        # game_state.current_player = 'X'
        await manager.reset()
        game_state.reset()
        await manager.broadcast(f"Client #{client_id} has left the chat")






