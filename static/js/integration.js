// Integration state
let integrationKeys = [
  {
    id: "1",
    name: "Default Integration Key",
    key: "sk-1234567890abcdef1234567890abcdef",
    createdAt: "2024-01-15",
    lastUsed: "2 hours ago",
  },
]

const showIntegrationKeys = {}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  renderIntegrationKeys()

  // Add enter key support for modal input
  document.getElementById("integration-key-name").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handleCreateIntegrationKey()
    }
  })
})

// Generate a random integration key
function generateIntegrationKey() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let result = "sk-"
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Show toast notification
function showToast(title, description, type = "success") {
  const toastContainer = document.getElementById("integration-toast-container")
  const toast = document.createElement("div")
  toast.className = `integration-toast integration-${type}`

  toast.innerHTML = `
        <div class="integration-toast-title">${title}</div>
        <div class="integration-toast-description">${description}</div>
    `

  toastContainer.appendChild(toast)

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.remove()
  }, 3000)
}

// Copy text to clipboard
async function copyToClipboard(text, type) {
  try {
    await navigator.clipboard.writeText(text)
    showToast("Copied!", `${type} copied to clipboard`)
  } catch (err) {
    showToast("Failed to copy", "Please copy manually", "error")
  }
}

// Open add integration key modal
function openAddIntegrationDialog() {
  document.getElementById("integration-add-modal").classList.add("integration-show")
  document.getElementById("integration-key-name").focus()
}

// Close add integration key modal
function closeAddIntegrationDialog() {
  document.getElementById("integration-add-modal").classList.remove("integration-show")
  document.getElementById("integration-key-name").value = ""
}

// Create new integration key
function handleCreateIntegrationKey() {
  const nameInput = document.getElementById("integration-key-name")
  const name = nameInput.value.trim()

  if (!name) {
    showToast("Name required", "Please enter a name for your integration key", "error")
    return
  }

  const newIntegrationKey = {
    id: Date.now().toString(),
    name: name,
    key: generateIntegrationKey(),
    createdAt: new Date().toISOString().split("T")[0],
    lastUsed: "Never",
  }

  integrationKeys.push(newIntegrationKey)
  renderIntegrationKeys()
  closeAddIntegrationDialog()

  showToast("Integration Key Created", `"${newIntegrationKey.name}" has been created successfully`)
}

// Delete integration key
function handleDeleteIntegrationKey(id, name) {
  integrationKeys = integrationKeys.filter((key) => key.id !== id)
  delete showIntegrationKeys[id]
  renderIntegrationKeys()
  showToast("Integration Key Deleted", `"${name}" has been permanently deleted`, "error")
}

// Toggle integration key visibility
function toggleIntegrationKeyVisibility(id) {
  showIntegrationKeys[id] = !showIntegrationKeys[id]
  renderIntegrationKeys()
}

// Delete integration
function handleDeleteIntegration() {
  showToast("Integration Deleted", "Your integration has been permanently deleted", "error")
}

// Render all integration keys
function renderIntegrationKeys() {
  const container = document.getElementById("integration-keys-container")

  container.innerHTML = integrationKeys
    .map(
      (integrationKey) => `
        <div class="integration-key-item">
            <div class="integration-key-header">
                <h4 class="integration-key-name">${integrationKey.name}</h4>
                <span class="integration-badge integration-badge-secondary">Created ${integrationKey.createdAt}</span>
            </div>
            
            <div class="integration-input-group">
                <label for="integration-key-${integrationKey.id}">Integration Key</label>
                <div class="integration-input-with-buttons">
                    <input 
                        type="${showIntegrationKeys[integrationKey.id] ? "text" : "password"}" 
                        id="integration-key-${integrationKey.id}" 
                        value="${integrationKey.key}" 
                        readonly 
                        class="integration-mono-font"
                    >
                    <button class="integration-btn-outline integration-btn-icon" onclick="toggleIntegrationKeyVisibility('${integrationKey.id}')" title="Toggle visibility">
                        <svg class="integration-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            ${
                              showIntegrationKeys[integrationKey.id]
                                ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>'
                                : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>'
                            }
                        </svg>
                    </button>
                    <button class="integration-btn-outline integration-btn-icon" onclick="copyToClipboard('${integrationKey.key}', 'Integration Key')" title="Copy">
                        <svg class="integration-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </button>
                </div>
            </div>
            
            <div class="integration-usage-instructions">
                <h5>Usage Instructions</h5>
                <p>Include this integration key in your requests:</p>
                <code>Authorization: Bearer ${showIntegrationKeys[integrationKey.id] ? integrationKey.key : "••••••••••••••••"}</code>
            </div>
            
            <div class="integration-key-footer">
                <div class="integration-last-used-info">
                    <p>Last Used</p>
                    <p>${integrationKey.lastUsed}</p>
                </div>
                <button class="integration-btn-destructive" onclick="handleDeleteIntegrationKey('${integrationKey.id}', '${integrationKey.name}')">
                    <svg class="integration-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2 2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Delete
                </button>
            </div>
        </div>
    `,
    )
    .join("")
}

// Close modal when clicking outside
document.addEventListener("click", (e) => {
  const modal = document.getElementById("integration-add-modal")
  if (e.target === modal) {
    closeAddIntegrationDialog()
  }
})
