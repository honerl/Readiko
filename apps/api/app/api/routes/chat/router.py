from fastapi import APIRouter, WebSocket
from .schemas import ChatRequest, ChatResponse
from .controller import ChatController
from app.core.chat_service import ChatService

import json

router = APIRouter()
chat_service = ChatService()

#Rest Endpoint
@router.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    reply = chat_service.generate_response(request.user_id, request.messages)
    return ChatResponse(response=reply)

#Websocket endpoint
@router.websocket("/")
async def websocket_chat(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)

            user_id = payload["user_id"]
            messages = payload["messages"]  

            stream = chat_service.stream_reply(user_id, messages)

            for chunk in stream:
                await websocket.send_text(chunk)
            
            await websocket.send_text("[DONE]")
    except Exception as e:
        await websocket.close(code=1000, reason=str(e))