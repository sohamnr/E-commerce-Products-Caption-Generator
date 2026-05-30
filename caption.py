import json

from google import genai
from google.genai import types


class GeminiCaptioner:
    def __init__(self, api_key: str | None, model: str):
        self.api_key = api_key
        self.model = model
        self.client = genai.Client(api_key=api_key) if api_key else None

    @staticmethod
    def _extract_json(text: str) -> dict:
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1 and end > start:
                return json.loads(text[start : end + 1])
            raise

    @staticmethod
    def _normalize(data: dict) -> dict:
        caption = str(data.get("caption") or "").strip()
        description = str(data.get("description") or "").strip()
        seo_keywords = data.get("seo_keywords") or ""
        category_tags = data.get("category_tags") or []

        if isinstance(seo_keywords, list):
            seo_keywords = ", ".join(str(item).strip() for item in seo_keywords if str(item).strip())

        if isinstance(category_tags, str):
            category_tags = [tag.strip() for tag in category_tags.split(",") if tag.strip()]
        elif not isinstance(category_tags, list):
            category_tags = []

        return {
            "caption": caption,
            "description": description,
            "seo_keywords": str(seo_keywords).strip(),
            "category_tags": [str(tag).strip() for tag in category_tags if str(tag).strip()],
        }

    def analyze_image(self, image_bytes: bytes, mime_type: str) -> dict:
        if self.client is None:
            raise RuntimeError("GEMINI_API_KEY is not configured.")

        prompt = (
            "Analyze this product image for an e-commerce listing. "
            "Return only valid JSON with exactly these keys: "
            "caption, description, seo_keywords, category_tags. "
            "caption must be one clear sentence. "
            "description must be 2-4 short product-focused paragraphs. "
            "seo_keywords must be a comma-separated string. "
            "category_tags must be an array of short tags."
        )

        image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
        response = self.client.models.generate_content(
            model=self.model,
            contents=[image_part, prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2,
            ),
        )

        return self._normalize(self._extract_json(response.text or "{}"))
