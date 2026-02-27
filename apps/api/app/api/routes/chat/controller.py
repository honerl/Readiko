from fastapi import HTTPException
from app.core.chat_service import ChatService

chat_service = ChatService()

class ChatController:

    @staticmethod
    def chat(request):
        try:
            reply = chat_service.generate_response(
                user_id=request.user_id,
                messages=request.messages
            )
            return {"response":reply}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))