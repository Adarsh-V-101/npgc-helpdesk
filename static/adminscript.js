// Load Q&A from backend
function loadQADatabase() {
    fetch("/admin/submit")   // later Flask route
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector("#qaTable tbody");
            tbody.innerHTML = "";

            data.forEach(item => {
                const row = `
                    <tr>
                        <td>${item.question}</td>
                        <td>${item.answer}</td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        });
}

// Load Feedback from backend
function loadFeedbackDatabase() {
    fetch("/get-feedback")   // later Flask route
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector("#feedbackTable tbody");
            tbody.innerHTML = "";

            data.forEach(item => {
                const row = `
                    <tr>
                        <td>${item.message}</td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        });
}

// Add Q&A
function addQA() {
    const question = document.getElementById("question").value.trim();
    const answer = document.getElementById("answer").value.trim();

    if (!question || !answer) {
        alert("Both fields required.");
        return;
    }

    fetch("/add-qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer })
    })
        .then(res => res.json())
        .then(() => {
            document.getElementById("question").value = "";
            document.getElementById("answer").value = "";
            loadQADatabase();
        });
}

// Initial load
loadQADatabase();
loadFeedbackDatabase();
