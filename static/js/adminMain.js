    const baseUrl = `${location.protocol}//${location.host}`;

const fetchroutes = async (route) => {

    try {

        const response = await fetch(`${baseUrl}/api/${route}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }

}

const Postroutes = async (route, data) => {
    try {
        const response = await fetch(`${baseUrl}/api/${route}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body:  JSON.stringify(data), // no need for null, 2 unless you want pretty-printing
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
};


const PostFormData = async (route, formData) => {
    // console.log("Posting Form Data:", [...formData.entries()]); // log keys & values

    try {
        const response = await fetch(`${baseUrl}/${route}`, {
            method: "POST",
            body: formData // ✅ send FormData directly, no JSON.stringify
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Fetch error:", error);
        return null;
    }
};


const api = {
    quiz : {

        GET: fetchroutes('allquiz'),
        POST: (data) => Postroutes('setquiz', data),
        DELETE: (id) => fetchroutes(`deletequiz/${id}`)
        
    },
    course:{
        POST: (data) => PostFormData('upload', data),
        GET:  fetchroutes('allcourse'),
        DELETE: (id) => fetchroutes(`deletecourse/${id}`)
    }
}