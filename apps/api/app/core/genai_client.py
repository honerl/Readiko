from abc import ABC, abstractmethod
from typing import Any
from google import genai
from google.genai.types import GenerateContentResponse
from openai import OpenAI
from openai.types.responses import Response
from .config import settings


class BaseGenAIClient(ABC):
    @abstractmethod
    def generate(self, prompt: str, json_schema: dict[str, Any] | None = None) -> str:
        raise NotImplementedError


class GeminiClient(BaseGenAIClient):
    def __init__(self) -> None:
        self.client = genai.Client(api_key=settings.gemini_api_key)

    def generate(self, prompt: str, json_schema: dict[str, Any] | None = None) -> str:
        _ = json_schema
        response: GenerateContentResponse = self.client.models.generate_content(  # type: ignore
            model=settings.llm_model,
            contents=prompt,
        )

        return response.text or ""


class OpenAiClient(BaseGenAIClient):
    def __init__(self) -> None:
        self.client = OpenAI(api_key=settings.openai_api_key)

    def generate(self, prompt: str, json_schema: dict[str, Any] | None = None) -> str:
        if json_schema:
            response: Response = self.client.responses.create(
                model=settings.llm_model,
                input=prompt,
                text={
                    "format": {
                        "type": "json_schema",
                        "name": json_schema.get("name", "response_schema"),
                        "schema": json_schema.get("schema", {}),
                        "strict": True,
                    }
                },
            )
        else:
            response: Response = self.client.responses.create(
                model=settings.llm_model,
                input=prompt,
            )

        return response.output_text


def get_genai_client() -> BaseGenAIClient:
    provider = settings.llm_provider.lower().strip()
    if provider == "gemini":
        return GeminiClient()
    elif provider == "openai":
        return OpenAiClient()

    raise ValueError(
        f"Unsupported LLM provider: '{settings.llm_provider}'. "
        "Configure LLM_PROVIDER=gemini|openai for now."
    )
