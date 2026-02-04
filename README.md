# ML Chatbot 

A simple **Machine Learning + NLP based chatbot prototype** built in Python.
This project demonstrates how a chatbot can answer user queries using a **QnA dataset** and basic NLP techniques, wrapped with a minimal web interface.

---

## 📌 Features

* Text‑based chatbot using a custom **QnA dataset (CSV)**
* Basic NLP preprocessing and similarity matching
* Simple web interface (HTML, CSS, JavaScript)
* Modular Python code structure
* Easy to extend with better ML models or vector search

---

## 🗂 Project Structure

```
ML-chatbot/
│
├── appChat.py              # Main application entry point
├── modelSourceCode.py      # NLP / ML logic for chatbot responses
├── prototype.py            # Experimental / testing script
├── QnA.csv                 # Question–Answer dataset
│
├── templates/              # HTML templates
│   └── index.html
│
├── static/                 # CSS & JavaScript files
│   ├── style.css
│   └── script.js
│
├── requirements.txt        # Python dependencies
└── README.md               # Project documentation
```

---

## ⚙️ How It Works (High‑Level)

1. User enters a question through the UI.
2. The input text is preprocessed (cleaning, tokenization, etc.).
3. The chatbot compares the input with questions stored in `QnA.csv`.
4. The most relevant answer is selected and returned to the user.

This is a **rule / similarity‑based ML approach**, not a generative LLM.

---

## 🚀 Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Adarsh-V-101/ML-chatbot.git
cd ML-chatbot
```

### 2️⃣ Create a virtual environment (recommended)

```bash
python -m venv venv
source venv/bin/activate      # On Linux / macOS
venv\Scripts\activate         # On Windows
```

### 3️⃣ Install dependencies

```bash
pip install -r requirements.txt
```

### 4️⃣ Run the application

```bash
python appChat.py
```

Open your browser and visit the local server URL shown in the terminal.

---

## 🧪 Example Use Case

**User:** What is machine learning?
**Bot:** Machine learning is a subset of AI that allows systems to learn from data and improve over time.

---


This project is ideal for:

* Understanding chatbot fundamentals
* Practicing NLP pipelines
* Learning ML‑driven information retrieval
* Building portfolio‑ready ML prototypes

---

**Adarsh Vishwakarma**
GitHub: [https://github.com/Adarsh-V-101](https://github.com/Adarsh-V-101)

---

This project is open‑source and free to use for educational purposes.
