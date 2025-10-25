let certificateData = { certificates: [] }  // flat certificates (bundles only)
let certificates;

// State management
const state = {
  searchQuery: "",
  viewMode: "grid",
}

// DOM elements
const elements = {
  gridViewBtn: document.getElementById("archive-gridViewBtn"),
  listViewBtn: document.getElementById("archive-listViewBtn"),
  homeBtn: document.getElementById("archive-homeBtn"),
  breadcrumbSeparator: document.getElementById("archive-breadcrumbSeparator"),
  currentFolder: document.getElementById("archive-currentFolder"),
  searchInput: document.getElementById("archive-searchInput"),
  folderView: document.getElementById("archive-folderView"),
  certificateView: document.getElementById("archive-certificateView"),
  foldersGrid: document.getElementById("archive-foldersGrid"),
  certificatesGrid: document.getElementById("archive-certificatesGrid"),
  totalBadge: document.getElementById("archive-totalBadge"),
  certificateBadge: document.getElementById("archive-certificateBadge"),
  folderTitle: document.getElementById("archive-folderTitle"),
  noCertificates: document.getElementById("archive-noCertificates"),
  noResultsMessage: document.getElementById("archive-noResultsMessage"),
}

// Initialize the app
async function init() {
  setupEventListeners()
  await fetchBundles()   // fetch from API
  updateTotalBadge()
  renderCertificates()   // directly render certificates (bundles)
  lucide.createIcons()
}

// Fetch bundles from API and keep bundles as certificates
async function fetchBundles() {
  try {
    const res = await api.getcertificate() // <-- replace with your actual API call
    const json = res
    if (!json.success) throw new Error(json.message)


    // Use bundles directly as certificates
    certificateData = {
      certificates: json.data.map(bundle => ({
        id: bundle.id,
        title: bundle.name, // bundle name
        status: bundle.status,
        completedCount: bundle.completeCourses.length,
        totalCourses: bundle.course_id.length,
        courseid: bundle.course_id
      }))
    }

  } catch (err) {
    console.error("Error fetching bundles:", err)
    certificateData = { certificates: [] }
  }
}

// Event listeners
function setupEventListeners() {
  elements.gridViewBtn.addEventListener("click", () => setViewMode("grid"))
  elements.listViewBtn.addEventListener("click", () => setViewMode("list"))
  elements.searchInput.addEventListener("input", (e) => setSearchQuery(e.target.value))
}

// State setters
function setViewMode(mode) {
  state.viewMode = mode
  elements.gridViewBtn.classList.toggle("archive-active", mode === "grid")
  elements.listViewBtn.classList.toggle("archive-active", mode === "list")
  updateGridLayout()
}

function setSearchQuery(query) {
  state.searchQuery = query
  renderCertificates()
}

// UI updates
function updateTotalBadge() {
  const total = certificateData.certificates.length
  elements.totalBadge.textContent = `${total} Total Certificates`
}

function updateGridLayout() {
  elements.certificatesGrid.className = `archive-grid ${state.viewMode}-view`
}

function showcourses (courseid){
  console.log(courseid)
  window.location.href = `${baseUrl}/courses?ids=${courseid}`
}

// Render bundles as certificates
function renderCertificates() {
  elements.folderView.classList.add("archive-hidden")
  elements.certificateView.classList.remove("archive-hidden")

  const filteredCertificates = getFilteredCertificates()

  elements.folderTitle.textContent = "Certificates"
  elements.certificateBadge.textContent = `${filteredCertificates.length} certificates`

  if (filteredCertificates.length === 0) {
    elements.certificatesGrid.classList.add("archive-hidden")
    elements.noCertificates.classList.remove("archive-hidden")
    elements.noResultsMessage.textContent = state.searchQuery
      ? "Try adjusting your search terms"
      : "No certificates yet"
  } else {
    elements.certificatesGrid.classList.remove("archive-hidden")
    elements.noCertificates.classList.add("archive-hidden")

    elements.certificatesGrid.innerHTML = filteredCertificates
      .map(
        (cert) => `
      <div class="card certificate-card">
        <div class="certificate-header">
          <div class="certificate-title-section">
            <div class="certificate-icon">
              <i data-lucide="file-badge" style="width:1.5rem; height:1.5rem; color:black;"></i>
            </div>
            <div class="certificate-title">
              <h3>${cert.title}</h3>
              <p class="certificate-course">Status: ${cert.status}</p>
            </div>
          </div>
        </div>
        <div class="certificate-details">
          <div class="certificate-detail">
            <i data-lucide="layers"></i>
            <span>${cert.completedCount} of ${cert.totalCourses} courses completed</span>
          </div>

          <button class="download-btn" onclick="showcourses('${cert.courseid}')">
            <i data-lucide="move-up-right"></i>
            view all courses
          </button>
          <button class="download-btn" onclick="downloadCertificate('${cert.id}')">
            <i data-lucide="download"></i>
            Download Certificate
          </button>
        </div>
      </div>
    `
      )
      .join("")
  }

  updateGridLayout()
  lucide.createIcons()
}

// Helper functions
function getFilteredCertificates() {
  return certificateData.certificates.filter(
    (cert) =>
      cert.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      cert.status.toLowerCase().includes(state.searchQuery.toLowerCase())
  )
}

function downloadCertificate(certId) {
  alert(`Downloading certificate bundle: ${certId}`)
  // TODO: implement actual download
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", init)
