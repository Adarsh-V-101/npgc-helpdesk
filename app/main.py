from fastapi import FastAPI
from pydantic import BaseModel
from app.retriever import search
import datetime

app = FastAPI()


class Query(BaseModel):
    message: str


@app.post("/chat")
def chat(query: Query):

    user_query = query.message.strip().lower()

    if not user_query:
        return {"reply": "Please ask a valid question."}

    results = search(user_query)

    best = results[0]

    # Lower distance = better match
    if best["score"] > 1.2:
        return {"reply": "I couldn't confidently understand that. Please rephrase."}

    return {
        "reply": best["answer"],
        "confidence_score": best["score"],
        "timestamp": str(datetime.datetime.now())
    }