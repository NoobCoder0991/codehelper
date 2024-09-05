
sendPostRequest("/user-data")
    .then(data => {

        console.log(data);

        if (data.ok) {

            const userData = data.userData;
            document.getElementsByClassName('first-name')[0].textContent = userData.firstName;
            document.getElementsByClassName('last-name')[0].textContent = userData.lastName;

            const myQuestions = userData.questions, mySolutions = userData.solutions;
            let asked = myQuestions.length, solved = mySolutions.length;
            document.getElementById('my-questions-count').textContent = asked;
            document.getElementById('my-solutions-count').textContent = solved;
            for (let i = 0; i < asked; i++) {
                const container = createQuestionContainer(myQuestions[i]);
                document.getElementById('my-questions-table-body').appendChild(container);
            }
            for (let i = 0; i < solved; i++) {
                const container = createMySolutionContainer(mySolutions[i]);
                document.getElementById('my-solutions-table-body').appendChild(container);
            }

            if (asked == 0) {
                document.getElementById('no-questions').classList.remove('hide');
            }
            if (solved == 0) {
                document.getElementById('no-solutions').classList.remove('hide');
            }

        }

        else {

            console.error("Error fetching the data", response.errMessage)

        }
    })
    .catch(err => {
        console.error("Something went wrong", err);
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
