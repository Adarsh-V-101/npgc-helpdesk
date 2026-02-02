import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import random
import math

app = Flask(__name__)
CORS(app)

# loading files
base_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(base_dir, "QnA.csv")

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

# context memory
last_best_match = None   # stores last matched row index

# routes
@app.route("/")
def home():
    return render_template("appindex.html")

@app.route("/chat", methods=["POST"])
def chat():
    global last_best_match

    data = request.get_json()
    user_query = data.get("message", "").strip()
    user_query = user_query.lower()
    
    if not user_query:
        return jsonify({"reply": "Please ask a question."})

    user_vec = vectorizer.transform([user_query])
    similarity = cosine_similarity(user_vec, X)
    best_match = similarity.argmax()
    score = similarity[0][best_match]

    # contexaat handling
    if score > 0.3:
        last_best_match = best_match
        selected_index = best_match
    else:
        if last_best_match is not None:
            selected_index = last_best_match
        else:
            return jsonify({
                "reply": "Sorry, I couldn't understand that. Could you please rephrase?"
            })

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

    # for empty answers
    if (
        answer is None
        or isinstance(answer, float) and math.isnan(answer)
        or str(answer).strip() == ""
    ):
        answer = "This information is currently unavailable. Please ask something else."

    return jsonify({"reply": answer})


if __name__ == "__main__":
    app.run(debug=True)
