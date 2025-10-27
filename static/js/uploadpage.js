let uploadedFiles = {
  image: null,
  video: null,
  pdf: null,
};

document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  loadCourses(); // Load courses on page load
});

// Convert any file to Base64
function fileToBase64(file, callback) {
  const reader = new FileReader();
  reader.onloadend = () => callback(reader.result);
  reader.readAsDataURL(file);
}

function handleFileUpload(event, fileType) {
  const file = event.target.files[0];
  if (!file) return;

  if (fileType === "image" && file.type.startsWith("image/")) {
    // Convert image to Base64
    fileToBase64(file, (base64) => {
      uploadedFiles.image = base64;

      // Update label
      document.getElementById("course-management-image-label").textContent = `${
        file.name
      } (${formatFileSize(file.size)})`;

      // Show preview
      const preview = document.getElementById(
        "course-management-image-preview"
      );
      if (preview) {
        preview.innerHTML = `<img src="${base64}" alt="Preview" class="image-preview">
                             <p class="upload-text">Click to change</p>`;
      }
    });
  } else {
    // For video and PDF, keep file object
    uploadedFiles[fileType] = file;
    const labelId = "course-management-" + fileType + "-label";
    document.getElementById(labelId).textContent = `${
      file.name
    } (${formatFileSize(file.size)})`;
  }
}

// Event listeners
function setupEventListeners() {
  const addCourseBtn = document.getElementById("course-management-add-btn");
  const courseForm = document.getElementById("course-management-form");
  const modalOverlay = document.getElementById(
    "course-management-modal-overlay"
  );

  if (addCourseBtn) addCourseBtn.addEventListener("click", openCourseModal);
  if (courseForm) courseForm.addEventListener("submit", handleCourseSubmit);
  if (modalOverlay)
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeCourseModal();
    });

  // File upload listeners
  document
    .getElementById("course-management-image-upload")
    ?.addEventListener("change", (e) => {
      handleFileUpload(e, "image");
    });
  document
    .getElementById("course-management-video-upload")
    ?.addEventListener("change", (e) => {
      handleFileUpload(e, "video");
    });
  document
    .getElementById("course-management-pdf-upload")
    ?.addEventListener("change", (e) => {
      handleFileUpload(e, "pdf");
    });
}

// ADD THIS MISSING FUNCTION
function renderCourses() {
  loadCourses();
}

// ADD THIS FUNCTION TO LOAD COURSES
async function loadCourses() {
  try {
    const cardContainer = document.getElementById("course-management-grid");
    if (!cardContainer) return;

    // Clear existing content
    cardContainer.innerHTML = "";

    console.log("Loading courses from API...");
    const courses = await api.course.GET(); // FIXED: Added parentheses

    console.log("Courses loaded:", courses);

    if (document.getElementById("course_count")) {
      document.getElementById("course_count").innerHTML = courses?.length || 0;
    }

    if (courses && Array.isArray(courses)) {
      load(courses);
    } else {
      console.error("Courses data is not an array:", courses);
      cardContainer.innerHTML = "<p>No courses found</p>";
    }
  } catch (error) {
    console.error("Error loading courses:", error);
  }
}

function createCourseCard(course) {
  const date = new Date(course.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
    <div class="course-card">
      <div class="course-header">
        <div class="course-info">
          <h3 class="course-title">${escapeHtml(course.title)}</h3>
          <p class="course-description">${escapeHtml(course.description)}</p>
        </div>
        <div class="course-actions">
          <button class="btn btn-outline btn-sm" onclick="editCourse('${
            course.id
          }')">
            <i data-lucide="edit"></i>
          </button>
          <button class="btn btn-outline btn-sm delete" onclick="deleteCourse('${
            course.id
          }')">
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
        ${
          course.image
            ? '<span class="badge"><i data-lucide="image"></i>Image</span>'
            : ""
        }
        ${
          course.video
            ? '<span class="badge"><i data-lucide="video"></i>Video</span>'
            : ""
        }
        ${
          course.pdf
            ? '<span class="badge"><i data-lucide="file-text"></i>PDF</span>'
            : ""
        }
      </div>
      <p class="course-date">Created ${date}</p>
    </div>
  `;
}

// Modal functions
function openCourseModal() {
  const modalOverlay = document.getElementById(
    "course-management-modal-overlay"
  );
  if (modalOverlay) {
    modalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeCourseModal() {
  const modalOverlay = document.getElementById(
    "course-management-modal-overlay"
  );
  if (modalOverlay) {
    modalOverlay.classList.remove("active");
    document.body.style.overflow = "";
    resetCourseForm();
  }
}

function resetCourseForm() {
  document.getElementById("course-management-form")?.reset();
  uploadedFiles = { image: null, video: null, pdf: null };

  document.getElementById("course-management-image-label").textContent =
    "Upload Image";
  document.getElementById("course-management-video-label").textContent =
    "Upload MP4 Video";
  document.getElementById("course-management-pdf-label").textContent =
    "Upload PDF";

  const preview = document.getElementById("course-management-image-preview");
  if (preview) {
    preview.innerHTML = `<i data-lucide="image"></i><p class="upload-text">Upload Image</p>`;
  }
}

function showSuccessMessage() {
  const successMessage = document.getElementById("course-management-success");
  if (successMessage) {
    successMessage.style.display = "block";
    setTimeout(() => (successMessage.style.display = "none"), 3000);
  }
}

// REMOVE DUPLICATE EDIT COURSE FUNCTION - KEEP ONLY THIS ONE
function editCourse(courseId) {
  // This would need to be implemented based on your data structure
  console.log("Edit course:", courseId);
  // You'll need to load the course data and populate the form
}

// Helper functions
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

async function handleCourseSubmit(e) {
  console.log("Handling course submit");
  e.preventDefault();

  const title = document.getElementById("course-management-title").value.trim();
  const description = document
    .getElementById("course-management-description")
    .value.trim();

  if (!title || !description) {
    alert("Please fill in title and description");
    return;
  }

  // Build FormData for multipart upload
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);

  if (uploadedFiles.image) {
    formData.append("thumnail", uploadedFiles.image);
  }
  if (uploadedFiles.video) {
    formData.append("video", uploadedFiles.video);
  }
  if (uploadedFiles.pdf) {
    formData.append("pdf", uploadedFiles.pdf);
  }

  console.log("FormData prepared:", [...formData.entries()]);

  try {
    let data = await api.course.POST(formData);
    console.log("API Response:", data);

    if (data && data.course) {
      showSuccessMessage();
      resetCourseForm();
      closeCourseModal();
      loadCourses(); // Reload courses after successful upload
    }
  } catch (error) {
    console.error("Error uploading course:", error);
    alert("Error uploading course: " + error.message);
  }
}

// EDIT COURSE - goes to edit form
const editCoursePage = (id) => {
  const src = baseUrl + `/edit-course?id=${id}`;
  window.location.href = src;
};

// VIEW COURSE - goes to video player
const viewCourse = (id) => {
  const src = baseUrl + `/course?id=${id}`;
  window.location.href = src;
};

const deleteCourse = async (id) => {
  if (confirm("Are you sure you want to delete this course?")) {
    try {
      let response = await api.course.DELETE(id);
      console.log("Delete response:", response);
      loadCourses(); // Reload courses after deletion
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Error deleting course: " + error.message);
    }
  }
};

const load = (data) => {
  const cardContainer = document.getElementById("course-management-grid");
  if (!cardContainer) return;

  // Clear existing content
  cardContainer.innerHTML = "";

  if (!data || !Array.isArray(data)) {
    console.error("Invalid data passed to load function:", data);
    cardContainer.innerHTML = "<p>No courses available</p>";
    return;
  }

  data.forEach((course, index) => {
    let src = course.image
      ? course.image
      : "https://i.pinimg.com/736x/40/6d/ce/406dce9382c8e46b34725e95ee3c9f35.jpg";

    const html = `     
        <div class="card">
        <div class="card-header">
            <img
                src="${src}"
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
              <button class="btn"  onclick="editCoursePage(${course.id})" style="background-color: #2268ffff; color: white;">
                  Edit Course
              </button>
              <button class="btn"  onclick="deleteCourse(${course.id})" style="background-color: #de3131ff; color: white;">
                  Delete Course
              </button>
            </div>

            <button class="btn"  onclick="viewCourse(${course.id})">
                View Course
            </button>
        </div>
    </div>`;

    cardContainer.insertAdjacentHTML("beforeend", html);
  });
};
