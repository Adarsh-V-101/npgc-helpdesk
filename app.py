import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import random
import math
import apiCall

app = Flask(__name__)
CORS(app)

# loading files
base_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(base_dir, "database.csv")

df = pd.read_csv(csv_path)
    
# handle NaN in all required columns
df["Question"] = df["Question"].fillna("")
df["Question"] = df["Question"].str.lower()
df["Informational"] = df["Informational"].fillna("")
df["Guidance oriented"] = df["Guidance oriented"].fillna("")
df["Institutional"] = df["Institutional"].fillna("")
df["Conversational"] = df["Conversational"].fillna("")

vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(df["Question"])

# routes
@app.route("/")
def home():
    return render_template("appindex.html")

@app.route("/chat", methods=["POST"])
def chat():

    data = request.get_json()
    user_query = apiCall.api_call(data.get("message", ""))
    # user_query = data.get("message", "").strip()
    user_query = user_query.lower()
    
    if not user_query:
        return jsonify({"reply": "Please ask a question."})

    user_vec = vectorizer.transform([user_query])
    similarity = cosine_similarity(user_vec, X)
    best_match = similarity.argmax()
    score = similarity[0][best_match]
    print(similarity[0])
    print(best_match)
    print(score)

    if score > 0.3:
        selected_index = best_match
         # random answer
        rand_num = random.randint(1, 4)

        if rand_num == 1:
            answer = df["Informational"][selected_index]
        elif rand_num == 2:
            answer = df["Guidance oriented"][selected_index]
        elif rand_num == 3:
            answer = df["Institutional"][selected_index]
        else:
            answer = df["Conversational"][selected_index]

    else:
        return jsonify({
            "reply": "Sorry, I couldn't understand that. Could you please rephrase?"
        })

    # for empty answers
    if (
        answer is None
        or isinstance(answer, float) and math.isnan(answer)
        or str(answer).strip() == ""
    ):
        answer = "This information is currently unavailable. Please ask something else."

    # print(f"User query: {user_query}")
    # print(selected_index)
    # print(f"Selected answer: {answer}")

    return jsonify({"reply": answer})


if __name__ == "__main__":
    app.run(debug=True)
