from collections import defaultdict
from time import time
from app.core.genai_client import GeminiClient
from app.core.config import settings

class ChatService:
    def __init__(self):
        self.client = GeminiClient()
        self.rate_limits = defaultdict(list)

    def generate_response(self, user_id: str, messages: list) -> str:
        prompt= ""
        for msg in messages:
            prompt += f"{msg.role.upper()}: {msg.content}\n"

        return self.client.generate(prompt)
    
    def stream_reply(self, user_id: str, messages: list):
        reply = self.generate_response(user_id, messages)
        for line in reply.split("\n"):
            yield line