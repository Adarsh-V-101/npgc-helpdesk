const input = document.getElementById("userInput");
const sendBtn = document.querySelector(".send-btn");
const chatContainer = document.getElementById("chatContainer");

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
    const speed = 25; // typing speed

    const interval = setInterval(() => {
        bubble.textContent += text.charAt(i);
        i++;
        chatContainer.scrollTop = chatContainer.scrollHeight;

        if (i >= text.length) {
            clearInterval(interval);
        }
    }, speed);
}

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

submitFeedback.addEventListener("click", () => {
    const text = document.getElementById("feedbackText").value.trim();
    if (text) {
        alert("Thank you for your feedback!");
        document.getElementById("feedbackText").value = "";
    }
    feedbackModal.style.display = "none";
});
