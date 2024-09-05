const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', async (event) => {

    event.preventDefault();

    const formData = new FormData(loginForm);
    const data = Object.fromEntries(formData.entries());
    const response = await sendPostRequest('/register', data)



    if (response.ok) {
        window.location.href = '/complete-profile';
    }
    else {

        showErrorMessage(response.errMessage)
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

function showErrorMessage(message) {
    const errorMessageContainer = document.getElementsByClassName('error-message')[0];
    errorMessageContainer.textContent = message;
    errorMessageContainer.classList.remove('hide');
}