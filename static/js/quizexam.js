// Quiz questions data
// const quizQuestions = [
//     {
//         id: "q1",
//         question: "What is the largest planet in our solar system?",
//         category: "Astronomy",
//         answers: [
//             { id: "a1", text: "Earth", correct: false },
//             { id: "a2", text: "Jupiter", correct: true },
//             { id: "a3", text: "Saturn", correct: false },
//             { id: "a4", text: "Mars", correct: false },
//         ],
//     },
//     {
//         id: "q2",
//         question: "Which element has the chemical symbol 'O'?",
//         category: "Chemistry",
//         answers: [
//             { id: "b1", text: "Gold", correct: false },
//             { id: "b2", text: "Silver", correct: false },
//             { id: "b3", text: "Oxygen", correct: true },
//             { id: "b4", text: "Iron", correct: false },
//         ],
//     },
//     {
//         id: "q3",
//         question: "What is the capital of France?",
//         category: "Geography",
//         answers: [
//             { id: "c1", text: "London", correct: false },
//             { id: "c2", text: "Berlin", correct: false },
//             { id: "c3", text: "Paris", correct: true },
//             { id: "c4", text: "Madrid", correct: false },
//         ],
//     },
//     {
//         id: "q4",
//         question: "Who painted the Mona Lisa?",
//         category: "Art",
//         answers: [
//             { id: "d1", text: "Vincent van Gogh", correct: false },
//             { id: "d2", text: "Leonardo da Vinci", correct: true },
//             { id: "d3", text: "Pablo Picasso", correct: false },
//             { id: "d4", text: "Michelangelo", correct: false },
//         ],
//     },
//     {
//         id: "q5",
//         question: "What is the smallest unit of matter?",
//         category: "Physics",
//         answers: [
//             { id: "e1", text: "Molecule", correct: false },
//             { id: "e2", text: "Atom", correct: true },
//             { id: "e3", text: "Cell", correct: false },
//             { id: "e4", text: "Electron", correct: false },
//         ],
//     },
//     {
//         id: "q6",
//         question: "In which year did World War II end?",
//         category: "History",
//         answers: [
//             { id: "f1", text: "1944", correct: false },
//             { id: "f2", text: "1945", correct: true },
//             { id: "f3", text: "1946", correct: false },
//             { id: "f4", text: "1947", correct: false },
//         ],
//     },
//     {
//         id: "q7",
//         question: "What is the speed of light in vacuum?",
//         category: "Physics",
//         answers: [
//             { id: "g1", text: "300,000 km/s", correct: false },
//             { id: "g2", text: "299,792,458 m/s", correct: true },
//             { id: "g3", text: "150,000 km/s", correct: false },
//             { id: "g4", text: "500,000 km/s", correct: false },
//         ],
//     },
//     {
//         id: "q8",
//         question: "Which programming language was created by Guido van Rossum?",
//         category: "Technology",
//         answers: [
//             { id: "h1", text: "Java", correct: false },
//             { id: "h2", text: "Python", correct: true },
//             { id: "h3", text: "JavaScript", correct: false },
//             { id: "h4", text: "C++", correct: false },
//         ],
//     },
// ];

let quizQuestions = []

// Global state
let answers = {};
let showResults = false;

// DOM elements
const questionsContainer = document.getElementById('questions-container');
const quizForm = document.getElementById('quiz-form');
const resultsSection = document.getElementById('results-section');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const progressPercentage = document.getElementById('progress-percentage');
const validationMessage = document.getElementById('validation-message');
const submitProgress = document.getElementById('submit-progress');
const readyIndicator = document.getElementById('ready-indicator');
const submitBtn = document.getElementById('submit-btn');
const restartBtn = document.getElementById('restart-btn');

// Initialize the quiz
async function initializeQuiz  () {
    // console.log(data)

    quizQuestions = data.questions

    document.getElementById('total-questions').textContent = quizQuestions.length;
    renderQuestions();
    updateProgress();
    
    // Event listeners
    quizForm.addEventListener('submit', handleSubmit);

}

// Render all questions
function renderQuestions() {
    questionsContainer.innerHTML = '';
    
    quizQuestions.forEach((question, index) => {
        const questionCard = document.createElement('div');
        questionCard.className = 'card question-card';
        questionCard.id = `question-${question.id}`;
        
        questionCard.innerHTML = `
            <div class="card-header">
                <div class="question-header">
                    <h3 class="question-title">Question ${index + 1}</h3>
                    <span class="category-badge">${question.category}</span>
                </div>
            </div>
            <div class="card-content">
                <h4 class="question-text">${question.question}</h4>
                <div class="answers-group">
                    ${question.answers.map(answer => `
                        <div class="answer-option" data-question-id="${question.id}" data-answer-id="${answer.id}">
                            <input type="radio" name="${question.id}" value="${answer.id}" id="${question.id}-${answer.id}">
                            <label for="${question.id}-${answer.id}">${answer.text}</label>
                        </div>
                    `).join('')}
                </div>
                <div class="question-error" id="error-${question.id}" style="display: none;">
                    ⚠️ This question requires an answer
                </div>
            </div>
        `;
        
        questionsContainer.appendChild(questionCard);
    });
    
    // Add event listeners to answer options
    document.querySelectorAll('.answer-option').forEach(option => {
        option.addEventListener('click', handleAnswerClick);
    });
    
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', handleAnswerChange);
    });
}

// Handle answer option click
function handleAnswerClick(event) {
    const option = event.currentTarget;
    const radio = option.querySelector('input[type="radio"]');
    radio.checked = true;
    radio.dispatchEvent(new Event('change'));
}

// Handle answer change
function handleAnswerChange(event) {
    const radio = event.target;
    const questionId = radio.name;
    const answerId = radio.value;
    
    // Update answers object
    answers[questionId] = answerId;
    
    // Update UI
    updateAnswerSelection(questionId, answerId);
    updateProgress();
    hideValidationErrors();
}

// Update answer selection UI
function updateAnswerSelection(questionId, answerId) {
    const questionCard = document.getElementById(`question-${questionId}`);
    const answerOptions = questionCard.querySelectorAll('.answer-option');
    
    answerOptions.forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.answerId === answerId) {
            option.classList.add('selected');
        }
    });
    
    // Update question card appearance
    questionCard.classList.remove('unanswered-error');
    questionCard.classList.add('answered');
}

// Update progress indicators
function updateProgress() {
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = quizQuestions.length;
    const percentage = Math.round((answeredCount / totalQuestions) * 100);
    
    // Update progress bar
    progressFill.style.width = `${percentage}%`;
    
    // Update progress text
    progressText.textContent = `Progress: ${answeredCount}/${totalQuestions} questions answered`;
    progressPercentage.textContent = `${percentage}% complete`;
    
    // Update submit section
    submitProgress.textContent = `${answeredCount}/${totalQuestions} questions answered`;
    
    if (answeredCount === totalQuestions) {
        readyIndicator.style.display = 'inline';
        submitBtn.classList.add('ready');
    } else {
        readyIndicator.style.display = 'none';
        submitBtn.classList.remove('ready');
    }
}

// Handle form submission
function handleSubmit(event) {
    event.preventDefault();
    
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = quizQuestions.length;
    
    if (answeredCount < totalQuestions) {
        showValidationErrors();
        return;
    }
    
    showQuizResults();
}

// Show validation errors
function showValidationErrors() {
    const unansweredQuestions = quizQuestions.filter(q => !answers[q.id]);
    
    // Show main validation message
    validationMessage.style.display = 'flex';
    document.getElementById('remaining-count').textContent = unansweredQuestions.length;
    
    // Highlight unanswered questions
    unansweredQuestions.forEach(question => {
        const questionCard = document.getElementById(`question-${question.id}`);
        const errorElement = document.getElementById(`error-${question.id}`);
        
        questionCard.classList.add('unanswered-error');
        errorElement.style.display = 'flex';
    });
    
    // Scroll to first unanswered question
    if (unansweredQuestions.length > 0) {
        const firstUnanswered = document.getElementById(`question-${unansweredQuestions[0].id}`);
        firstUnanswered.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Hide validation errors
function hideValidationErrors() {
    validationMessage.style.display = 'none';
    
    document.querySelectorAll('.question-error').forEach(error => {
        error.style.display = 'none';
    });
}

// Show quiz results
function showQuizResults() {
    const results = calculateResults();
    const correctAnswers = results.filter(result => result.correct).length;
    const totalQuestions = quizQuestions.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    
    // Hide quiz form and show results
    quizForm.style.display = 'none';
    document.querySelector('.header-card').style.display = 'none';
    resultsSection.style.display = 'block';
    
    // Update score display
    const scoreDisplay = document.getElementById('score-display');
    const percentageDisplay = document.getElementById('percentage-display');
    const scoreMessage = document.getElementById('score-message');
    const trophyIcon = document.getElementById('trophy-icon');
    
    scoreDisplay.textContent = `${correctAnswers}/${totalQuestions}`;
    percentageDisplay.textContent = `${percentage}%`;
    
    // Set score colors and message
    const scoreClass = getScoreClass(percentage);
    scoreDisplay.className = `score-display ${scoreClass}`;
    percentageDisplay.className = `percentage-display ${scoreClass}`;
    scoreMessage.textContent = getScoreMessage(percentage);
    
    // Render detailed results
    renderDetailedResults(results);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Calculate quiz results
function calculateResults() {
    return quizQuestions.map(question => {
        const selectedAnswerId = answers[question.id];
        const selectedAnswer = question.answers.find(a => a.id === selectedAnswerId);
        const correct = selectedAnswer ? selectedAnswer.correct : false;
        
        return {
            questionId: question.id,
            selectedAnswerId: selectedAnswerId || '',
            correct: correct
        };
    });
}

// Get score CSS class
function getScoreClass(percentage) {
    if (percentage >= 80) return 'score-excellent';
    if (percentage >= 60) return 'score-good';
    return 'score-poor';
}

// Get score message
function getScoreMessage(percentage) {
    if (percentage >= 90) return "Excellent! Outstanding performance!";
    if (percentage >= 80) return "Great job! You did very well!";
    if (percentage >= 70) return "Good work! Keep it up!";
    if (percentage >= 60) return "Not bad! Room for improvement.";
    return "Keep studying and try again!";
}

// Render detailed results
function renderDetailedResults(results) {
    const detailedResults = document.getElementById('detailed-results');
    detailedResults.innerHTML = '';
    
    quizQuestions.forEach((question, index) => {
        const result = results[index];
        const selectedAnswer = question.answers.find(a => a.id === result.selectedAnswerId);
        const correctAnswer = question.answers.find(a => a.correct);
        
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        resultItem.innerHTML = `
            <div class="result-header">
                <span class="result-question-number">Question ${index + 1}</span>
                <span class="result-category">${question.category}</span>
                <span class="result-icon">${result.correct ? '✅' : '❌'}</span>
            </div>
            <p class="result-question-text">${question.question}</p>
            <div class="result-answers">
                <div class="result-answer ${result.correct ? 'correct-answer' : 'incorrect-answer'}">
                    <strong>Your answer:</strong> ${selectedAnswer ? selectedAnswer.text : 'No answer selected'}
                </div>
                ${!result.correct ? `
                    <div class="result-answer correct-answer">
                        <strong>Correct answer:</strong> ${correctAnswer.text}
                    </div>
                ` : ''}
            </div>
        `;
        
        detailedResults.appendChild(resultItem);
    });
}

// Handle quiz restart
function handleRestart() {
    // Reset state
    answers = {};
    showResults = false;
    
    // Show quiz form and hide results
    quizForm.style.display = 'block';
    document.querySelector('.header-card').style.display = 'block';
    resultsSection.style.display = 'none';
    
    // Reset form
    quizForm.reset();
    
    // Reset UI
    document.querySelectorAll('.question-card').forEach(card => {
        card.classList.remove('answered', 'unanswered-error');
    });
    
    document.querySelectorAll('.answer-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    hideValidationErrors();
    updateProgress();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Initialize the quiz when the page loads
document.addEventListener('DOMContentLoaded', initializeQuiz);

