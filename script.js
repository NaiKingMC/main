const quiz = document.getElementById("biologyQuiz");
const resultTitle = document.getElementById("resultTitle");
const scoreDisplay = document.getElementById("score");
const feedback = document.getElementById("feedback");
const scoreBar = document.getElementById("scoreBar");
const answeredCount = document.getElementById("answeredCount");
const reviewButton = document.getElementById("reviewButton");

const answerKey = {
    q1: { type: "radio", answer: "nucleus", explanation: "Most DNA in a typical eukaryotic cell is in the nucleus." },
    q2: { type: "checkbox", answer: ["DNA", "RNA"], explanation: "DNA and RNA are the two nucleic acids." },
    q3: { type: "radio", answer: "transcription", explanation: "Transcription uses a DNA template to make RNA." },
    q4: { type: "checkbox", answer: ["nucleus", "ribosome"], explanation: "The nucleus and ribosome are cell structures called organelles." },
    q5: { type: "radio", answer: "mitochondria", explanation: "Mitochondria produce most ATP in many eukaryotic cells." },
    q6: { type: "radio", answer: "DNA", explanation: "DNA stores hereditary genetic information." },
    q7: { type: "select", answer: "deoxyribose", explanation: "DNA contains deoxyribose sugar; RNA contains ribose." },
    q8: { type: "radio", answer: "translation", explanation: "Translation uses an mRNA message to build a protein." },
    q9: { type: "radio", answer: "photosynthesis", explanation: "Photosynthesis uses light energy to make sugars." },
    q10: { type: "radio", answer: "cell", explanation: "The cell is the basic unit of life." }
};

function getAnswer(questionName, question) {
    if (question.type === "checkbox") {
        return Array.from(quiz.querySelectorAll(`input[name="${questionName}"]:checked`)).map(input => input.value).sort();
    }
    if (question.type === "select") {
        return document.getElementById(questionName).value;
    }
    return quiz.querySelector(`input[name="${questionName}"]:checked`)?.value ?? "";
}

function isCorrect(actual, expected, type) {
    if (type === "checkbox") {
        return actual.length === expected.length && actual.every((value, index) => value === [...expected].sort()[index]);
    }
    return actual === expected;
}

function updateAnsweredCount() {
    let answered = 0;
    for (const [name, question] of Object.entries(answerKey)) {
        const answer = getAnswer(name, question);
        if (Array.isArray(answer) ? answer.length > 0 : answer !== "") answered++;
    }
    answeredCount.textContent = `${answered} of ${Object.keys(answerKey).length} questions answered`;
}

quiz.addEventListener("change", updateAnsweredCount);

quiz.addEventListener("submit", function(event) {
    event.preventDefault();
    let score = 0;
    let missed = [];

    for (const [name, question] of Object.entries(answerKey)) {
        const actual = getAnswer(name, question);
        const correct = isCorrect(actual, question.answer, question.type);
        const fieldset = quiz.querySelector(`[name="${name}"]`)?.closest("fieldset") || document.getElementById(name)?.closest("fieldset");
        fieldset.classList.remove("correct-answer", "wrong-answer");

        if (correct) {
            score++;
            fieldset.classList.add("correct-answer");
        } else {
            fieldset.classList.add("wrong-answer");
            missed.push({ name, explanation: question.explanation });
        }
    }

    scoreDisplay.textContent = score;
    scoreBar.style.width = `${score * 10}%`;
    resultTitle.textContent = score === 10 ? "Perfect score!" : score >= 7 ? "Great work!" : score >= 5 ? "Good start!" : "Keep practicing!";
    feedback.textContent = score === 10
        ? "You got every question right. Excellent biology work!"
        : `You got ${score} out of 10. Review the highlighted questions and try again.`;
    answeredCount.textContent = `${Object.keys(answerKey).length} of ${Object.keys(answerKey).length} questions graded`;
    reviewButton.hidden = missed.length === 0;
    reviewButton.dataset.missed = JSON.stringify(missed);

    const oldReview = document.getElementById("reviewNotes");
    if (oldReview) oldReview.remove();
    if (missed.length) {
        const review = document.createElement("div");
        review.id = "reviewNotes";
        review.className = "review-notes";
        const heading = document.createElement("h4");
        heading.textContent = "Review these ideas";
        review.appendChild(heading);
        missed.forEach(item => {
            const p = document.createElement("p");
            p.textContent = `${item.name.toUpperCase()}: ${item.explanation}`;
            review.appendChild(p);
        });
        document.querySelector(".result-card").appendChild(review);
    }
    document.querySelector(".result-card").scrollIntoView({ behavior: "smooth", block: "nearest" });
});

reviewButton.addEventListener("click", function() {
    const missed = JSON.parse(reviewButton.dataset.missed || "[]");
    if (!missed.length) return;
    const first = quiz.querySelector(`[name="${missed[0].name}"]`)?.closest("fieldset") || document.getElementById(missed[0].name)?.closest("fieldset");
    first?.scrollIntoView({ behavior: "smooth", block: "center" });
});

quiz.addEventListener("reset", function() {
    setTimeout(() => {
        quiz.querySelectorAll("fieldset").forEach(fieldset => fieldset.classList.remove("correct-answer", "wrong-answer"));
        scoreDisplay.textContent = "—";
        resultTitle.textContent = "Ready when you are!";
        feedback.textContent = "Complete the quiz and click “Check my answers” to see your score.";
        scoreBar.style.width = "0";
        answeredCount.textContent = "0 of 10 questions answered";
        reviewButton.hidden = true;
        const oldReview = document.getElementById("reviewNotes");
        if (oldReview) oldReview.remove();
    }, 0);
});
