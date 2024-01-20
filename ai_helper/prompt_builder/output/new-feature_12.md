## 技术上下文

我们在开发一个 基于 nodejs 的 web 应用，其工程的文件夹树形结构如下：

```
.
├── package.json
├── public
│   ├── index.html
│   ├── script.js
│   └── style.css
└── server.js

```

## 相关文件

### public/index.html

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>对话UI</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="thread-list-container">
        <button id="create-thread-btn">新建线程</button>
        <ul id="thread-list"></ul>
    </div>
    <div id="chat-container">
        <div id="chat-box"></div>
        <input type="text" id="user-input" placeholder="输入信息...">
        <button id="send-btn">发送</button>
    </div>
    <script src="script.js"></script>
</body>
</html>

```            
### public/style.css

```
#thread-list-container {
    width: 19%;
    float: left;
    height: 500px;
    overflow-y: auto;
}

#thread-list {
    list-style-type: none;
    padding: 0;
}

#thread-list li {
    cursor: pointer;
    padding: 10px;
    border-bottom: 1px solid #ddd;
}

#chat-container {
    width: 78%;  /* 更新宽度 */
    float: right;
    margin: auto;
    height: 500px;
    border: 1px solid #ddd;
    padding: 10px;
}

#chat-box {
    height: 80%;
    overflow-y: auto;
    margin-bottom: 20px;
    border: 1px solid #ccc;
    padding: 10px;
}

#user-input {
    width: 70%;
    padding: 10px;
}

#send-btn {
    width: 20%;
    padding: 10px;
    background-color: blue;
    color: white;
    border: none;
    cursor: pointer;
}

```            
### public/script.js

```
document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keydown', function(event) {
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


window.onload = function() {
    // 其他已有的初始化代码
    const urlParams = new URLSearchParams(window.location.search);
    const threadIdFromUrl = urlParams.get('threadId');
    
    if (threadIdFromUrl) {
        window.threadId = threadIdFromUrl;
        loadMessages(threadIdFromUrl);
    } else {
        loadThreads();
    }
};


function loadThreads() {
    fetch('/threads')
        .then(response => response.json())
        .then(threads => {
            const threadList = document.getElementById('thread-list');
            threadList.innerHTML = ''; // 清空现有的线程列表
            threads.forEach(thread => {
                const li = document.createElement('li');
                li.textContent = `${thread.id} ： (${thread.messageCount} messages)`;
                li.onclick = function() { 
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

```            
### server.js

```
const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const serve = require('koa-static');
const path = require('path');

const app = new Koa();
const router = new Router();

// 提供静态文件的中间件
app.use(serve(path.join(__dirname, 'public')));

app.use(bodyParser());

const threads = []; // 存储 threads 的数组

router.get('/threads', async ctx => {
    ctx.body = threads.map(t => ({ id: t.id, messageCount: t.messages.length }));
});

router.get('/thread/:threadId', async ctx => {
    const threadId = ctx.params.threadId;
    const thread = threads.find(t => t.id === threadId);
    if (thread) {
        ctx.body = thread.messages;
    } else {
        ctx.status = 404;
        ctx.body = { error: "Thread not found" };
    }
});

router.post('/create-thread', async ctx => {
    const newThreadId = 'thread_' + Math.random().toString(36).substr(2, 9);
    const newThread = { id: newThreadId, messages: [] };
    threads.push(newThread);
    ctx.body = { threadId: newThreadId };
});

router.post('/reply', async ctx => {
    const userMessage = ctx.request.body.message;
    const threadId = ctx.request.body.threadId || 'default';

    // 查找或创建新的 thread
    let thread = threads.find(t => t.id === threadId);
    if (!thread) {
        thread = { id: threadId, messages: [] };
        threads.push(thread);
    }

    // 添加用户消息到 thread
    thread.messages.push({ sender: 'user', text: userMessage });

    let reply;
    if (userMessage.includes("form")) {
        const formHtml = `
            <form id="special-form" action="/submit-form">
                <label for="name">姓名:</label>
                <input type="text" id="name" name="name"><br><br>
                <label for="email">邮箱:</label>
                <input type="text" id="email" name="email"><br><br>
                <input type="submit" value="提交">
                <button type="button" class="cancel-btn">取消</button>
            </form>
        `;
        thread.messages.push({ sender: 'bot', text: formHtml, isHtml: true });
        ctx.body = { html: formHtml, threadId };
    } else {
        reply = `回复: ${userMessage}`;
        thread.messages.push({ sender: 'bot', text: reply });
        ctx.body = { reply, threadId };
    }
});



app.use(router.routes()).use(router.allowedMethods());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT} `);
});

```            
### package.json

```
{
  "name": "my_assistant",
  "version": "1.0.0",
  "description": "",
  "main": "script.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "koa": "^2.15.0",
    "koa-bodyparser": "^4.4.1",
    "koa-router": "^12.0.1",
    "koa-static": "^5.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}

```            

## 任务

我希望 目前添加thread后刷新，列表为空，请修复这个bug。