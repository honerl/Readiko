from google import genai
from .config import settings

class GeminiClient:
    def __init__(self):
        self.client = genai.Client(
                api_key=settings.gemini_api_key
            )
        
    def generate(self, prompt: str) -> str:
        # Call the Gemini API
        response = self.client.models.generate_content(
            model="gemini-2.5-flash",  # Change to your preferred Gemini model
            contents=prompt
        )
        
        return response.text
