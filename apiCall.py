from bytez import Bytez
import os
from dotenv import load_dotenv

def api_call(user_input):
    load_dotenv()
    # print(user_input)
    key = os.getenv("API_KEY")
    sdk = Bytez(key)

    model = sdk.model("openai/gpt-4o")
    userquery = f'''Fix spelling. Extract core intent keywords for DB retrieval.
    Return only keywords in English with 2 common synonyms each.
    Input: {user_input}'''

    results = model.run([
    {
        "role": "user",
        "content": userquery
    }
    ])
    res = results.output
    content = res.get('content', '')
    return content
