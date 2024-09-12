
const formElement = document.getElementById("form");
const titleInput = document.getElementById('question-title');
const descriptionInput = document.getElementById('description');
const submitButton = document.getElementsByClassName('question-submit')[0];


formElement.addEventListener('submit', async (event) => {
    event.preventDefault();

    const title = titleInput.textContent;
    const description = descriptionInput.innerText.trim();

    if (title.length && description.length) {
        try {
            submitButton.disabled = true
            submitButton.innerHTML = "<i class='fas fa-spinner fa-spin'></i> Posting";
            const response = await sendPostRequest("/post-question", { title, description });

            submitButton.innerHTML = "<i class='far fa-paper-plane'></i> Post";
            submitButton.disabled = false

            if (response.ok) {
                showSuccessMessage("Question successfully uploaded with question id = " + response.questionId);
            }
            else {
                showErrorMessage(response.errMessage);
            }

        } catch (error) {

            console.log(error)

            showErrorMessage("Something wrong", error);

        }
    }
    else {
        showErrorMessage("Title and description can not be empty!")
    }
})


titleInput.addEventListener('keydown', (event) => {
    if (event.key == 'Enter') {
        event.preventDefault();
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
    hideSuccessMessage();
    const errorMessageContainer = document.getElementsByClassName('error-message')[0];
    errorMessageContainer.getElementsByClassName("error-message-content")[0].textContent = message;
    errorMessageContainer.classList.remove('hide');
}

function hideErrorMessage() {

    const errorMessageContainer = document.getElementsByClassName('error-message')[0];
    errorMessageContainer.classList.add('hide');
}

function showSuccessMessage(message) {
    hideErrorMessage();
    const errorMessageContainer = document.getElementsByClassName('success-message')[0];
    errorMessageContainer.getElementsByClassName("success-message-content")[0].textContent = message;
    errorMessageContainer.classList.remove('hide');
}
function hideSuccessMessage() {

    const errorMessageContainer = document.getElementsByClassName('success-message')[0];
    errorMessageContainer.classList.add('hide');
}


descriptionInput.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key == 'b') {
        e.preventDefault();
        insertSpecial('**Bold**', 2, 6);
    }
    if (e.ctrlKey && e.key == 'i') {
        e.preventDefault();
        insertSpecial('*Italic*', 1, 7);
    }
    if (e.ctrlKey && e.key == 'u') {
        e.preventDefault();
        insertSpecial('__Underline__', 2, 11);
    }
})