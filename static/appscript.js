const input = document.getElementById("userInput");
const sendBtn = document.querySelector(".send-btn");
const chatContainer = document.getElementById("chatContainer");
const micBtn = document.getElementById("micBtn");



/* inserting random welcome text */
const welcomeMessages = [
    "Hey, Ready to dive in?",
    "Hello! How can I help you today?",
    "Welcome to NPGC Helpdesk 👋",
    "Ask me anything about NPGC!",
    "Hi there! I'm here to assist you."
];

let firstMessageSent = false;

// prints random welcome
const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
appendMessage(welcomeMessages[randomIndex], "bot");

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
});

/* sending message */
function sendMessage() {
    const message = input.value.trim();
    if (!message) return;

    // // remove welcome on first message
    // if (!firstMessageSent) {
    //     const firstBotMsg = document.querySelector(".chat-bubble.bot");
    //     if (firstBotMsg) firstBotMsg.remove();
    //     firstMessageSent = true;
    // }

    appendMessage(message, "user");
    input.value = "";

    showTypingDots();

    fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
    })
        .then(res => res.json())
        // thinking time
        .then(data => {
            const baseDelay = 400;
            const extraDelay = data.reply.length * 10; // text length ke hisaab se
            const thinkingTime = Math.min(baseDelay + extraDelay, 1500);

            setTimeout(() => {
                removeTypingDots();
                typeMessage(data.reply);
            }, thinkingTime);
        })


        .catch(err => {
            removeTypingDots();
            console.error(err);
        });
}

/* append normal message */
function appendMessage(text, sender) {
    const bubble = document.createElement("div");
    bubble.classList.add("chat-bubble", sender);
    bubble.textContent = text;
    chatContainer.appendChild(bubble);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

/* loading dots */
function showTypingDots() {
    const typingDiv = document.createElement("div");
    typingDiv.classList.add("typing");
    typingDiv.id = "typingIndicator";

    typingDiv.innerHTML = `
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
    `;

    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function removeTypingDots() {
    const typing = document.getElementById("typingIndicator");
    if (typing) typing.remove();
}

/* typing animation*/
function typeMessage(text) {
    const bubble = document.createElement("div");
    bubble.classList.add("chat-bubble", "bot");
    chatContainer.appendChild(bubble);

    let i = 0;
    const speed = 10; // typing speed

    const interval = setInterval(() => {
        bubble.textContent += text.charAt(i);
        i++;
        chatContainer.scrollTop = chatContainer.scrollHeight;

        if (i >= text.length) {
            clearInterval(interval);
        }
    }, speed);
}

// suggest questions
const suggestedQuestions = [
    "Who is the principal of the college",
    "What companies visit for campus placements?",
    "Can I pay my fees online",
    "List the PG course I can apply for",
    "Does npgc have study centers for distance learning",
    "Is there any specialization course I can apply for",
    "what documents are required for admission?",
    "How to see/check result on website",
    "What is the exam schedule/timetable?",
    "What are the office working hours",
    "how can i borrow books from library?",
    "what are the sports facilities in college?"
];
const suggestionBox = document.getElementById("suggestions");

function showSuggestions() {
    suggestionBox.innerHTML = "";
    const shuffled = suggestedQuestions.sort(() => 0.5 - Math.random());
    shuffled.slice(0, 4).forEach(q => {
        const div = document.createElement("div");
        div.className = "suggestion";
        div.textContent = q;
        div.onclick = () => {
            suggestionBox.innerHTML = "";
            input.value = q;
            sendMessage();
        };
        suggestionBox.appendChild(div);
    });
}

showSuggestions();
input.addEventListener("focus", () => {
    suggestionBox.innerHTML = "";
});


/* feedback box*/
const feedbackBtn = document.getElementById("feedbackBtn");
const feedbackModal = document.getElementById("feedbackModal");
const closeModal = document.getElementById("closeModal");
const submitFeedback = document.getElementById("submitFeedback");

// feedbackBtn.addEventListener("click", () => {
//     feedbackModal.style.display = "block";
// });

feedbackBtn.addEventListener("click", () => {
    window.open(
        "https://docs.google.com/forms/d/e/1FAIpQLSe2yn9_WaIjZmkVbAvpuLEY70YELvEoOaVmfbBYSC7aNkmzJA/viewform",
        "_blank"
    );
});


closeModal.addEventListener("click", () => {
    feedbackModal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === feedbackModal) {
        feedbackModal.style.display = "none";
    }
});



// submitFeedback.addEventListener("click", () => {
//     const text = document.getElementById("feedbackText").value.trim();
//     if (!text) return;

//     fetch("/feedback", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ feedback: text })
//     })
//         .then(res => res.json())
//         .then(() => {
//             alert("Thank you for your feedback!");
//             document.getElementById("feedbackText").value = "";
//             feedbackModal.style.display = "none";
//         });
// });

// mic visibility logic
// input.addEventListener("input", () => {
//     if (input.value.trim() !== "") {
//         micBtn.classList.add("mic-hidden");
//     } else {
//         micBtn.classList.remove("mic-hidden");
//     }
// });

// speech recognition
const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

let isListening = false;
let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;

    micBtn.addEventListener("click", () => {
        suggestionBox.innerHTML = "";
        if (!isListening) {
            recognition.start();
            micBtn.classList.add("mic-listening");
            isListening = true;
        } else {
            recognition.stop();
            micBtn.classList.remove("mic-listening");
            isListening = false;
        }
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        input.value = transcript;
    };

    recognition.onend = () => {
        micBtn.classList.remove("mic-listening");
        isListening = false;
    };

} else {
    micBtn.style.display = "none";
}

