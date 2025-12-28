import pandas as pd
import streamlit as st
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Load data
df = pd.read_csv("college_faq.csv")

# Vectorization
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(df["Question"])

# UI
st.title("🎓 College Information Chatbot")

if "history" not in st.session_state:
    st.session_state.history = []

user_query = st.text_input("Ask your question:")

if user_query:
    st.session_state.history.append(("You:", user_query))

if user_query:
    user_vec = vectorizer.transform([user_query])
    similarity = cosine_similarity(user_vec, X)
    best_match = similarity.argmax()
    score = similarity[0][best_match]

    if score > 0.3:
        st.write("**Answer:**", df["Answers"][best_match])
        st.write(f"Confidence: {score:.2f}")
        st.session_state.history.append(("Bot", df["answers"][best_match]))


    else:
        st.write("Sorry, I don't have that information right now.")
        st.write("Please contact the college office for accurate details.")
st.markdown("---")
for sender, msg in st.session_state.history:
    st.write(f"**{sender}:** {msg}")
