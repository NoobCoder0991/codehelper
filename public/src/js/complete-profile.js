

const formElement = document.getElementById("login-form");
const submitButton = document.getElementsByClassName("login-button")[0];

sendPostRequest('/get-incomplete-profile-data').then(response => {
    if (response.ok) {
        document.getElementById('email').textContent = response.email;
    }
    else {

        showErrorMessage(response.errMessage)

    }
}).catch(err => {
    showErrorMessage(err);
})




formElement.addEventListener('submit', async (event) => {

    event.preventDefault();
    const formData = new FormData(formElement);
    const data = Object.fromEntries(formData.entries());
    console.log(data)

    if (data.password != data.confirm_password) {
        showErrorMessage('Passwords do not match.')

    }
    else {

        try {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class ="fas fa-spinner fa-spin"></i>'

            const response = await sendPostRequest('/complete-profile', data);

            submitButton.disabled = false;
            submitButton.innerHTML = 'Register'
            if (response.ok) {

                window.location.href = '/';

            }
            else {

                showErrorMessage(response.errMessage)

            }
        } catch (error) {
            showErrorMessage(error)
        }
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