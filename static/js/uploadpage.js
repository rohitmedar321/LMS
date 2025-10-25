let courses = JSON.parse(localStorage.getItem("courses")) || []
let uploadedFiles = {
  image: null,
  video: null,
  pdf: null,
}

document.addEventListener("DOMContentLoaded", () => {

  setupEventListeners()
})

// Convert any file to Base64
function fileToBase64(file, callback) {
  const reader = new FileReader()
  reader.onloadend = () => callback(reader.result)
  reader.readAsDataURL(file)
}

function handleFileUpload(event, fileType) {
  const file = event.target.files[0]
  if (!file) return

  if (fileType === "image" && file.type.startsWith("image/")) {
    // Convert image to Base64
    fileToBase64(file, (base64) => {
      uploadedFiles.image = base64

      // Update label
      document.getElementById("course-management-image-label").textContent = `${file.name} (${formatFileSize(file.size)})`

      // Show preview
      const preview = document.getElementById("course-management-image-preview")
      if (preview) {
        preview.innerHTML = `<img src="${base64}" alt="Preview" class="image-preview">
                             <p class="upload-text">Click to change</p>`
      }
    })
  } else {
    // For video and PDF, keep file object
    uploadedFiles[fileType] = file
    const labelId = "course-management-" + fileType + "-label"
    document.getElementById(labelId).textContent = `${file.name} (${formatFileSize(file.size)})`
  }
}

// Event listeners
function setupEventListeners() {
  const addCourseBtn = document.getElementById("course-management-add-btn")
  const courseForm = document.getElementById("course-management-form")
  const modalOverlay = document.getElementById("course-management-modal-overlay")

  addCourseBtn.addEventListener("click", openCourseModal)
  courseForm.addEventListener("submit", handleCourseSubmit)
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeCourseModal()
  })

  // File upload listeners
  document.getElementById("course-management-image-upload").addEventListener("change", (e) => {
    handleFileUpload(e, "image")
  })
  document.getElementById("course-management-video-upload").addEventListener("change", (e) => {
    handleFileUpload(e, "video")
  })
  document.getElementById("course-management-pdf-upload").addEventListener("change", (e) => {
    handleFileUpload(e, "pdf")
  })
}



function createCourseCard(course) {
  const date = new Date(course.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return `
    <div class="course-card">
      <div class="course-header">
        <div class="course-info">
          <h3 class="course-title">${escapeHtml(course.title)}</h3>
          <p class="course-description">${escapeHtml(course.description)}</p>
        </div>
        <div class="course-actions">
          <button class="btn btn-outline btn-sm" onclick="editCourse('${course.id}')">
            <i data-lucide="edit"></i>
          </button>
          <button class="btn btn-outline btn-sm delete" onclick="deleteCourse('${course.id}')">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>
      ${
        course.image
          ? `<div class="course-image-preview">
        <img src="${course.image}" alt="${course.title}" class="course-thumbnail">
      </div>`
          : ""
      }
      <div class="course-badges">
        ${course.image ? '<span class="badge"><i data-lucide="image"></i>Image</span>' : ""}
        ${course.video ? '<span class="badge"><i data-lucide="video"></i>Video</span>' : ""}
        ${course.pdf ? '<span class="badge"><i data-lucide="file-text"></i>PDF</span>' : ""}
      </div>
      <p class="course-date">Created ${date}</p>
    </div>
  `
}



// Modal functions
function openCourseModal() {
  const modalOverlay = document.getElementById("course-management-modal-overlay")
  modalOverlay.classList.add("active")
  document.body.style.overflow = "hidden"
}

function closeCourseModal() {
  const modalOverlay = document.getElementById("course-management-modal-overlay")
  modalOverlay.classList.remove("active")
  document.body.style.overflow = ""
  resetCourseForm()
}


function resetCourseForm() {
  document.getElementById("course-management-form").reset()
  uploadedFiles = { image: null, video: null, pdf: null }

  document.getElementById("course-management-image-label").textContent = "Upload Image"
  document.getElementById("course-management-video-label").textContent = "Upload MP4 Video"
  document.getElementById("course-management-pdf-label").textContent = "Upload PDF"

  const preview = document.getElementById("course-management-image-preview")
  if (preview) {
    preview.innerHTML = `<i data-lucide="image"></i><p class="upload-text">Upload Image</p>`
  }
}

function showSuccessMessage() {
  const successMessage = document.getElementById("course-management-success")
  if (successMessage) {
    successMessage.style.display = "block"
    setTimeout(() => (successMessage.style.display = "none"), 3000)
  }
}

// Course actions
function editCourse(courseId) {
  const course = courses.find((c) => c.id === courseId)
  if (!course) return

  // Populate form with existing data
  document.getElementById("course-management-title").value = course.title
  document.getElementById("course-management-description").value = course.description

  // Set uploaded files
  uploadedFiles.image = course.image
  uploadedFiles.video = course.video
  uploadedFiles.pdf = course.pdf

  // Update labels
  if (course.image) document.getElementById("course-management-image-label").textContent = "Image uploaded"
  if (course.video) document.getElementById("course-management-video-label").textContent = "Video uploaded"
  if (course.pdf) document.getElementById("course-management-pdf-label").textContent = "PDF uploaded"

  openCourseModal()
}




// Helper functions
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}



function editCourse(courseId) {
  const course = courses.find((c) => c.id === courseId)
  if (!course) return

  editingCourseId = courseId

  document.getElementById("course-management-title").value = course.title
  document.getElementById("course-management-description").value = course.description
  uploadedFiles.image = course.image
  uploadedFiles.video = course.video
  uploadedFiles.pdf = course.pdf

  if (course.image) document.getElementById("course-management-image-label").textContent = "Image uploaded"
  if (course.video) document.getElementById("course-management-video-label").textContent = "Video uploaded"
  if (course.pdf) document.getElementById("course-management-pdf-label").textContent = "PDF uploaded"

  openCourseModal()
}

async function handleCourseSubmit(e) {
  console.log("Handling course submit")
  e.preventDefault()

  const title = document.getElementById("course-management-title").value.trim()
  const description = document.getElementById("course-management-description").value.trim()

  if (!title || !description) {
    alert("Please fill in title and description")
    return
  }

  // Build FormData for multipart upload
  const formData = new FormData()
  formData.append("title", title)
  formData.append("description", description)

  if (uploadedFiles.image) {
    formData.append("thumnail", uploadedFiles.image) // field name must match multer config if you add it
  }
  if (uploadedFiles.video) {
    formData.append("video", uploadedFiles.video)
  }
  if (uploadedFiles.pdf) {
    formData.append("pdf", uploadedFiles.pdf)
  }

  console.log("FormData prepared:", [...formData.entries()])

  let data = await api.course.POST(formData)

  console.log("API Response:", data)

  if (data && data.course) {
    courses.unshift(data.course) // use server’s response (with lessonId, src, etc.)
  }

  resetCourseForm()
  renderCourses()
  closeCourseModal()
}

const cardContainer = document.getElementById('course-management-grid')
const course = []

const rendercourse = (id) => {
    const src = baseUrl + `/course?id=${id}`;
    window.location.href = src
}

const deleteCourse = async (id) => {

  let response = await api.course.DELETE(id)
  console.log("Delete response:", response)

}


const load = async (data) => {

    data.forEach((course, index) =>  {

    let src = (course.image)? course.image : "https://i.pinimg.com/736x/40/6d/ce/406dce9382c8e46b34725e95ee3c9f35.jpg";

    const html = `     
        <div class="card">

        <div class="card-header">
            <img
                src=${src}
                alt="Course thumbnail"
                class="card-image"
            />
            <h3 class="card-title">
                ${course.title}
            </h3>
        </div>
  
        <div class="card-content">
            <p class="card-description">
                ${course.description}
            </p>
        </div>

        <div class="card-footer" data-course-id="${course.id}">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;"> 
              <button class="btn"  onclick="rendercourse(${course.id})" style="background-color: #2268ffff; color: white;">
                  Edit Course
              </button>
              <button class="btn"  onclick="deleteCourse(${course.id})" style="background-color: #de3131ff; color: white;">
                  Delete Course
              </button>
            </div>

            <button class="btn"  onclick="rendercourse(${course.id})">
                view course
            </button>
        </div>
    </div>`;

    cardContainer.insertAdjacentHTML('beforeend', html);
    
  });

};


document.addEventListener("DOMContentLoaded", async () => {
  
  let  courses = await api.course.GET

  console.log("Courses loaded:", courses)
  document.getElementById("course_count").innerHTML = courses.length;

  load(courses);

})