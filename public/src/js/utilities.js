

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

function processHTML(html) {
    // Replace <b> or <strong> tags with double asterisks **
    html = html.replace(/<\/?(b|strong)>/gi, '**');

    // Replace <i> or <em> tags with single asterisks *
    html = html.replace(/<\/?(i|em)>/gi, '*');

    // Replace <u> tags with double underscores __
    html = html.replace(/<\/?u>/gi, '__');

    // Replace <s> or <del> tags with double tildes ~~
    html = html.replace(/<\/?(s|del)>/gi, '~~');

    // Replace <a> tags with markdown style links [text](url)
    html = html.replace(/<a\s+href=["'](.*?)["']>(.*?)<\/a>/gi, '[$2]($1)');

    // Replace <code> tags for inline code with backticks `
    html = html.replace(/<\/?code(?!block)>/gi, '`');

    // Replace <pre><code> tags for block code with triple backticks ```
    html = html.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/gi, (match, codeContent) => {
        return `\`\`\`\n${codeContent}\n\`\`\``; // Wrap with triple backticks
    });

    // Remove all remaining HTML tags
    html = html.replace(/<[^>]+>/g, '');

    return html;
}

function processText(text) {
    // Define a function to highlight code using highlight.js
    function highlightCode(code) {
        const hljs = window.hljs; // Ensure highlight.js is available in the window
        if (hljs) {
            return hljs.highlightAuto(code).value;
        }
        return code; // Fallback if highlight.js is not loaded
    }

    // Extract code blocks and store them in a map
    let codeBlocks = {};
    let codeIndex = 0;

    // Use a regex to capture code blocks
    text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (match, language, code) => {
        codeBlocks[codeIndex] = code; // Store code block
        return `{{codeBlock${codeIndex++}}}`; // Replace code block with placeholder
    });

    // Process text as before, but only replace non-code block parts
    text = escapeHTML(text)
    text = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    text = text.replace(/\*(.*?)\*/g, '<i>$1</i>');
    text = text.replace(/__(.*?)__/g, '<u>$1</u>');
    text = text.replace(/~~(.*?)~~/g, '<s>$1</s>');
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    text = text.replace(/`([^`\n]+?)`/g, '<code>$1</code>');
    text = text.replace(/@@(.*?)@@/g, '<special>$1</special>');
    text = text.replace(/\n/g, '<br>');
    text = text.replace(/ {2}/g, '&nbsp;&nbsp;');
    // Replace placeholders with highlighted code
    for (let index = 0; index < codeIndex; index++) {
        const code = codeBlocks[index];
        const highlightedCode = highlightCode(code);
        text = text.replace(`{{codeBlock${index}}}`, `<pre><code>${highlightedCode}</code></pre>`);
    }


    return text;
}

function escapeHTML(text) {
    const escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };

    return text.replace(/[&<>"']/g, (char) => escapeMap[char]);
}


// Function to handle the paste event
function handlePaste(event) {
    // Prevent the default paste behavior
    event.preventDefault();

    // Get the plain text from the clipboard
    const plainText = (event.clipboardData || window.clipboardData).getData('text');

    // Convert line breaks to <br> tags and spaces to &nbsp;
    const formattedText = plainText
        .replace(/\n/g, '<br>')
        .replace(/ {2}/g, '&nbsp;&nbsp;'); // Replace double spaces to preserve multiple spaces

    // Create a document fragment to insert the formatted content
    const range = window.getSelection().getRangeAt(0);
    const fragment = document.createDocumentFragment();
    const div = document.createElement('div');
    div.innerHTML = formattedText;

    // Append each child of the div to the fragment
    while (div.firstChild) {
        fragment.appendChild(div.firstChild);
    }

    // Insert the fragment at the cursor position
    range.deleteContents();
    range.insertNode(fragment);
}

// Add a paste event listener to the window
window.addEventListener('paste', function (event) {
    // Check if the target of the paste event is a content-editable element
    if (event.target && event.target.isContentEditable) {
        handlePaste(event);
    }
});


function insertSpecial(text, start, end) {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);

    // Create a new text node with "**" and insert it at the caret position
    const textNode = document.createTextNode(text);
    range.deleteContents(); // Optional: remove any selected text
    range.insertNode(textNode);

    // Move the caret between the two stars
    range.setStart(textNode, start); // Set the caret position between the stars
    range.setEnd(textNode, end);   // Keep the end position the same as the start

    selection.removeAllRanges(); // Clear existing selections
    selection.addRange(range);   // Add the new range
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