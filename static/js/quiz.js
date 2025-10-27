const quizcontainer = document.getElementById("quiz-list");

// Quiz Client with aggressive cache busting
class QuizClient {
  constructor() {
    this.quizzes = [];
    this.lastFetchTime = 0;
    this.cacheDuration = 10000; // 10 seconds cache only
  }

  async fetchQuizzes(forceRefresh = false) {
    try {
      console.log(
        "🔄 Fetching quizzes...",
        forceRefresh ? "(forced refresh)" : ""
      );

      // FIX: Use direct fetch instead of relying on adminmain.js API
      const timestamp = Date.now();
      const response = await fetch(`/api/allquiz?t=${timestamp}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const quizsummary = await response.json();

      if (!quizsummary) {
        throw new Error(
          "No data received from server - received null or undefined"
        );
      }

      this.quizzes = quizsummary;
      this.lastFetchTime = Date.now();

      console.log("✅ Quizzes loaded:", this.quizzes.length);
      return this.quizzes;
    } catch (error) {
      console.error("❌ Error fetching quizzes:", error);
      // Clear quizzes on error to show empty state
      this.quizzes = [];
      throw error;
    }
  }

  async refreshQuizzes() {
    return await this.fetchQuizzes(true);
  }

  initAutoRefresh() {
    // Refresh when page becomes visible again
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        console.log("📄 Page visible - refreshing quiz data");
        this.refreshAndRender();
      }
    });

    // Refresh every 30 seconds (more frequent)
    setInterval(() => {
      this.refreshAndRender();
    }, 30000);

    console.log("🔄 Auto-refresh initialized (30s intervals)");
  }

  async refreshAndRender() {
    try {
      await this.refreshQuizzes();
      this.renderQuizzes();
      this.updateLastUpdatedTime();
    } catch (error) {
      console.error("❌ Failed to refresh quiz data:", error);
      this.showErrorInUI('Failed to refresh quizzes: ' + error.message);
    }
  }

  updateLastUpdatedTime() {
    const lastUpdated = document.getElementById("last-updated");
    if (lastUpdated) {
      lastUpdated.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
    }
  }

  renderQuizzes() {
    if (!quizcontainer) return;

    console.log("🎨 Re-rendering quizzes:", this.quizzes.length);
    load(this.quizzes);
  }

  showErrorInUI(message) {
    if (!quizcontainer) return;
    
    quizcontainer.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 40px;">
          <div style="color: #dc3545; font-size: 16px;">
            ❌ ${message}
          </div>
          <button onclick="window.location.reload()" class="btn btn-primary" style="margin-top: 10px;">
            Try Again
          </button>
        </td>
      </tr>
    `;
  }
}

// Initialize the quiz client
const quizClient = new QuizClient();

const load = (data) => {
  if (!quizcontainer) return;

  quizcontainer.innerHTML = ""; // Clear container first

  if (!data || data.length === 0) {
    quizcontainer.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 40px;">
          <div style="color: #6c757d; font-size: 16px;">
            No quizzes available. Please check back later.
          </div>
        </td>
      </tr>
    `;
    return;
  }

  data.forEach((element, index) => {
    const questionCount = element.questions ? element.questions.length : 0;
    const duration = Math.max(1, Math.floor(questionCount * 0.5));

    const html = `  
        <tr class="quiz-row unlocked" data-quiz-id="${element.id}">
              <td>
                <svg
                  class="icon unlock-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="m7 11V7a5 5 0 0 1 9.9-1" />
                </svg>
              </td>
              <td class="quiz-name">${element.title || 'Untitled Quiz'}</td>
              <td>
                <span class="badge category-${
                  element.category ? element.category.toLowerCase() : "general"
                }">${element.category || "General"}</span>
              </td>
              <td>
                <span class="badge difficulty-${
                  element.difficulty
                    ? element.difficulty.toLowerCase()
                    : "medium"
                }">${element.difficulty || "Medium"}</span>
              </td>
              <td class="center">${questionCount}</td>
              <td class="center">
                <div class="duration">
                  <svg
                    class="icon-small"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12,6 12,12 16,14" />
                  </svg>
                  ${duration} min
                </div>
              </td>
              <td class="center">
                <div class="rating">
                  <svg
                    class="icon-small star"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                  >
                    <polygon
                      points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                    />
                  </svg>
                  4.1
                </div>
              </td>
              <td class="center">
                <div class="completed">
                  <svg
                    class="icon-small"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="m22 21-3-3m0 0-3-3m3 3 3-3m-3 3-3 3" />
                  </svg>
                  750
                </div>
              </td>
              <td class="center">
                <button
                  class="btn btn-primary"
                  onclick="openQuiz(${element.id})"
                >
                  <svg
                    class="icon-small"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                  Open
                </button>
              </td>
            </tr>`;

    quizcontainer.insertAdjacentHTML("beforeend", html);
  });

  // Add refresh indicator if not exists
  addRefreshIndicator();
};

const openQuiz = (id) => {
  let url = `${baseUrl}/quizexam/${id}`;
  // Add cache busting parameter to quiz URL as well
  url += `?t=${Date.now()}`;
  window.location.href = url;
};

// Add manual refresh button and indicator
function addRefreshIndicator() {
  if (document.getElementById("quiz-refresh-container")) return;

  const quizSection =
    document.querySelector(".quiz-section") || document.querySelector("main");
  if (!quizSection) return;

  const refreshContainer = document.createElement("div");
  refreshContainer.id = "quiz-refresh-container";
  refreshContainer.className = "quiz-refresh-container";
  refreshContainer.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding: 10px 15px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;
  `;

  refreshContainer.innerHTML = `
      <div>
          <strong>Quizzes</strong>
          <span id="last-updated" style="font-size: 12px; color: #6c757d; margin-left: 10px;">
              Last updated: ${new Date().toLocaleTimeString()}
          </span>
      </div>
      <button id="refresh-quizzes-btn" class="btn btn-sm btn-outline-secondary">
          <svg class="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width: 14px; height: 14px;">
              <path d="M23 4v6h-6" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Refresh
      </button>
  `;

  const quizList = document.getElementById("quiz-list");
  if (quizList && quizList.parentNode) {
    quizList.parentNode.insertBefore(refreshContainer, quizList);
  } else {
    quizSection.insertBefore(refreshContainer, quizSection.firstChild);
  }

  document
    .getElementById("refresh-quizzes-btn")
    .addEventListener("click", async () => {
      await manualRefresh();
    });
}

async function manualRefresh() {
  const btn = document.getElementById("refresh-quizzes-btn");
  if (!btn) return;

  const originalHtml = btn.innerHTML;

  btn.innerHTML = `
      <svg class="icon-small spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width: 14px; height: 14px;">
          <path d="M23 4v6h-6" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
      Refreshing...
  `;
  btn.disabled = true;

  try {
    await quizClient.refreshAndRender();
    console.log("✅ Manual refresh completed");

    // Show success feedback
    showTempMessage("Quizzes updated successfully!", "success");
  } catch (error) {
    console.error("❌ Manual refresh failed:", error);
    showTempMessage("Failed to refresh quizzes: " + error.message, "error");
  } finally {
    btn.innerHTML = originalHtml;
    btn.disabled = false;
  }
}

function showTempMessage(message, type) {
  // Remove existing message
  const existingMsg = document.getElementById("temp-message");
  if (existingMsg) existingMsg.remove();

  const msg = document.createElement("div");
  msg.id = "temp-message";
  msg.textContent = message;
  msg.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 20px;
      border-radius: 4px;
      color: white;
      font-weight: bold;
      z-index: 10000;
      background: ${type === "success" ? "#28a745" : "#dc3545"};
      transition: opacity 0.3s;
  `;

  document.body.appendChild(msg);

  setTimeout(() => {
    msg.style.opacity = "0";
    setTimeout(() => msg.remove(), 300);
  }, 3000);
}

// Add CSS for spinning animation
const style = document.createElement("style");
style.textContent = `
  .spin {
      animation: spin 1s linear infinite;
  }
  @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
  }
  .quiz-refresh-container {
      transition: all 0.3s ease;
  }
`;
document.head.appendChild(style);

document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Initializing quiz client...");

  try {
    // Always force refresh on initial load
    await quizClient.fetchQuizzes();
    quizClient.renderQuizzes();

    // Initialize auto-refresh
    quizClient.initAutoRefresh();

    console.log("✅ Quiz client initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize quiz client:", error);
    
    // Show detailed error in UI
    quizClient.showErrorInUI('Failed to load quizzes: ' + error.message);
    showTempMessage("Failed to load quizzes: " + error.message, "error");
  }
});

window.refreshQuizzes = manualRefresh;