# backend/test_model.py

# pyrefly: ignore [missing-import]
from .models import llm

response = llm.invoke("Say hello in one sentence.")
print(response.content)