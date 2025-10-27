const baseUrl = `${location.protocol}//${location.host}`;

const fetchroutes = async (route) => {
  try {
    const cacheBustedRoute = route.includes("?")
      ? `${route}&t=${Date.now()}`
      : `${route}?t=${Date.now()}`;
    const response = await fetch(`${baseUrl}/api/${cacheBustedRoute}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    document.dispatchEvent(new CustomEvent("apiError", { detail: error }));
    return null;
  }
};

const Postroutes = async (route, data) => {
  try {
    console.log(`📤 POST to ${route}:`, data);

    const response = await fetch(`${baseUrl}/api/${route}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(
        responseData.message || `HTTP error! status: ${response.status}`
      );
    }

    console.log(`✅ POST Response:`, responseData);
    return responseData;
  } catch (error) {
    console.error("❌ POST Fetch error:", error);
    document.dispatchEvent(new CustomEvent("apiError", { detail: error }));
    return { success: false, message: error.message };
  }
};

const Putroutes = async (route, data) => {
  try {
    console.log(`📤 PUT to ${route}:`, data);

    const response = await fetch(`${baseUrl}/api/${route}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(
        responseData.message || `HTTP error! status: ${response.status}`
      );
    }

    console.log(`✅ PUT Response:`, responseData);
    return responseData;
  } catch (error) {
    console.error("❌ PUT Fetch error:", error);
    document.dispatchEvent(new CustomEvent("apiError", { detail: error }));
    return { success: false, message: error.message };
  }
};

const PostFormData = async (route, formData) => {
  try {
    const response = await fetch(`${baseUrl}/${route}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    document.dispatchEvent(new CustomEvent("apiError", { detail: error }));
    return null;
  }
};

// FIXED: Updated API service to match backend endpoints
const api = {
  quiz: {
    GET: () => fetchroutes("allquiz"),
    POST: (data) => Postroutes("setquiz", data),
    PUT: (id, data) => Putroutes(`quiz/${id}`, data), // CHANGED: from updatequiz/${id} to quiz/${id}
    DELETE: (id) => fetchroutes(`deletequiz/${id}`),
    GET_BY_ID: (id) => fetchroutes(`quiz/${id}`),
  },
  course: {
    POST: (data) => PostFormData("upload", data),
    GET: () => fetchroutes("allcourse"),
    DELETE: (id) => fetchroutes(`deletecourse/${id}`),
  },
  allquiz: {
    getAllQuizSummary: () => fetchroutes("allquiz"),
    getAllQuizSummaryWithCacheBust: () => fetchroutes("allquiz"),
  },
};

// Global error handling
document.addEventListener("apiError", (event) => {
  console.error("Global API Error:", event.detail);
});
