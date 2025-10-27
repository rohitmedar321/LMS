let quizQuestions = [];
let currentQuizId = null;

// Global state
let answers = {};
let showResults = false;

// DOM elements
const questionsContainer = document.getElementById("questions-container");
const quizForm = document.getElementById("quiz-form");
const resultsSection = document.getElementById("results-section");

// Get quiz ID from URL
function getQuizIdFromUrl() {
  const path = window.location.pathname;
  const match = path.match(/\/quizexam\/(\d+)/);
  return match ? match[1] : null;
}

// Fetch quiz data from server with aggressive cache busting
async function fetchQuizData(quizId) {
  try {
    console.log("🔄 Fetching quiz data for ID:", quizId);

    // Always use cache busting with timestamp
    const timestamp = Date.now();
    const response = await fetch(`/api/quiz/${quizId}?t=${timestamp}`, {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch quiz: ${response.status}`);
    }

    const quizData = await response.json();
    console.log("✅ Quiz data loaded:", quizData);
    return quizData;
  } catch (error) {
    console.error("❌ Error fetching quiz:", error);
    throw error;
  }
}

// Transform quiz data to match expected format
function transformQuizData(quizData) {
  if (!quizData || !quizData.questions) {
    throw new Error("Invalid quiz data format");
  }

  return quizData.questions.map((question, index) => {
    // Ensure answers are in the correct format
    const answers = question.answers.map((answer, ansIndex) => ({
      id: answer.id || `ans${index}_${ansIndex}`,
      text: answer.text || answer,
      correct: answer.text === question.answer,
    }));

    return {
      id: question.id || `q${index + 1}`,
      question: question.question,
      category: question.category || "General",
      answers: answers,
    };
  });
}

// Initialize the quiz
async function initializeQuiz() {
  currentQuizId = getQuizIdFromUrl();

  if (!currentQuizId) {
    console.error("❌ No quiz ID found in URL");
    showErrorState("Invalid quiz URL");
    return;
  }

  try {
    // Show loading state
    showLoadingState();

    // Fetch quiz data from server - always fresh
    const quizData = await fetchQuizData(currentQuizId);

    if (!quizData) {
      throw new Error("No quiz data received");
    }

    // Transform data to match expected format
    quizQuestions = transformQuizData(quizData);

    // Update quiz title and info
    updateQuizInfo(quizData);

    // Render questions
    renderQuestions();
    updateProgress();

    // Hide loading state
    hideLoadingState();

    // Event listeners
    if (quizForm) {
      quizForm.addEventListener("submit", handleSubmit);
    }

    console.log("✅ Quiz initialized with", quizQuestions.length, "questions");
  } catch (error) {
    console.error("❌ Failed to initialize quiz:", error);
    showErrorState("Failed to load quiz. Please refresh the page.");
  }
}

// Show loading state
function showLoadingState() {
  if (questionsContainer) {
    questionsContainer.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading quiz questions...</p>
      </div>
    `;
  }
}

// Hide loading state
function hideLoadingState() {
  // Loading state will be replaced by renderQuestions()
}

// Show error state
function showErrorState(message) {
  if (questionsContainer) {
    questionsContainer.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Unable to Load Quiz</h3>
        <p>${message}</p>
        <button onclick="window.location.reload()" class="btn btn-primary">
          Try Again
        </button>
      </div>
    `;
  }
}

// Update quiz title and information
function updateQuizInfo(quizData) {
  // Update page title
  if (quizData.title) {
    document.title = `${quizData.title} - Quiz`;
  }

  // Update any quiz info elements if they exist
  const quizTitleElement = document.getElementById("quiz-title");
  if (quizTitleElement && quizData.title) {
    quizTitleElement.textContent = quizData.title;
  }
}

// Render all questions
function renderQuestions() {
  if (!questionsContainer) return;

  questionsContainer.innerHTML = "";

  quizQuestions.forEach((question, index) => {
    const questionCard = document.createElement("div");
    questionCard.className = "card question-card";
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
          ${question.answers
            .map(
              (answer) => `
            <div class="answer-option" data-question-id="${question.id}" data-answer-id="${answer.id}">
              <input type="radio" name="${question.id}" value="${answer.id}" id="${question.id}-${answer.id}">
              <label for="${question.id}-${answer.id}">${answer.text}</label>
            </div>
          `
            )
            .join("")}
        </div>
        <div class="question-error" id="error-${
          question.id
        }" style="display: none;">
          ⚠️ This question requires an answer
        </div>
      </div>
    `;

    questionsContainer.appendChild(questionCard);
  });

  // Add event listeners to answer options
  document.querySelectorAll(".answer-option").forEach((option) => {
    option.addEventListener("click", handleAnswerClick);
  });

  document.querySelectorAll('input[type="radio"]').forEach((radio) => {
    radio.addEventListener("change", handleAnswerChange);
  });
}

// Handle answer option click
function handleAnswerClick(event) {
  const option = event.currentTarget;
  const radio = option.querySelector('input[type="radio"]');
  radio.checked = true;
  radio.dispatchEvent(new Event("change"));
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
  const answerOptions = questionCard.querySelectorAll(".answer-option");

  answerOptions.forEach((option) => {
    option.classList.remove("selected");
    if (option.dataset.answerId === answerId) {
      option.classList.add("selected");
    }
  });

  // Update question card appearance
  questionCard.classList.remove("unanswered-error");
  questionCard.classList.add("answered");
}

// Update progress indicators
function updateProgress() {
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quizQuestions.length;
  const percentage = Math.round((answeredCount / totalQuestions) * 100);

  // Update progress bar
  const progressFill = document.getElementById("progress-fill");
  if (progressFill) {
    progressFill.style.width = `${percentage}%`;
  }

  // Update progress text
  const progressText = document.getElementById("progress-text");
  if (progressText) {
    progressText.textContent = `Progress: ${answeredCount}/${totalQuestions} questions answered`;
  }

  const progressPercentage = document.getElementById("progress-percentage");
  if (progressPercentage) {
    progressPercentage.textContent = `${percentage}% complete`;
  }

  // Update submit section
  const submitProgress = document.getElementById("submit-progress");
  if (submitProgress) {
    submitProgress.textContent = `${answeredCount}/${totalQuestions} questions answered`;
  }

  const readyIndicator = document.getElementById("ready-indicator");
  const submitBtn = document.getElementById("submit-btn");
  if (readyIndicator && submitBtn) {
    if (answeredCount === totalQuestions) {
      readyIndicator.style.display = "inline";
      submitBtn.classList.add("ready");
    } else {
      readyIndicator.style.display = "none";
      submitBtn.classList.remove("ready");
    }
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
  const unansweredQuestions = quizQuestions.filter((q) => !answers[q.id]);

  // Show main validation message
  const validationMessage = document.getElementById("validation-message");
  if (validationMessage) {
    validationMessage.style.display = "flex";
    const remainingCount = document.getElementById("remaining-count");
    if (remainingCount) {
      remainingCount.textContent = unansweredQuestions.length;
    }
  }

  // Highlight unanswered questions
  unansweredQuestions.forEach((question) => {
    const questionCard = document.getElementById(`question-${question.id}`);
    const errorElement = document.getElementById(`error-${question.id}`);

    if (questionCard) {
      questionCard.classList.add("unanswered-error");
    }
    if (errorElement) {
      errorElement.style.display = "flex";
    }
  });

  // Scroll to first unanswered question
  if (unansweredQuestions.length > 0) {
    const firstUnanswered = document.getElementById(
      `question-${unansweredQuestions[0].id}`
    );
    if (firstUnanswered) {
      firstUnanswered.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
}

// Hide validation errors
function hideValidationErrors() {
  const validationMessage = document.getElementById("validation-message");
  if (validationMessage) {
    validationMessage.style.display = "none";
  }

  document.querySelectorAll(".question-error").forEach((error) => {
    error.style.display = "none";
  });
}

// Show quiz results
function showQuizResults() {
  const results = calculateResults();
  const correctAnswers = results.filter((result) => result.correct).length;
  const totalQuestions = quizQuestions.length;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  // Hide quiz form and show results
  if (quizForm) {
    quizForm.style.display = "none";
  }

  const headerCard = document.querySelector(".header-card");
  if (headerCard) {
    headerCard.style.display = "none";
  }

  if (resultsSection) {
    resultsSection.style.display = "block";
  }

  // Update score display
  const scoreDisplay = document.getElementById("score-display");
  const percentageDisplay = document.getElementById("percentage-display");
  const scoreMessage = document.getElementById("score-message");

  if (scoreDisplay) {
    scoreDisplay.textContent = `${correctAnswers}/${totalQuestions}`;
  }
  if (percentageDisplay) {
    percentageDisplay.textContent = `${percentage}%`;
  }

  // Set score colors and message
  const scoreClass = getScoreClass(percentage);
  if (scoreDisplay) {
    scoreDisplay.className = `score-display ${scoreClass}`;
  }
  if (percentageDisplay) {
    percentageDisplay.className = `percentage-display ${scoreClass}`;
  }
  if (scoreMessage) {
    scoreMessage.textContent = getScoreMessage(percentage);
  }

  // Render detailed results
  renderDetailedResults(results);

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Calculate quiz results
function calculateResults() {
  return quizQuestions.map((question) => {
    const selectedAnswerId = answers[question.id];
    const selectedAnswer = question.answers.find(
      (a) => a.id === selectedAnswerId
    );
    const correct = selectedAnswer ? selectedAnswer.correct : false;

    return {
      questionId: question.id,
      selectedAnswerId: selectedAnswerId || "",
      correct: correct,
    };
  });
}

// Get score CSS class
function getScoreClass(percentage) {
  if (percentage >= 80) return "score-excellent";
  if (percentage >= 60) return "score-good";
  return "score-poor";
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
  const detailedResults = document.getElementById("detailed-results");
  if (!detailedResults) return;

  detailedResults.innerHTML = "";

  quizQuestions.forEach((question, index) => {
    const result = results[index];
    const selectedAnswer = question.answers.find(
      (a) => a.id === result.selectedAnswerId
    );
    const correctAnswer = question.answers.find((a) => a.correct);

    const resultItem = document.createElement("div");
    resultItem.className = "result-item";

    resultItem.innerHTML = `
      <div class="result-header">
        <span class="result-question-number">Question ${index + 1}</span>
        <span class="result-category">${question.category}</span>
        <span class="result-icon">${result.correct ? "✅" : "❌"}</span>
      </div>
      <p class="result-question-text">${question.question}</p>
      <div class="result-answers">
        <div class="result-answer ${
          result.correct ? "correct-answer" : "incorrect-answer"
        }">
          <strong>Your answer:</strong> ${
            selectedAnswer ? selectedAnswer.text : "No answer selected"
          }
        </div>
        ${
          !result.correct
            ? `
          <div class="result-answer correct-answer">
            <strong>Correct answer:</strong> ${correctAnswer.text}
          </div>
        `
            : ""
        }
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
  if (quizForm) {
    quizForm.style.display = "block";
  }

  const headerCard = document.querySelector(".header-card");
  if (headerCard) {
    headerCard.style.display = "block";
  }

  if (resultsSection) {
    resultsSection.style.display = "none";
  }

  // Reset form
  if (quizForm) {
    quizForm.reset();
  }

  // Reset UI
  document.querySelectorAll(".question-card").forEach((card) => {
    card.classList.remove("answered", "unanswered-error");
  });

  document.querySelectorAll(".answer-option").forEach((option) => {
    option.classList.remove("selected");
  });

  hideValidationErrors();
  updateProgress();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Add CSS for loading states
const loadingStyles = document.createElement("style");
loadingStyles.textContent = `
  .loading-state {
    text-align: center;
    padding: 40px 20px;
  }
  .spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 2s linear infinite;
    margin: 0 auto 20px;
  }
  .error-state {
    text-align: center;
    padding: 40px 20px;
    color: #dc3545;
  }
  .error-icon {
    font-size: 48px;
    margin-bottom: 20px;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(loadingStyles);

// Initialize the quiz when the page loads
document.addEventListener("DOMContentLoaded", initializeQuiz);

// Force refresh when page becomes visible
document.addEventListener("visibilitychange", function () {
  if (!document.hidden && currentQuizId) {
    console.log("📄 Page visible - refreshing quiz data");
    initializeQuiz();
  }
});
