

function createQuestionContainer(question) {

    const tr = document.createElement('tr');

    // Create and append the <td> for question title
    const titleTd = document.createElement('td');
    titleTd.className = 'question-title';
    titleTd.innerHTML = `<a href='/question/id/${question.questionId}'>${question.title}</a>`;
    tr.appendChild(titleTd);

    // Create and append the <td> for status
    const statusTd = document.createElement('td');
    const statusIcon = document.createElement('i');
    statusIcon.className = `fas ${question.solved === true ? 'fa-check-circle solved' : 'fa-question-circle pending'}`;
    statusTd.appendChild(statusIcon);
    statusTd.appendChild(document.createTextNode(` ${question.solved === true ? 'Solved' : 'Unsolved'}`));
    tr.appendChild(statusTd);


    // Create and append the <td> for action
    const actionTd = document.createElement('td');
    const actionElement = document.createElement('action');
    actionElement.textContent = "Answer";
    actionTd.appendChild(actionElement);
    tr.appendChild(actionTd);


    return tr;

}


function createMySolutionContainer(solution) {
    const tr = document.createElement('tr');

    // Create and append the <td> for title
    const titleTd = document.createElement('td');
    titleTd.textContent = solution.title;
    tr.appendChild(titleTd);

    // Create and append the <td> for up votes
    const upVotesTd = document.createElement('td');
    upVotesTd.innerHTML = `${solution.upVotes} <i class="fas fa-thumbs-up"></i>`;
    tr.appendChild(upVotesTd);

    // Create and append the <td> for down votes
    const downVotesTd = document.createElement('td');
    downVotesTd.innerHTML = `${solution.downVotes} <i class="fas fa-thumbs-down"></i>`;
    tr.appendChild(downVotesTd);

    // Create and append the <td> for action
    const actionTd = document.createElement('td');
    actionTd.textContent = 'View';
    tr.appendChild(actionTd);

    return tr;
}


// Function to create the solution container dynamically
function createSolutionContainer(solution) {
    // Create container and inner elements
    const container = document.createElement('div');
    container.className = 'container solution-container';

    const header = document.createElement('div');
    header.className = 'solution-header';

    const title = document.createElement('h2');
    title.className = 'title';
    title.textContent = solution.title;

    const author = document.createElement('div');
    author.className = 'author';
    author.textContent = solution.author;

    header.appendChild(title);
    header.appendChild(author);

    const solutionContent = document.createElement('span');
    solutionContent.className = 'solution';
    solutionContent.textContent = solution.solution;

    const options = document.createElement('div');
    options.className = 'solution-options';

    const thumbsUp = document.createElement('div');
    thumbsUp.className = 'solution-option';
    thumbsUp.innerHTML = `<div class="fas fa-thumbs-up"></div><div class="count">${solution.upVotes}</div>`;

    const thumbsDown = document.createElement('div');
    thumbsDown.className = 'solution-option';
    thumbsDown.innerHTML = `<div class="fas fa-thumbs-down"></div><div class="count">${solution.downVotes}</div>`;

    const download = document.createElement('div');
    download.className = 'solution-option';
    download.innerHTML = '<div class="fa-solid fa-download"></div>';

    const moreSolutions = document.createElement('div');
    moreSolutions.className = 'more-solutions button';
    moreSolutions.innerHTML = '<i class="fas fa-solid fa-chevron-right"></i>';

    options.appendChild(thumbsUp);
    options.appendChild(thumbsDown);
    options.appendChild(download);
    options.appendChild(moreSolutions);

    // Append header, solution, and options to container
    container.appendChild(header);
    container.appendChild(solutionContent);
    container.appendChild(options);

    return container;
}


