const main = document.getElementsByClassName("main-content")[0];
const cardContainer = document.getElementsByClassName('grid')[0]
const course = []

const rendercourse = (id) => {
    const src = baseUrl + `/course?id=${id}`;
    window.location.href = src
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
        
            <button class="btn"  onclick="rendercourse(${course.id})">
                Start Learning
            </button>
        </div>
    </div>`;

    cardContainer.insertAdjacentHTML('beforeend', html);
    
  });

};

document.addEventListener("DOMContentLoaded", async () => {
  let courses;

  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get("ids")) {
    // call your API function with ?ids=...
    courses = await api.getcourseByIds(urlParams.get("ids"));
  } else {
    courses = await api.allcourse();
  }

  load(courses);
});
