from bytez import Bytez
import os
from dotenv import load_dotenv

def api_call(user_input):
    load_dotenv()
    print(user_input)
    key = os.getenv("API_KEY")
    sdk = Bytez(key)

    model = sdk.model("openai/gpt-4o")
    userquery = f"filter the sentence,fix the spellings and give the exact intent of user i.e., keywords so that i retreive informatin from my db (just provide keywords in english and not the whole sentence), sentence=[ {user_input} ]"
    results = model.run([
    {
        "role": "user",
        "content": userquery
    }
    ])
    res = results.output
    content = res.get('content', '')
    return content
