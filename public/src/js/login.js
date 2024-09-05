
const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', async (e) => {

    e.preventDefault();
    const formData = new FormData(loginForm);
    const data = Object.fromEntries(formData.entries());
    const result = await sendPostRequest('/auth', data);
    if (result.ok) {
        window.location.href = '/';
    }
    else {
        console.log("Failed login : ", result.errMessage)

    }
})

async function sendPostRequest(endPoint, data) {
    try {
        const response = await fetch(endPoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error occurred:", error);
        return null; // or handle the error as needed
    }
}
