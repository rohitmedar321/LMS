const quizcontainer = document.getElementById('quiz-list')

const load = (data) => {

    data.forEach((element, index) => {
        

        const html = `  
        <tr class="quiz-row unlocked" data-quiz-id="4">
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
              <td class="quiz-name">${element.title}</td>
              <td>
                <span class="badge category-${ element.category.toLowerCase()}">${element.category}</span>
              </td>
              <td>
                <span class="badge difficulty-${ element.difficulty.toLowerCase()}">${element.difficulty}</span>
              </td>
              <td class="center">12</td>
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
                  6 min
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
            </tr>`

        quizcontainer.insertAdjacentHTML('beforeend', html);

    });

}

const openQuiz = (id) => {
    let url = `${baseUrl}/quizexam/${id}`;
    window.location.href = url;
}

document.addEventListener('DOMContentLoaded', async () => {
   
    const quizsummary = await api.allquiz.getAllQuizSummary;


    load(quizsummary);

})
