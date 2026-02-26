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

/* typing message*/
function typeMessage(text) {

    const wrapper = document.createElement("div");
    wrapper.classList.add("bot-wrapper");

    const bubble = document.createElement("div");
    bubble.classList.add("chat-bubble", "bot");

    const textDiv = document.createElement("div");
    textDiv.classList.add("bot-text");

    const actionsDiv = document.createElement("div");
    actionsDiv.classList.add("bot-actions");

    actionsDiv.innerHTML = `
    <span class="material-icons action-icon speak-btn">volume_up</span>
    <span class="material-icons action-icon copy-btn">content_copy</span>
    <span class="material-icons action-icon regen-btn">autorenew</span>
    <span class="material-icons action-icon like-btn">thumb_up</span>
    <span class="material-icons action-icon dislike-btn">thumb_down</span>
`;

    bubble.appendChild(textDiv);
    wrapper.appendChild(bubble);
    wrapper.appendChild(actionsDiv);
    chatContainer.appendChild(wrapper);

    let i = 0;
    const speed = 10;

    const interval = setInterval(() => {
        textDiv.textContent += text.charAt(i);
        i++;
        chatContainer.scrollTop = chatContainer.scrollHeight;

        if (i >= text.length) clearInterval(interval);

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

// copy + regenerate logic
document.addEventListener("click", function (e) {

    //  COPY 
    if (e.target.classList.contains("copy-btn")) {

        const icon = e.target;
        const bubble = icon.closest(".bot-wrapper");
        const text = bubble.querySelector(".bot-text").innerText;

        navigator.clipboard.writeText(text);

        const originalIcon = icon.textContent;

        // change icon to check
        icon.textContent = "check";
        icon.style.color = "green";

        const actionsDiv = icon.closest(".bot-actions");

        // remove old alert if exists
        const oldAlert = actionsDiv.querySelector(".copy-alert");
        if (oldAlert) oldAlert.remove();

        // create alert
        const alertDiv = document.createElement("div");
        alertDiv.classList.add("copy-alert");
        alertDiv.textContent = "Copied!";
        actionsDiv.appendChild(alertDiv);

        // small fade-in effect
        requestAnimationFrame(() => {
            alertDiv.style.opacity = "1";
        });

        // revert after 2 sec
        setTimeout(() => {
            icon.textContent = originalIcon;
            icon.style.color = "#54748b";
            alertDiv.remove();
        }, 2000);
    }


    // REGENERATE
    if (e.target.classList.contains("regen-btn")) {

        const wrapper = e.target.closest(".bot-wrapper");
        const textDiv = wrapper.querySelector(".bot-text");

        const lastUserMessages = document.querySelectorAll(".chat-bubble.user");

        if (lastUserMessages.length > 0) {

            const lastMessage =
                lastUserMessages[lastUserMessages.length - 1].innerText;

            showTypingDots();

            fetch("/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: lastMessage })
            })
                .then(res => res.json())
                .then(data => {

                    removeTypingDots();

                    // 👇 old text clear karo
                    textDiv.textContent = "";

                    // 👇 same bubble me typing effect
                    let i = 0;
                    const speed = 10;

                    const interval = setInterval(() => {
                        textDiv.textContent += data.reply.charAt(i);
                        i++;
                        chatContainer.scrollTop = chatContainer.scrollHeight;

                        if (i >= data.reply.length) clearInterval(interval);
                    }, speed);

                })
                .catch(err => {
                    removeTypingDots();
                    console.error(err);
                });
        }
    }

    // SPEAK
    if (e.target.classList.contains("speak-btn")) {

        const bubble = e.target.closest(".bot-wrapper");
        const text = bubble.querySelector(".bot-text").innerText;

        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = "en-IN";

        window.speechSynthesis.cancel(); // stop previous speech
        window.speechSynthesis.speak(speech);
    }
    // LIKE
    if (e.target.classList.contains("like-btn")) {

        const wrapper = e.target.closest(".bot-wrapper");

        const likeBtn = wrapper.querySelector(".like-btn");
        const dislikeBtn = wrapper.querySelector(".dislike-btn");

        // prevent multiple votes
        if (wrapper.dataset.voted) return;

        const lastUserMessages =
            document.querySelectorAll(".chat-bubble.user");

        if (lastUserMessages.length > 0) {

            const lastQuestion =
                lastUserMessages[lastUserMessages.length - 1].innerText;
            const answerText = wrapper.querySelector(".bot-text").innerText;

            fetch("/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },

                body: JSON.stringify({
                    type: "like",
                    question: lastQuestion,
                    answer: answerText
                })
            })
                .then(res => res.json())
                .then(() => {

                    wrapper.dataset.voted = "true";
                    likeBtn.style.pointerEvents = "none";
                    dislikeBtn.remove();   // 👈 remove dislike button

                    // change icon to filled version
                    likeBtn.textContent = "thumb_up";
                })
                .catch(err => console.error(err));
        }
    }


    // DISLIKE
    if (e.target.classList.contains("dislike-btn")) {

        const wrapper = e.target.closest(".bot-wrapper");

        const likeBtn = wrapper.querySelector(".like-btn");
        const dislikeBtn = wrapper.querySelector(".dislike-btn");

        // prevent multiple clicks
        if (wrapper.dataset.voted) return;

        const lastUserMessages =
            document.querySelectorAll(".chat-bubble.user");

        if (lastUserMessages.length > 0) {

            const lastQuestion =
                lastUserMessages[lastUserMessages.length - 1].innerText;
            const answerText = wrapper.querySelector(".bot-text").innerText;

            fetch("/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },

                body: JSON.stringify({
                    type: "dislike",
                    question: lastQuestion,
                    answer: answerText
                })
            })
                .then(res => res.json())
                .then(() => {
                    e.target.style.color = "red";

                    wrapper.dataset.voted = "true";
                    dislikeBtn.style.pointerEvents = "none";
                    likeBtn.remove();   // 👈 remove like button
                })
                .catch(err => console.error(err));
        }
    }


});


const menuBtn = document.getElementById("menuBtn");
const dropdown = document.getElementById("dropdownMenu");

menuBtn.addEventListener("click", () => {
    dropdown.style.display =
        dropdown.style.display === "flex" ? "none" : "flex";
});

document.addEventListener("click", (e) => {
    if (!e.target.closest(".menu-wrapper")) {
        dropdown.style.display = "none";
    }
});

document.getElementById("downloadChat").addEventListener("click", () => {

    const element = document.getElementById("chatContainer");

    // clone node
    const clone = element.cloneNode(true);

    clone.style.position = "static";
    clone.style.height = "auto";
    clone.style.maxHeight = "none";
    clone.style.overflow = "visible";

    document.body.appendChild(clone);

    const opt = {
        margin: 0.5,
        filename: 'NPGC_Chat.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(clone).save().then(() => {
        document.body.removeChild(clone);
    });

});

document.getElementById("adminPortal").addEventListener("click", () => {
    window.location.href = "/admin";
});

const scrollBtn = document.getElementById("scrollToBottom");

// show/hide on scroll
chatContainer.addEventListener("scroll", () => {

    const isAtBottom =
        chatContainer.scrollHeight - chatContainer.scrollTop
        <= chatContainer.clientHeight + 10;

    if (isAtBottom) {
        scrollBtn.style.display = "none";
    } else {
        scrollBtn.style.display = "flex";
    }
});

// scroll to bottom on click
scrollBtn.addEventListener("click", () => {
    chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: "smooth"
    });
});
