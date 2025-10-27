class QuizManager {
  constructor() {
    this.quizzes = [];
    this.currentQuestions = [];
    this.editingQuiz = null;
    this.hasUnsavedChanges = false;
    this.isSaving = false;

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.initAsync());
    } else {
      this.initAsync();
    }
  }

  async initAsync() {
    try {
      this.quizzes = await api.quiz.GET();
      this.initialize();
      this.initAdminAutoRefresh();
    } catch (error) {
      console.error("❌ Failed to initialize quiz manager:", error);
    }
  }

  // Auto-refresh for admin side
  initAdminAutoRefresh() {
    // Refresh when page becomes visible
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        console.log("📄 Admin page visible - refreshing quiz list");
        this.refreshAdminQuizzes();
      }
    });

    // Refresh every 30 seconds
    setInterval(() => {
      this.refreshAdminQuizzes();
    }, 30000);

    console.log("🔄 Admin auto-refresh initialized (30s intervals)");
  }

  // Refresh admin quiz list
  async refreshAdminQuizzes() {
    try {
      console.log("🔄 Refreshing admin quiz list...");
      const freshQuizzes = await api.quiz.GET();

      if (freshQuizzes) {
        console.log("✅ Admin: Quiz data updated, re-rendering");
        this.quizzes = freshQuizzes;
        this.renderQuizzes();
        this.showToast(
          "Data Updated",
          "Quiz list has been refreshed",
          "success"
        );
      }
    } catch (error) {
      console.error("❌ Admin: Failed to refresh quiz list:", error);
    }
  }

  // Add refresh button to admin
  addAdminRefreshButton() {
    if (document.getElementById("qm-refresh-btn")) return;

    const addQuizBtn = document.getElementById("qm-add-quiz-btn");
    if (!addQuizBtn || !addQuizBtn.parentNode) return;

    const refreshBtn = document.createElement("button");
    refreshBtn.id = "qm-refresh-btn";
    refreshBtn.className = "qm-btn qm-btn-secondary";
    refreshBtn.innerHTML = "🔄 Refresh List";
    refreshBtn.style.marginLeft = "10px";

    refreshBtn.addEventListener("click", async () => {
      await this.refreshAdminQuizzes();
    });

    addQuizBtn.parentNode.appendChild(refreshBtn);
  }

  initialize() {
    this.initializeEventListeners();
    this.addSearchFunctionality();
    this.renderQuizzes();
  }

  initializeEventListeners() {
    // Add Quiz buttons
    document
      .getElementById("qm-add-quiz-btn")
      .addEventListener("click", () => this.openModal());
    document
      .getElementById("qm-add-first-quiz-btn")
      .addEventListener("click", () => this.openModal());

    // Add manual refresh button
    this.addAdminRefreshButton();

    // Modal controls
    document
      .getElementById("qm-close-modal")
      .addEventListener("click", () => this.closeModal());
    document
      .getElementById("qm-cancel-btn")
      .addEventListener("click", () => this.closeModal());
    document
      .getElementById("qm-save-quiz-btn")
      .addEventListener("click", () => this.saveQuiz());

    // Question management
    document
      .getElementById("qm-add-question-btn")
      .addEventListener("click", () => this.addQuestion());

    // Close modal when clicking outside
    document.getElementById("qm-quiz-modal").addEventListener("click", (e) => {
      if (e.target.id === "qm-quiz-modal") {
        this.closeModal();
      }
    });

    // Monitor form changes for unsaved changes
    this.initializeFormChangeListeners();
  }

  initializeFormChangeListeners() {
    const formFields = [
      "qm-quiz-title",
      "qm-quiz-category",
      "qm-quiz-difficulty",
      "qm-question-text",
      "qm-question-category",
      "qm-option1",
      "qm-option2",
      "qm-option3",
      "qm-option4",
      "qm-correct-answer",
    ];

    formFields.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.addEventListener("input", () => this.setUnsavedChanges(true));
      }
    });
  }

  addSearchFunctionality() {
    const quizList = document.getElementById("qm-quiz-list");
    if (quizList && !document.getElementById("qm-search-container")) {
      const searchContainer = document.createElement("div");
      searchContainer.id = "qm-search-container";
      searchContainer.className = "qm-search-container";
      searchContainer.innerHTML = `
        <input type="text" id="qm-search-input" placeholder="Search quizzes by title or category..." class="qm-search-input">
      `;
      quizList.parentNode.insertBefore(searchContainer, quizList);

      const searchInput = document.getElementById("qm-search-input");
      searchInput.addEventListener("input", (e) => {
        this.filterQuizzes(e.target.value);
      });
    }
  }

  setUnsavedChanges(hasChanges) {
    this.hasUnsavedChanges = hasChanges;
  }

  openModal(quiz = null) {
    if (
      this.hasUnsavedChanges &&
      !confirm("You have unsaved changes. Continue?")
    ) {
      return;
    }

    this.editingQuiz = quiz;

    // Reset current questions first
    this.currentQuestions = [];

    // Populate form if editing
    if (quiz) {
      console.log("📝 Editing quiz:", quiz);
      document.getElementById("qm-modal-title").textContent = "Edit Quiz";
      document.getElementById("qm-save-quiz-btn").textContent = "Update Quiz";

      document.getElementById("qm-quiz-title").value = quiz.title || "";
      document.getElementById("qm-quiz-category").value = quiz.category || "";
      document.getElementById("qm-quiz-difficulty").value =
        quiz.difficulty || "easy";

      // Load questions if they exist
      if (quiz.questions && quiz.questions.length > 0) {
        console.log("📝 Loading questions:", quiz.questions);
        this.currentQuestions = quiz.questions.map((q, index) => ({
          id: q.id || `q${index + 1}`,
          question: q.question || "",
          category: q.category || "",
          answer: q.answer || "",
          answers: q.answers
            ? q.answers.map((a, ansIndex) => ({
                id: a.id || `ans${index}_${ansIndex}`,
                text: a.text || a,
              }))
            : [],
        }));
      }
    } else {
      // Create new quiz
      document.getElementById("qm-modal-title").textContent = "Create New Quiz";
      document.getElementById("qm-save-quiz-btn").textContent = "Save Quiz";
      this.resetForm();
    }

    this.renderQuestions();
    document.getElementById("qm-quiz-modal").style.display = "block";
    this.setUnsavedChanges(false);
  }

  closeModal() {
    if (
      this.hasUnsavedChanges &&
      !confirm("You have unsaved changes. Are you sure you want to close?")
    ) {
      return;
    }

    document.getElementById("qm-quiz-modal").style.display = "none";
    this.resetForm();
    this.currentQuestions = [];
    this.editingQuiz = null;
    this.setUnsavedChanges(false);
  }

  resetForm() {
    document.getElementById("qm-quiz-title").value = "";
    document.getElementById("qm-quiz-category").value = "";
    document.getElementById("qm-quiz-difficulty").value = "easy";
    this.resetQuestionForm();
  }

  resetQuestionForm() {
    document.getElementById("qm-question-text").value = "";
    document.getElementById("qm-question-category").value = "";
    document.getElementById("qm-option1").value = "";
    document.getElementById("qm-option2").value = "";
    document.getElementById("qm-option3").value = "";
    document.getElementById("qm-option4").value = "";
    document.getElementById("qm-correct-answer").value = "";
  }

  generateQuestionId() {
    return `q${this.currentQuestions.length + 1}`;
  }

  generateAnswerId(index) {
    const letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
    return `${letters[this.currentQuestions.length]}${index + 1}`;
  }

  validateQuestion(questionText, questionCategory, options, correctAnswer) {
    const errors = [];

    if (!questionText) errors.push("Question text is required");
    if (!questionCategory) errors.push("Question category is required");

    const emptyOptions = options.filter((opt) => !opt.trim());
    if (emptyOptions.length > 0) errors.push("All options must be filled");

    if (!correctAnswer) errors.push("Correct answer is required");
    if (correctAnswer && !options.includes(correctAnswer)) {
      errors.push("Correct answer must match one of the options exactly");
    }

    return errors;
  }

  validateQuizData(quizData) {
    const errors = [];

    if (!quizData.title?.trim()) errors.push("Quiz title is required");
    if (!quizData.category?.trim()) errors.push("Quiz category is required");
    if (!quizData.questions?.length)
      errors.push("At least one question is required");

    quizData.questions.forEach((question, index) => {
      if (!question.question?.trim())
        errors.push(`Question ${index + 1} text is required`);
      if (!question.answer?.trim())
        errors.push(`Question ${index + 1} correct answer is required`);
      if (!question.answers?.length)
        errors.push(`Question ${index + 1} must have options`);

      const hasEmptyOptions = question.answers.some((opt) => !opt.text?.trim());
      if (hasEmptyOptions)
        errors.push(`Question ${index + 1} has empty options`);

      const correctAnswerExists = question.answers.some(
        (opt) => opt.text === question.answer
      );
      if (!correctAnswerExists)
        errors.push(
          `Question ${index + 1} correct answer must match one of the options`
        );
    });

    return errors;
  }

  addQuestion() {
    const questionText = document
      .getElementById("qm-question-text")
      .value.trim();
    const questionCategory = document
      .getElementById("qm-question-category")
      .value.trim();
    const options = [
      document.getElementById("qm-option1").value.trim(),
      document.getElementById("qm-option2").value.trim(),
      document.getElementById("qm-option3").value.trim(),
      document.getElementById("qm-option4").value.trim(),
    ];
    const correctAnswer = document
      .getElementById("qm-correct-answer")
      .value.trim();

    const validationErrors = this.validateQuestion(
      questionText,
      questionCategory,
      options,
      correctAnswer
    );
    if (validationErrors.length > 0) {
      this.showToast(
        "Validation Error",
        validationErrors.join("<br>"),
        "error"
      );
      return;
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
    };

    this.currentQuestions.push(newQuestion);
    this.resetQuestionForm();
    this.renderQuestions();
    this.setUnsavedChanges(true);
    this.showToast(
      "Question Added",
      "Question has been added successfully.",
      "success"
    );
  }

  async deleteQuestion(questionId) {
    console.log(
      "⚠️ Cannot delete individual questions - delete the entire quiz instead"
    );
    this.showToast(
      "Info",
      "To remove questions, edit the quiz and remove them individually.",
      "info"
    );
  }

  async saveQuiz() {
    console.log("🔄 saveQuiz() called");
    console.log("📝 Editing quiz:", this.editingQuiz);

    if (this.isSaving) {
      console.log("❌ Already saving, returning");
      return;
    }
    if (this.isSaving) return;

    const title = document.getElementById("qm-quiz-title").value.trim();
    const category = document.getElementById("qm-quiz-category").value.trim();
    const difficulty = document.getElementById("qm-quiz-difficulty").value;

    const quizData = {
      title,
      category,
      difficulty,
      questions: this.currentQuestions,
    };

    console.log("🔄 Saving quiz:", {
      editingQuiz: this.editingQuiz,
      quizData: quizData,
    });

    const validationErrors = this.validateQuizData(quizData);
    if (validationErrors.length > 0) {
      this.showToast(
        "Validation Error",
        validationErrors.join("<br>"),
        "error"
      );
      return;
    }

    const saveBtn = document.getElementById("qm-save-quiz-btn");
    const originalText = saveBtn.textContent;
    saveBtn.textContent = "Saving...";
    saveBtn.disabled = true;
    this.isSaving = true;

    try {
      let result;
      if (this.editingQuiz) {
        console.log("🔄 Updating quiz ID:", this.editingQuiz.id);

        // FIXED: Include ID in update data
        const updateData = {
          ...quizData,
          id: this.editingQuiz.id,
        };

        result = await api.quiz.PUT(this.editingQuiz.id, updateData);
        console.log("✅ Update response:", result);

        if (result && result.success) {
          this.showToast(
            "Quiz Updated",
            "Quiz has been updated successfully.",
            "success"
          );
          await this.refreshAdminQuizzes();
          this.closeModal();
        } else {
          throw new Error(result?.message || "Update failed");
        }
      } else {
        console.log("🔄 Creating new quiz");
        result = await api.quiz.POST(quizData);
        console.log("✅ Create response:", result);

        if (result && result.success) {
          this.showToast(
            "Quiz Created",
            "Quiz has been created successfully.",
            "success"
          );
          await this.refreshAdminQuizzes();
          this.closeModal();
        } else {
          throw new Error(result?.message || "Creation failed");
        }
      }
    } catch (error) {
      console.error("❌ Error saving quiz:", error);
      this.showToast("Error", "Failed to save quiz: " + error.message, "error");
    } finally {
      saveBtn.textContent = originalText;
      saveBtn.disabled = false;
      this.isSaving = false;
    }
  }
  async deleteQuiz(quizId) {
    console.log("🔄 Deleting quiz with ID:", quizId);

    const numericId = parseInt(quizId);
    if (isNaN(numericId)) {
      this.showToast("Error", "Invalid quiz ID", "error");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to delete this quiz? This action cannot be undone."
      )
    ) {
      return;
    }

    const deleteBtn = event.target;
    const originalHtml = deleteBtn.innerHTML;
    deleteBtn.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Deleting...';
    deleteBtn.disabled = true;

    try {
      await api.quiz.DELETE(numericId);

      // Force refresh after deletion
      await this.refreshAdminQuizzes();

      this.showToast(
        "Quiz Deleted",
        "Quiz has been deleted successfully.",
        "success"
      );
    } catch (error) {
      console.error("❌ Error deleting quiz:", error);
      this.showToast(
        "Error",
        "Failed to delete quiz: " + error.message,
        "error"
      );
    } finally {
      deleteBtn.innerHTML = originalHtml;
      deleteBtn.disabled = false;
    }
  }

  filterQuizzes(searchTerm) {
    if (!searchTerm.trim()) {
      this.renderQuizzes();
      return;
    }

    const filteredQuizzes = this.quizzes.filter(
      (quiz) =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.difficulty.toLowerCase().includes(searchTerm.toLowerCase())
    );

    this.renderFilteredQuizzes(filteredQuizzes);
  }

  renderFilteredQuizzes(quizzes) {
    const quizList = document.getElementById("qm-quiz-list");
    const emptyState = document.getElementById("qm-empty-state");

    if (quizzes.length === 0) {
      quizList.style.display = "none";
      emptyState.style.display = "block";
      return;
    }

    quizList.style.display = "grid";
    emptyState.style.display = "none";
    quizList.innerHTML = this.renderQuizCards(quizzes);
  }

  getDifficultyClass(difficulty) {
    switch (difficulty) {
      case "easy":
        return "qm-badge-easy";
      case "medium":
        return "qm-badge-medium";
      case "hard":
        return "qm-badge-hard";
      default:
        return "qm-badge-secondary";
    }
  }

  // ADD THIS METHOD - Better edit function
  editQuiz(quizId) {
    console.log("✏️ Editing quiz ID:", quizId);
    const quiz = this.quizzes.find((q) => q.id == quizId);
    if (quiz) {
      console.log("📝 Found quiz for editing:", quiz);
      this.openModal(quiz);
    } else {
      console.error("❌ Quiz not found for editing:", quizId);
      this.showToast("Error", "Quiz not found", "error");
    }
  }

  renderQuizCards(quizzes) {
    return quizzes
      .map(
        (quiz) => `
      <div class="qm-quiz-card" id="${quiz.id}">
        <div class="qm-quiz-card-header">
          <div class="qm-quiz-card-title">
            <div>
              <h3>${quiz.title}</h3>
              <div class="qm-badges">
                <span class="qm-badge qm-badge-secondary">${
                  quiz.category
                }</span>
                <span class="qm-badge ${this.getDifficultyClass(
                  quiz.difficulty
                )}">${quiz.difficulty}</span>
                ${
                  quiz.updatedAt
                    ? `<span class="qm-badge qm-badge-info">Updated</span>`
                    : ""
                }
              </div>
            </div>
            <div class="qm-quiz-actions">
              <button class="qm-btn qm-btn-ghost" onclick="quizManager.editQuiz(${
                quiz.id
              })">
                ✏️ Edit
              </button>
              <button class="qm-btn qm-btn-ghost qm-btn-danger" onclick="quizManager.deleteQuiz(${
                quiz.id
              })">
                <i class="fa-solid fa-trash"></i> Delete
              </button>
            </div>
          </div>
        </div>
        <div class="qm-quiz-card-content">
          <p><strong>Questions:</strong> ${
            quiz.questions ? quiz.questions.length : 0
          }</p>
          ${
            quiz.createdAt
              ? `<p><small>Created: ${new Date(
                  quiz.createdAt
                ).toLocaleDateString()}</small></p>`
              : ""
          }
          ${
            quiz.updatedAt
              ? `<p><small>Updated: ${new Date(
                  quiz.updatedAt
                ).toLocaleDateString()}</small></p>`
              : ""
          }
          ${
            quiz.questions && quiz.questions.length > 0
              ? `
          <div class="qm-questions-preview">
            ${quiz.questions
              .slice(0, 3)
              .map(
                (q, i) => `
              <div class="qm-question-preview">
                <span>Q${i + 1}:</span> ${
                  q.question ? q.question.substring(0, 50) : "No question"
                }${q.question && q.question.length > 50 ? "..." : ""}
              </div>
            `
              )
              .join("")}
            ${
              quiz.questions.length > 3
                ? `<div class="qm-more-questions">+ ${
                    quiz.questions.length - 3
                  } more questions</div>`
                : ""
            }
          </div>
          `
              : "<p>No questions added yet</p>"
          }
        </div>
      </div>
    `
      )
      .join("");
  }

  renderQuizzes() {
    const quizList = document.getElementById("qm-quiz-list");
    const emptyState = document.getElementById("qm-empty-state");

    if (this.quizzes.length === 0) {
      quizList.style.display = "none";
      emptyState.style.display = "block";
      return;
    }

    quizList.style.display = "grid";
    emptyState.style.display = "none";
    quizList.innerHTML = this.renderQuizCards(this.quizzes);
  }

  renderQuestions() {
    const questionsCard = document.getElementById("qm-questions-card");
    const questionsList = document.getElementById("qm-questions-list");
    const questionCount = document.getElementById("qm-question-count");

    if (this.currentQuestions.length === 0) {
      questionsCard.style.display = "none";
      return;
    }

    questionsCard.style.display = "block";
    questionCount.textContent = this.currentQuestions.length;

    questionsList.innerHTML = this.currentQuestions
      .map(
        (question, index) => `
            <div class="qm-question-item">
                <div class="qm-question-header">
                    <div class="qm-question-info">
                        <h4>Question ${index + 1}</h4>
                        <p>${question.question}</p>
                        <span class="qm-badge qm-badge-secondary">${
                          question.category
                        }</span>
                    </div>
                    <button class="qm-btn qm-btn-ghost qm-btn-danger" onclick="quizManager.currentQuestions = quizManager.currentQuestions.filter((q, i) => i !== ${index}); quizManager.renderQuestions(); quizManager.setUnsavedChanges(true);">
                        🗑️ Remove
                    </button>
                </div>
                <div class="qm-question-options">
                    ${question.answers
                      .map(
                        (answer) => `
                        <div class="qm-option-item ${
                          answer.text === question.answer
                            ? "qm-option-correct"
                            : "qm-option-normal"
                        }">
                            ${answer.text}
                            ${answer.text === question.answer ? " ✓" : ""}
                        </div>
                    `
                      )
                      .join("")}
                </div>
            </div>
        `
      )
      .join("");
  }

  showToast(title, message, type = "success") {
    let toast = document.getElementById("qm-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "qm-toast";
      toast.className = "qm-toast";
      toast.innerHTML = '<div id="qm-toast-content"></div>';
      document.body.appendChild(toast);
    }

    const content = document.getElementById("qm-toast-content");
    content.innerHTML = `<strong>${title}</strong><br>${message}`;
    toast.className = `qm-toast ${type} qm-show`;

    setTimeout(() => {
      toast.classList.remove("qm-show");
    }, 3000);
  }
}

let quizManager;
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    quizManager = new QuizManager();
  });
} else {
  quizManager = new QuizManager();
}
