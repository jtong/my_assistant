document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keydown', function(event) {
    // 当用户按下回车键且没有按住Shift键时发送消息
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault(); // 防止默认的换行行为
        sendMessage();
    }
});


function sendMessage() {
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
}


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

    // 检查是否存在特殊表单
    var form = document.getElementById('special-form');
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // 阻止表单默认提交

            // 获取表单数据并发送
            var formData = new FormData(form);
            fetch('/submit-form', {
                method: 'POST',
                body: formData
            }).then(response => {
                // 处理响应

                // 隐藏提交和取消按钮
                form.querySelector('input[type="submit"]').style.display = 'none';
                document.getElementById('cancel-btn').style.display = 'none';

                // 可以在这里添加其他成功提交后的操作
            }).catch(error => {
                // 处理错误
            });
        });

        // 取消按钮的事件监听器
        document.getElementById('cancel-btn').addEventListener('click', function() {
            form.querySelector('input[type="submit"]').style.display = 'none';
            this.style.display = 'none';
        });
    }
}
