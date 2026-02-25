import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import math

app = Flask(__name__)
CORS(app)

# Load dataset
base_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(base_dir, "database.csv")

df = pd.read_csv(csv_path)

# Clean data
df["Question"] = df["Question"].fillna("").str.lower()
df["Informational"] = df["Informational"].fillna("")
df["Guidance oriented"] = df["Guidance oriented"].fillna("")
df["Institutional"] = df["Institutional"].fillna("")
df["Conversational"] = df["Conversational"].fillna("")

# Load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Precompute question embeddings
questions = df["Question"].tolist()
question_embeddings = model.encode(questions)


@app.route("/")
def home():
    return render_template("appindex.html")


@app.route("/chat", methods=["POST"])
def chat():

    data = request.get_json()
    user_query = data.get("message", "").strip().lower()

    if not user_query:
        return jsonify({"reply": "Please ask a question."})

    # Encode query
    query_embedding = model.encode([user_query])

    # Compute similarity
    similarities = cosine_similarity(query_embedding, question_embeddings)[0]

    # Get top 3 matches
    top_indices = similarities.argsort()[-3:][::-1]
    top_score = similarities[top_indices[0]]
    second_score = similarities[top_indices[1]]

    # Confidence logic
    if top_score < 0.55:
        return jsonify({
            "reply": "I couldn't find a confident match. Are you asking about admissions, scholarships, exams, or hostel services?"
        })

    if abs(top_score - second_score) < 0.05:
        return jsonify({
            "reply": "Your question seems ambiguous. Could you clarify a bit more?"
        })

    selected_index = top_indices[0]
    row = df.iloc[selected_index]

    # Deterministic answer priority
    if row["Informational"]:
        answer = row["Informational"]
    elif row["Guidance oriented"]:
        answer = row["Guidance oriented"]
    elif row["Institutional"]:
        answer = row["Institutional"]
    else:
        answer = row["Conversational"]

    if not answer.strip():
        answer = "This information is currently unavailable. Please contact administration."

    return jsonify({"reply": answer})


if __name__ == "__main__":
    app.run(debug=True)