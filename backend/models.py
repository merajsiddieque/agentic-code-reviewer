import os
import warnings
from pathlib import Path
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

# Suppress harmless SDK deprecation notices
warnings.filterwarnings("ignore", category=UserWarning, module="google.genai")
warnings.filterwarnings("ignore", message=".*Direct use of automatic function calling.*")

# Absolute path to backend/.env
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    raise ValueError("GOOGLE_API_KEY not found in backend/.env")

model_name = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")

llm = ChatGoogleGenerativeAI(
    model=model_name,
    google_api_key=api_key,
)