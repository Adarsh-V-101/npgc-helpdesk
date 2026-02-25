import pandas as pd
import numpy as np
import faiss
from app.model import model

# Load dataset
df = pd.read_csv("database.csv")
df["Question"] = df["Question"].fillna("").str.lower()

questions = df["Question"].tolist()

# Create embeddings
embeddings = model.encode(questions)

dimension = embeddings.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(np.array(embeddings))


def search(query: str, top_k: int = 3):
    query_vec = model.encode([query])
    distances, indices = index.search(np.array(query_vec), top_k)

    results = []

    for i, idx in enumerate(indices[0]):
        results.append({
            "question": df.iloc[idx]["Question"],
            "answer": df.iloc[idx]["Informational"],
            "score": float(distances[0][i])
        })

    return results