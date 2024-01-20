document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keydown', function (event) {
    // 当用户按下回车键且没有按住Shift键时发送消息
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault(); // 防止默认的换行行为
        sendMessage();
    }
});

document.getElementById('create-thread-btn').addEventListener('click', createThread);

function createThread() {
    fetch('/create-thread', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.threadId) {
                window.threadId = data.threadId;
                loadThreads();  // 加载新的线程列表
                // 更新 URL
                window.history.pushState({ threadId: data.threadId }, '', `?threadId=${data.threadId}`);
            }
        });
}


window.onload = function () {
    loadThreads();

    // 其他已有的初始化代码
    const urlParams = new URLSearchParams(window.location.search);
    const threadIdFromUrl = urlParams.get('threadId');
    loadThreads();

    if (threadIdFromUrl) {
        window.threadId = threadIdFromUrl;
        loadMessages(threadIdFromUrl);
    }
};


function loadThreads() {
    fetch('/threads', {
        headers: {
            'Cache-Control': 'no-cache',  // 禁止缓存
            'Pragma': 'no-cache'
        }
    })
        .then(response => response.json())
        .then(threads => {
            const threadList = document.getElementById('thread-list');
            threadList.innerHTML = ''; // 清空现有的线程列表
            threads.forEach(thread => {
                const li = document.createElement('li');
                li.textContent = `${thread.id} ： (${thread.messageCount} messages)`;
                li.onclick = function () {
                    window.threadId = thread.id;
                    loadMessages(thread.id);
                    // 更新 URL
                    window.history.pushState({ threadId: thread.id }, '', `?threadId=${thread.id}`);
                };
                threadList.appendChild(li);
            });
        });
}


function loadMessages(threadId) {
    fetch('/thread/' + threadId)
        .then(response => response.json())
        .then(messages => {
            const chatBox = document.getElementById('chat-box');
            chatBox.innerHTML = ''; // 清空当前聊天框中的内容
            messages.forEach(message => {
                // 根据消息类型添加不同的处理
                if (message.isHtml) {
                    displayHtml(message.text);
                } else {
                    displayMessage(message.text, message.sender);
                }
            });
        });
}

function sendMessage() {
    var userInput = document.getElementById('user-input').value;
    var threadId = window.threadId || createThread(); // 确保有一个有效的线程 ID

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
    form.addEventListener('submit', function (event) {
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
    form.querySelector('.cancel-btn').addEventListener('click', function () {
        form.querySelector('input[type="submit"]').style.display = 'none';
        this.style.display = 'none';
    });
}
