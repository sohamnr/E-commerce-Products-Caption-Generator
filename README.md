# E-commerce-Products-Caption-Generator
App that sends uploaded product images to Gemini and returns:

- caption
- product description
- SEO keywords
- category tags

The project is cloud-only. It does not download or run BLIP, Torch, spaCy, Hugging Face, or any local ML model.

## Requirements

- Python 3.9+
- Gemini API key

## Setup

1. Create and activate a virtual environment.

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install dependencies.

```powershell
pip install -r requirements.txt
```

3. Add your Gemini API key to `.env`.

```text
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=your_model_here
MAX_UPLOAD_BYTES=10485760
```

4. Run the server.

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

5. Open this one browser URL.

```text
http://localhost:8000
```

## Notes

- You can switch models by changing `GEMINI_MODEL` in `.env`.
- Inline image uploads are limited to 10 MB by default.
- The app returns a `502` response if Gemini rejects the request, the key is invalid, or your free-tier quota is exhausted.
