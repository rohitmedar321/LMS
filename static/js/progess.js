document.addEventListener('DOMContentLoaded', async function() {

    let data = await api.user();


    document.getElementById('username').textContent = data.name || 'User';
    document.getElementById('numberofcourses').textContent = data.mycoursesid ? data.mycoursesid.length : 0;
})