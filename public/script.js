document.getElementById('send-btn').addEventListener('click', function() {
    var userInput = document.getElementById('user-input').value;
    if (userInput) {
        // 显示用户输入
        displayMessage(userInput, 'user');

        // 发送到后端并获取回复
        fetch('/reply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: userInput })
        })
        .then(response => response.json())
        .then(data => {
            if (data.html) {
                // 如果响应包含HTML，直接将其显示在聊天框中
                displayHtml(data.html);
            } else {
                // 否则，显示文本消息
                displayMessage(data.reply, 'bot');
            }
        });

        // 清空输入框
        document.getElementById('user-input').value = '';
    }
});

function displayMessage(message, sender) {
    var chatBox = document.getElementById('chat-box');
    var messageElement = document.createElement('div');
    messageElement.classList.add(sender);
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
}

function displayHtml(htmlContent) {
    var chatBox = document.getElementById('chat-box');
    var htmlContainer = document.createElement('div');
    htmlContainer.innerHTML = htmlContent;
    chatBox.appendChild(htmlContainer);
}
