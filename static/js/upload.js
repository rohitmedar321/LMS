// Global state
let courses = JSON.parse(localStorage.getItem("courses")) || [];
let uploadedFiles = {
  image: null,
  video: null,
  pdf: null,
};

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  updateCourseCount();
  renderSavedCourses();

  // Form submission
  document
    .getElementById("courseForm")
    .addEventListener("submit", handleFormSubmit);
});

// Navigation functions
function showCreatePage() {
  document.getElementById("createPage").style.display = "block";
  document.getElementById("savedPage").style.display = "none";

  // Update navigation buttons
  document
    .querySelectorAll(".nav-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document.querySelectorAll(".nav-btn")[0].classList.add("active");
}

function showSavedPage() {
  document.getElementById("createPage").style.display = "none";
  document.getElementById("savedPage").style.display = "block";

  // Update navigation buttons
  document
    .querySelectorAll(".nav-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document.querySelectorAll(".nav-btn")[1].classList.add("active");

  renderSavedCourses();
}

function imageToBase64(file, callback) {
  const reader = new FileReader();
  reader.onloadend = () => {
    callback(reader.result);
  };
  reader.readAsDataURL(file);
}

const handleImageUpload = (event, fileType) => {
  const file = event.target.files[0];
  let input = document.getElementById("thumnail");

  if (!file) return;

  imageToBase64(file, (base64Image) => {
    input.value = base64Image;
  });
};

// File upload handling
function handleFileUpload(event, fileType) {
  const file = event.target.files[0];
  if (!file) return;

  uploadedFiles[fileType] = file;

  // Update file info
  const infoElement = document.getElementById(fileType + "Info");
  infoElement.textContent = `${file.name} (${formatFileSize(file.size)})`;

  // Handle image preview
  if (fileType === "image" && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = document.getElementById("imagePreview");
      preview.innerHTML = `
                        <img src="${e.target.result}" alt="Preview" class="image-preview">
                        <p class="upload-text">Click to change</p>
                    `;
    };
    reader.readAsDataURL(file);
  }
}

// Form submission
async function handleFormSubmit(event) {
  event.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();

  if (!title || !description) {
    alert("Please fill in title and description");
    return;
  }

  // Show loading state
  const submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = true;
  submitBtn.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Saving Course...';

  // Simulate saving process
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // console.log("Files to upload:", uploadedFiles.image);
  // Create new course
  const newCourse = {
    id: Date.now().toString(),
    title: title,
    description: description,
    image: uploadedFiles.image,
    video: uploadedFiles.video,
    pdf: uploadedFiles.pdf,
    createdAt: new Date().toISOString(),
  };

  // Save to courses array and localStorage
  courses.unshift(newCourse);
  saveCourses();

  // Reset form
  resetForm();

  // Show success message
  showSuccessMessage();

  // Reset submit button
  submitBtn.disabled = false;
  submitBtn.innerHTML = '<i class="fas fa-upload"></i> Save Course';

  // Update course count
  updateCourseCount();
}

// Reset form
function resetForm() {
  document.getElementById("courseForm").reset();
  uploadedFiles = { image: null, video: null, pdf: null };

  // Reset file info
  document.getElementById("imageInfo").textContent = "";
  document.getElementById("videoInfo").textContent = "";
  document.getElementById("pdfInfo").textContent = "";

  // Reset image preview
  document.getElementById("imagePreview").innerHTML = `
                <i class="fas fa-image upload-icon"></i>
                <p class="upload-text">Upload Image</p>
            `;
}

// Show success message
function showSuccessMessage() {
  const successMessage = document.getElementById("successMessage");
  successMessage.style.display = "block";

  // Hide after 3 seconds
  setTimeout(() => {
    successMessage.style.display = "none";
  }, 3000);
}

// Update course count
function updateCourseCount() {
  const count = courses.length;
  const badge = document.getElementById("courseCountBadge");
  const countText = document.getElementById("courseCount");

  badge.textContent = count;
  badge.style.display = count > 0 ? "inline" : "none";

  if (countText) {
    countText.textContent = `${count} ${count === 1 ? "course" : "courses"}`;
  }
}

// Render saved courses
function renderSavedCourses() {
  const emptyState = document.getElementById("emptyState");
  const coursesGrid = document.getElementById("coursesGrid");

  if (courses.length === 0) {
    emptyState.style.display = "block";
    coursesGrid.style.display = "none";
    return;
  }

  emptyState.style.display = "none";
  coursesGrid.style.display = "grid";

  coursesGrid.innerHTML = courses
    .map((course) => createCourseCard(course))
    .join("");
}

// Create course card HTML
function createCourseCard(course) {

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
            <button class="btn"  onclick="rendercourse(${course.id})">
                Start Learning
            </button>
        </div>
    </div>`;

    cardContainer.insertAdjacentHTML('beforeend', html);
    
  });
}

// Delete course
function deleteCourse(courseId) {
  if (confirm("Are you sure you want to delete this course?")) {
    courses = courses.filter((course) => course.id !== courseId);
    saveCourses();
    renderSavedCourses();
    updateCourseCount();
  }
}

// Save courses to localStorage
function saveCourses() {
  // Note: Files can't be stored in localStorage, so we'll store course data without files
  // In a real application, you'd upload files to a server and store URLs
  const coursesData = courses.map((course) => ({
    ...course,
    image: course.image
      ? { name: course.image.name, size: course.image.size }
      : null,
    video: course.video
      ? { name: course.video.name, size: course.video.size }
      : null,
    pdf: course.pdf ? { name: course.pdf.name, size: course.pdf.size } : null,
  }));
  localStorage.setItem("courses", JSON.stringify(coursesData));
}

// Utility functions
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


document.addEventListener("DOMContentLoaded", async () => {

  const courses = await api.course.GET;
  // console.log("Courses fetched:", courses);

  load(courses);

})