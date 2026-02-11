import os
import requests
from dotenv import load_dotenv

def api_call(user_input):
    load_dotenv()

    key = os.getenv("API_KEY")
    sdk = Bytez(key)

    model = sdk.model("openai/gpt-4o")
    userquery = user_input+'analyse the sentence and give the exact intent of user i.e., keywords so that i retreive informatin from my db (just provide keywords and not the whole sentence)'
    results = model.run([
    {
        "role": "user",
        "content": userquery
    }
    ])
    res = results.output
    content = res.get('content', '')
    return content
