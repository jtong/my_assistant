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
    const selectedAgent = document.getElementById('agent-select').value; // 获取选定的策略
    fetch('/create-thread', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ agent: selectedAgent }) // 包含策略在请求体中
    })
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


document.getElementById('clear-thread-btn').addEventListener('click', clearThreadMessages);
function clearThreadMessages() {
    if (!window.threadId) {
        alert('没有选定的对话线程！');
        return;
    }

    if (confirm('确定要清除当前对话的所有消息吗？')) {
        fetch(`/clear-thread/${window.threadId}`, { method: 'DELETE' })
            .then(response => {
                if (response.ok) {
                    loadMessages(window.threadId); // 重新加载消息，此时应为空
                }
            })
            .catch(error => console.error('清除对话时出错:', error));
    }
}

window.onload = function () {
    loadThreads();
    loadAgents(); // 调用加载策略的函数

    // 其他已有的初始化代码
    const urlParams = new URLSearchParams(window.location.search);
    const threadIdFromUrl = urlParams.get('threadId');
    loadThreads();

    if (threadIdFromUrl) {
        window.threadId = threadIdFromUrl;
        loadMessages(threadIdFromUrl);
    }
};

function loadAgents() {
    fetch('/agents')
        .then(response => response.json())
        .then(agents => {
            const agentSelect = document.getElementById('agent-select');
            agents.forEach(agent => {
                const option = document.createElement('option');
                option.value = agent;
                option.textContent = agent; // 假设策略的键可以直接作为选项的显示文本
                agentSelect.appendChild(option);
            });
        });
}


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

            // 创建删除按钮
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '删除';
            deleteBtn.onclick = function(event) {
                event.stopPropagation(); // 阻止事件冒泡
                deleteThread(thread.id);
            };
            li.appendChild(deleteBtn);

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

function deleteThread(threadId) {
    if (confirm('确定要删除这个线程吗？')) {
        fetch(`/delete-thread/${threadId}`, { method: 'DELETE' })
            .then(response => {
                if (response.ok) {
                    loadThreads(); // 重新加载线程列表
                } else {
                    alert('删除线程失败');
                }
            })
            .catch(error => console.error('删除线程时出错:', error));
    }
}


function loadMessages(threadId) {
    fetch('/thread/' + threadId)
        .then(response => response.json())
        .then(messages => {
            const chatBox = document.getElementById('chat-box');
            chatBox.innerHTML = ''; // 清空当前聊天框中的内容
            messages.forEach(message => {
                // 根据sender类型添加不同的处理
                if (message.sender === 'user') {
                    // 如果消息是用户发送的
                    displayUserMessage(message.text, message.sender, message.id);
                } else if (message.sender === 'bot') {
                    // 如果消息是机器人发送的
                    displayBotMessage(message, message.sender, message.id, message.additionalData);
                }
            });
        });
}

function sendMessage() {
    var userInput = document.getElementById('user-input').value;
    var threadId = window.threadId || createThread(); // 确保有一个有效的线程 ID

    if (userInput) {
        // 创建一个简单的随机消息ID
        let messageId = 'msg_' + Math.random().toString(36).substr(2, 9);

        // 显示用户输入
        displayUserMessage(userInput, 'user', messageId);

        // 发送到后端并获取回复
        fetch('/reply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: userInput, threadId: threadId, messageId: messageId })
        })
            .then(response => response.json())
            .then(data => {
                displayBotMessage(data.message, data.message.sender, data.message.id);

                // 更新表单提交状态
                updateFormStatus(threadId, messageId, false);
            });

        // 清空输入框
        document.getElementById('user-input').value = '';
    }
}

function updateFormStatus(threadId, messageId, submitted) {
    fetch('/form-submitted', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ threadId: threadId, messageId: messageId, submitted: submitted })
    })
    .then(response => response.json())
    .then(data => {
        // 处理响应
        console.log('Form status updated:', data);
    })
    .catch(error => {
        // 处理错误
        console.error('Error updating form status:', error);
    });
}

function displayUserMessage(message, sender, messageId) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.classList.add(sender);
    messageElement.textContent = message;
    if (messageId) {
        messageElement.setAttribute('data-message-id', messageId);
    }
    chatBox.appendChild(messageElement);
}

function displayBotMessage(message, sender, messageId, additionalData) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.classList.add(sender);

    // 检查消息是否包含HTML内容
    if (message.isHtml) {
        displayHtml(message.text, message);
    } else {
        // 如果不是HTML，设置textContent以避免HTML注入
        messageElement.textContent = message.text;
    }

    // 根据additionalData渲染额外的元素
    if (message.additionalData) {
        if (additionalData.button) {
            const button = document.createElement('button');
            button.textContent = "操作";
            button.addEventListener('click', function() {
                // 处理按钮点击事件
                displayJson(additionalData); // 示范函数，用于显示或处理JSON数据
            });
            messageElement.appendChild(button);
        }
        if (additionalData.options) {
            const select = document.createElement('select');
            additionalData.options.forEach(function(option) {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option;
                select.appendChild(optionElement);
            });
            messageElement.appendChild(select);
        }
    }

    if (messageId) {
        messageElement.setAttribute('data-message-id', messageId);
    }

    chatBox.appendChild(messageElement);
}

function displayHtml(htmlContent, message) {
    var chatBox = document.getElementById('chat-box');
    var htmlContainer = document.createElement('div');
    htmlContainer.innerHTML = htmlContent;
    chatBox.appendChild(htmlContainer);

    // 使用传入的 message 对象来判断表单是否已提交
    if (message && message.formSubmitted) {
        // 如果表单已提交，隐藏提交和取消按钮
        htmlContainer.querySelector('input[type="submit"]').style.display = 'none';
        htmlContainer.querySelector('.cancel-btn').style.display = 'none';
    }

    // 为每个新增的特殊表单添加事件监听器
    htmlContainer.querySelectorAll('form').forEach(form => {
        setupForm(form, message.id);
    });
}

function setupForm(form, messageId) {
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

        // 更新表单提交状态
        updateFormStatus(window.threadId, messageId, true);
    });

    // 为取消按钮绑定事件
    form.querySelector('.cancel-btn').addEventListener('click', function () {
        form.querySelector('input[type="submit"]').style.display = 'none';
        this.style.display = 'none';
        updateFormStatus(window.threadId, messageId, true);

    });
}
