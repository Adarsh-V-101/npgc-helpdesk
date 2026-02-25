import os
from flask import Flask, redirect, request, jsonify, render_template
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
feedbackcsv_path = os.path.join(base_dir, "appfeedback.csv")

df = pd.read_csv(csv_path)
    
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
    # print(f"Received data: {data['message']}")
    user_query = apiCall.api_call(data.get("message", ""))
    # print(f"User query: {user_query}")
    user_query = user_query.lower()
    
    if not user_query:
        return jsonify({"reply": "Please ask a question."})

    user_vec = vectorizer.transform([user_query])
    similarity = cosine_similarity(user_vec, X)
    best_match = similarity.argmax()
    score = similarity[0][best_match]
    # print(similarity[0])  # debugging: print similarity scores for all questions
    # print(best_match)
    # print(score)

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
        if not os.path.exists(feedbackcsv_path):
            pd.DataFrame(columns=["Question"]).to_csv(feedbackcsv_path, index=False)

        feedback_df = pd.read_csv(feedbackcsv_path)

        new_entry = pd.DataFrame({"Question": [data['message']]})
        feedback_df = pd.concat([feedback_df, new_entry], ignore_index=True)
        feedback_df.to_csv(feedbackcsv_path, index=False)

        return jsonify({
            "reply": "Sorry, I couldn't understand that. Could you please rephrase?"
        })

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

@app.route("/admin")
def admin_panel():
    feedback_path = os.path.join(base_dir, "appfeedback.csv")

    if not os.path.exists(feedback_path):
        questions = []
    else:
        feedback_df = pd.read_csv(feedback_path)
        questions = feedback_df["Question"].tolist()
        print(questions)
    return render_template("admin.html", questions=questions)

def reload_model():
    global df, vectorizer, X
    df = pd.read_csv(csv_path)

    df["Question"] = df["Question"].fillna("").str.lower()
    df["Informational"] = df["Informational"].fillna("")
    df["Guidance oriented"] = df["Guidance oriented"].fillna("")
    df["Institutional"] = df["Institutional"].fillna("")
    df["Conversational"] = df["Conversational"].fillna("")

    vectorizer = TfidfVectorizer()
    X = vectorizer.fit_transform(df["Question"])

@app.route("/admin/submit", methods=["POST"])
def admin_submit():

    data = request.form
    question = data.get("question")
    informational = data.get("informational")
    guidance = data.get("guidance")
    institutional = data.get("institutional")
    conversational = data.get("conversational")

    # Load main database
    db_df = pd.read_csv(csv_path)

    new_row = pd.DataFrame([{
        "Question": question.lower(),
        "Informational": informational,
        "Guidance oriented": guidance,
        "Institutional": institutional,
        "Conversational": conversational
    }])

    db_df = pd.concat([db_df, new_row], ignore_index=True)
    db_df.to_csv(csv_path, index=False)

    # Remove from feedback.csv
    feedback_path = os.path.join(base_dir, "appfeedback.csv")
    feedback_df = pd.read_csv(feedback_path)
    feedback_df = feedback_df[feedback_df["Question"] != question]
    feedback_df.to_csv(feedback_path, index=False)

    reload_model()
    
    redirect_url = "/admin"

    return 'go back to admin panel '


if __name__ == "__main__":
    app.run(debug=True)
