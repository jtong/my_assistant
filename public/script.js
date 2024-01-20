document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keydown', function(event) {
    // 当用户按下回车键且没有按住Shift键时发送消息
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault(); // 防止默认的换行行为
        sendMessage();
    }
});


window.onload = function() {
    loadThreads();
    // 其他已有的初始化代码
};


function loadThreads() {
    fetch('/threads')
        .then(response => response.json())
        .then(threads => {
            const threadList = document.getElementById('thread-list');
            threadList.innerHTML = '';
            threads.forEach(thread => {
                const li = document.createElement('li');
                li.textContent = `Thread ${thread.id} (${thread.messageCount} messages)`;
                li.onclick = function() { loadMessages(thread.id); };
                threadList.appendChild(li);
            });
        });
}

function loadMessages(threadId) {
    // 实现加载特定 thread 的消息
    // ...
}

function sendMessage() {
    var userInput = document.getElementById('user-input').value;
    var threadId = getThreadId(); // 获取或生成 thread ID

    if (userInput) {
        // 显示用户输入
        displayMessage(userInput, 'user');

        // 发送到后端并获取回复
        fetch('/reply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: userInput, threadId: threadId })
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

function getThreadId() {
    // 生成或返回现有的 thread ID
    // 这里只是一个示例，您可以使用更复杂的逻辑来生成和管理 thread ID
    if (!window.threadId) {
        window.threadId = 'thread_' + Math.random().toString(36).substr(2, 9);
    }
    return window.threadId;
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

    // 为每个新增的特殊表单添加事件监听器
    htmlContainer.querySelectorAll('form').forEach(form => {
        setupForm(form);
    });
}

function setupForm(form) {
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // 阻止表单默认提交
        var actionUrl = form.getAttribute('action'); // 获取表单的提交地址

        // 获取表单数据并发送
        var formData = new FormData(form);
        fetch(actionUrl, {  // 使用表单的 action URL
            method: 'POST',
            body: formData
        }).then(response => {
            // 处理响应
            // ...
            console.log(response);
        }).catch(error => {
            // 处理错误
            // ...
            console.log(error);

        });

        // 隐藏提交和取消按钮
        form.querySelector('input[type="submit"]').style.display = 'none';
        form.querySelector('.cancel-btn').style.display = 'none';
    });

    // 为取消按钮绑定事件
    form.querySelector('.cancel-btn').addEventListener('click', function() {
        form.querySelector('input[type="submit"]').style.display = 'none';
        this.style.display = 'none';
    });
}
