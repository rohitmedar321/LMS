class QuizManager {

  constructor() {
  this.quizzes = [];
  this.currentQuestions = [];
  this.editingQuiz = null;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => this.initAsync());
  } else {
    this.initAsync();
  }
}

async initAsync() {
  this.quizzes = await api.quiz.GET;
  this.initialize();
}


  initialize() {
    this.initializeEventListeners()
    this.renderQuizzes()
  }

  initializeEventListeners() {
    // Add Quiz buttons
    document.getElementById("qm-add-quiz-btn").addEventListener("click", () => this.openModal())
    document.getElementById("qm-add-first-quiz-btn").addEventListener("click", () => this.openModal())

    // Modal controls
    document.getElementById("qm-close-modal").addEventListener("click", () => this.closeModal())
    document.getElementById("qm-cancel-btn").addEventListener("click", () => this.closeModal())
    document.getElementById("qm-save-quiz-btn").addEventListener("click", () => this.saveQuiz())

    // Question management
    document.getElementById("qm-add-question-btn").addEventListener("click", () => this.addQuestion())

    // Close modal when clicking outside
    document.getElementById("qm-quiz-modal").addEventListener("click", (e) => {
      if (e.target.id === "qm-quiz-modal") {
        this.closeModal()
      }
    })
  }

  openModal(quiz = null) {
    this.editingQuiz = quiz
    this.currentQuestions = quiz ? [...quiz.questions] : []

    // Set modal title
    document.getElementById("qm-modal-title").textContent = quiz ? "Edit Quiz" : "Create New Quiz"
    document.getElementById("qm-save-quiz-btn").textContent = quiz ? "Update Quiz" : "Save Quiz"

    // Populate form if editing
    if (quiz) {
      document.getElementById("qm-quiz-title").value = quiz.title
      document.getElementById("qm-quiz-category").value = quiz.category
      document.getElementById("qm-quiz-difficulty").value = quiz.difficulty
    } else {
      this.resetForm()
    }

    this.renderQuestions()
    document.getElementById("qm-quiz-modal").style.display = "block"
  }

  closeModal() {
    document.getElementById("qm-quiz-modal").style.display = "none"
    this.resetForm()
    this.currentQuestions = []
    this.editingQuiz = null
  }

  resetForm() {
    document.getElementById("qm-quiz-title").value = ""
    document.getElementById("qm-quiz-category").value = ""
    document.getElementById("qm-quiz-difficulty").value = "easy"
    this.resetQuestionForm()
  }

  resetQuestionForm() {
    document.getElementById("qm-question-text").value = ""
    document.getElementById("qm-question-category").value = ""
    document.getElementById("qm-option1").value = ""
    document.getElementById("qm-option2").value = ""
    document.getElementById("qm-option3").value = ""
    document.getElementById("qm-option4").value = ""
    document.getElementById("qm-correct-answer").value = ""
  }

  generateQuestionId() {
    return `q${this.currentQuestions.length + 1}`
  }

  generateAnswerId(index) {
    const letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]
    return `${letters[this.currentQuestions.length]}${index + 1}`
  }

  addQuestion() {
    const questionText = document.getElementById("qm-question-text").value.trim()
    const questionCategory = document.getElementById("qm-question-category").value.trim()
    const options = [
      document.getElementById("qm-option1").value.trim(),
      document.getElementById("qm-option2").value.trim(),
      document.getElementById("qm-option3").value.trim(),
      document.getElementById("qm-option4").value.trim(),
    ]
    const correctAnswer = document.getElementById("qm-correct-answer").value.trim()

    // Validation
    if (!questionText || options.some((opt) => !opt) || !correctAnswer || !questionCategory) {
      this.showToast("Missing Information", "Please fill in all fields including question category.", "error")
      return
    }

    if (!options.includes(correctAnswer)) {
      this.showToast("Invalid Answer", "Correct answer must match one of the options exactly.", "error")
      return
    }

    const newQuestion = {
      id: this.generateQuestionId(),
      question: questionText,
      category: questionCategory,
      answer: correctAnswer,
      answers: options.map((option, index) => ({
        id: this.generateAnswerId(index),
        text: option,
      })),
    }

    this.currentQuestions.push(newQuestion)
    this.resetQuestionForm()
    this.renderQuestions()
    this.showToast("Question Added", "Question has been added successfully.", "success")
  }

  async deleteQuestion(questionId) {

    let data = await api.quiz.DELETE(questionId);
    // console.log("API Response:", data);

    this.currentQuestions = this.currentQuestions.filter((q) => q.id !== questionId)
    this.renderQuestions()
    this.showToast("Question Removed", "Question has been removed.", "success")
  }

  async saveQuiz() {
    const title = document.getElementById("qm-quiz-title").value.trim()
    const category = document.getElementById("qm-quiz-category").value.trim()
    const difficulty = document.getElementById("qm-quiz-difficulty").value

    // Validation
    if (!title || !category) {
      this.showToast("Missing Information", "Please fill in quiz title and category.", "error")
      return
    }

    if (this.currentQuestions.length === 0) {
      this.showToast("No Questions", "Please add at least one question.", "error")
      return
    }

    const quizData = {
      title,
      category,
      difficulty,
      questions: this.currentQuestions,
    }

    // console.log("Quiz Data:", quizData)

    this.closeModal()

    let data = await api.quiz.POST(quizData);
    // console.log("API Response:", data);

    if (this.editingQuiz) {
      // Update existing quiz
      const index = this.quizzes.findIndex((q) => q.id === this.editingQuiz.id)
      this.quizzes[index] = { ...this.editingQuiz, ...quizData }
      this.showToast("Quiz Updated", "Quiz has been updated successfully.", "success")
    } else {
      // Add new quiz
      const newQuiz = {
        ...quizData,
        id: Date.now().toString(),
        createdAt: new Date(),
      }
      this.quizzes.push(newQuiz)
      this.showToast("Quiz Created", "Quiz has been created successfully.", "success")
    }

    this.closeModal()
    this.renderQuizzes()
  }

 async deleteQuiz(quizId) {

    let data = await api.quiz.DELETE(quizId);

    let Element  =  document.getElementById(quizId)
    Element.remove()

  }

  getDifficultyClass(difficulty) {
    switch (difficulty) {
      case "easy":
        return "qm-badge-easy"
      case "medium":
        return "qm-badge-medium"
      case "hard":
        return "qm-badge-hard"
      default:
        return "qm-badge-secondary"
    }
  }

  renderQuizzes() {
    const quizList = document.getElementById("qm-quiz-list")
    const emptyState = document.getElementById("qm-empty-state")

    if (this.quizzes.length === 0) {
      quizList.style.display = "none"
      emptyState.style.display = "block"
      return
    }

    quizList.style.display = "grid"
    emptyState.style.display = "none"

    // console.log("Rendering quizzes:", this.quizzes)

    quizList.innerHTML = this.quizzes
      .map(
        (quiz) => `
            <div class="qm-quiz-card" id="${quiz.id}">
                <div class="qm-quiz-card-header">
                    <div class="qm-quiz-card-title">
                        <div>
                            <h3>${quiz.title}</h3>
                            <div class="qm-badges">
                                <span class="qm-badge qm-badge-secondary">${quiz.category}</span>
                                <span class="qm-badge ${this.getDifficultyClass(quiz.difficulty)}">${quiz.difficulty}</span>
                            </div>
                        </div>
                        <div class="qm-quiz-actions">
                            <button class="qm-btn qm-btn-ghost" onclick="quizManager.openModal(quizManager.quizzes.find(q => q.id === '${quiz.id}'))">
                                ✏️
                            </button>
                            <button class="qm-btn qm-btn-ghost qm-btn-danger" onclick="quizManager.deleteQuiz('${quiz.id}')">
                                  <i class="fa-solid fa-trash"></i>

                            </button>
                        </div>
                    </div>
                </div>
                <div class="qm-quiz-card-content">
                    
                   
                </div>
            </div>
        `,
      )
      .join("")
  }

  renderQuestions() {
    const questionsCard = document.getElementById("qm-questions-card")
    const questionsList = document.getElementById("qm-questions-list")
    const questionCount = document.getElementById("qm-question-count")

    if (this.currentQuestions.length === 0) {
      questionsCard.style.display = "none"
      return
    }

    questionsCard.style.display = "block"
    questionCount.textContent = this.currentQuestions.length

    questionsList.innerHTML = this.currentQuestions
      .map(
        (question, index) => `
            <div class="qm-question-item">
                <div class="qm-question-header">
                    <div class="qm-question-info">
                        <h4>Question ${index + 1}</h4>
                        <p>${question.question}</p>
                        <span class="qm-badge qm-badge-secondary">${question.category}</span>
                    </div>
                    <button class="qm-btn qm-btn-ghost qm-btn-danger" onclick="quizManager.deleteQuestion('${question.id}')">
                        🗑️
                    </button>
                </div>
                <div class="qm-question-options">
                    ${question.answers
                      .map(
                        (answer) => `
                        <div class="qm-option-item ${answer.text === question.answer ? "qm-option-correct" : "qm-option-normal"}">
                            ${answer.text}
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
        `,
      )
      .join("")
  }

  generateJSON() {
    if (this.currentQuestions.length === 0) {
      this.showToast("No Questions", "Please add at least one question to generate JSON.", "error")
      return null
    }

    const title = document.getElementById("qm-quiz-title").value.trim()
    const category = document.getElementById("qm-quiz-category").value.trim()
    const difficulty = document.getElementById("qm-quiz-difficulty").value

    if (!title || !category) {
      this.showToast("Missing Information", "Please fill in quiz title and category.", "error")
      return null
    }

    return [
      {
        id: Date.now(),
        title: title,
        difficulty: difficulty,
        category: category,
        questions: this.currentQuestions.map((question) => ({
          id: question.id,
          question: question.question,
          answer: question.answer,
          answers: question.answers,
          category: question.category,
        })),
      },
    ]
  }

  getQuizData() {
    const jsonData = this.generateJSON()
    if (!jsonData) return null
    return JSON.stringify(jsonData, null, 2)
  }

  showToast(title, message, type = "success") {
    let toast = document.getElementById("qm-toast")
    if (!toast) {
      toast = document.createElement("div")
      toast.id = "qm-toast"
      toast.className = "qm-toast"
      toast.innerHTML = '<div id="qm-toast-content"></div>'
      document.body.appendChild(toast)
    }

    const content = document.getElementById("qm-toast-content")
    content.innerHTML = `<strong>${title}</strong><br>${message}`
    toast.className = `qm-toast ${type} qm-show`

    setTimeout(() => {
      toast.classList.remove("qm-show")
    }, 3000)
  }
}

let quizManager
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    quizManager = new QuizManager()
  })
} else {
  quizManager = new QuizManager()
}
