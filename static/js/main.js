

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


const api = {
    allcourse: ()=> fetchroutes('allcourse'),
    getcourseByIds: (ids)=> fetchroutes(`allcourse?ids=${ids}`),
    allquiz: {
        getAllQuizSummary: fetchroutes('allquiz'),
        GetQuizById: (data) => fetchroutes(`allquiz?id=${encodeURIComponent(data)}`),
    },
    getallquiz: ()=> fetchroutes('getallquiz'),
    user: ()=> fetchroutes('user'),
    usercourse: ()=> fetchroutes('usercourse'),
    getcertificate: () => fetchroutes('getbundle')
}
