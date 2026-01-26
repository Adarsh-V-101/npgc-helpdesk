import pandas as pd
import streamlit as st
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import random

# Load data
df = pd.read_csv("QnA.csv")
df['Question'] = df["Question"].fillna('')

# Vectorization
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(df["Question"])
# UI
st.title("National Post Graduate College")

if "history" not in st.session_state:
    st.session_state.history = []

user_query = st.text_input("Ask your question:")
if user_query:
    st.session_state.history.append(("You:", user_query))
    user_vec = vectorizer.transform([user_query])
    similarity = cosine_similarity(user_vec, X)
    best_match = similarity.argmax()
    score = similarity[0][best_match]

    if score > 0.3:
        randNum = random.randint(1,4)
        match randNum:
            case 1:
                st.write("**Answer:**", df["Informational"][best_match])
                st.session_state.history.append(("Bot", df["Informational"][best_match]))                       
            case 2:
                st.write("**Answer:**", df["Guidance oriented"][best_match])
                st.session_state.history.append(("Bot", df["Guidance oriented"][best_match]))                       
            case 3:
                st.write("**Answer:**", df["Institutional"][best_match])
                st.session_state.history.append(("Bot", df["Institutional"][best_match]))                       
            case 4:
                st.write("**Answer:**", df["Conversational"][best_match])
                st.session_state.history.append(("Bot", df["Conversational"][best_match]))                       


    else:
        st.write("Sorry, I don't have that information right now.")
        st.write("Please contact the college office for accurate details.")
st.markdown("---")
for sender, msg in st.session_state.history:
    st.write(f"**{sender}:** {msg}")

st.markdown("---")
st.markdown(
    """
    ### 📝 Feedback
    Help us improve this chatbot by sharing your feedback 👇  
    [Click here to give feedback](https://docs.google.com/forms/d/e/1FAIpQLSe2yn9_WaIjZmkVbAvpuLEY70YELvEoOaVmfbBYSC7aNkmzJA/viewform?usp=header)
    """,
    unsafe_allow_html=True,
)


# hitting api