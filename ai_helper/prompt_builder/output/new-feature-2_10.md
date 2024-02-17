## 技术上下文

我们在开发一个 基于 nodejs 的 web 应用，其工程的文件夹树形结构如下：

```
.
├── AgentManager.js
├── agents.js
├── package.json
├── public
│   ├── index.html
│   ├── script.js
│   └── style.css
├── server.js
└── threads.json

```

## 前端相关文件

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
        <select id="agent-select">
            <!-- 在此处添加其他策略选项 -->
        </select>
        <ul id="thread-list"></ul>
    </div>
    <div id="chat-container">
        <div id="chat-box"></div>
        <button id="clear-thread-btn">清除对话</button>
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
                deleteBtn.onclick = function (event) {
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

function sendMessage(messageContent, actionAttributes = null) {
    const userInput = document.getElementById('user-input').value;
    const threadId = window.threadId || createThread(); // 确保有一个有效的线程 ID
    const messageId = 'msg_' + Math.random().toString(36).substr(2, 9);

    let messageData = {
        message: actionAttributes ? messageContent : userInput,
        threadId,
        messageId,
        // 如果存在动作属性，将其包含在发送的数据中
        actionAttributes: actionAttributes
    };

    // 显示用户输入
    displayUserMessage(messageData.message, 'user', messageId);

    fetch('/reply', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
    })
        .then(response => response.json())
        .then(data => {
            // 显示消息等
            if (actionAttributes) {
                console.log('处理动作执行事件的响应');
            } else {
                // 处理普通消息的逻辑
            }
        })
        .catch(error => console.error('发送消息时出错:', error));
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
    if (additionalData && additionalData.buttons) {
        Object.keys(additionalData.buttons).forEach(buttonName => {
            const buttonElement = document.createElement('button');
            buttonElement.textContent = buttonName;
            buttonElement.addEventListener('click', function () {
                // 构建动作属性对象
                const actionAttributes = { [buttonName]: true };
                // 调用 sendMessage 函数并传递动作属性
                sendMessage(`动作执行: ${buttonName}`, actionAttributes);
            });
            messageElement.appendChild(buttonElement);
        });
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

```            

## 后端相关文件

### server.js

```
const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const serve = require('koa-static');
const path = require('path');
const fs = require('fs').promises;  // 异步文件操作
const agentManager = require('./agents');

async function generateReply(userMessage, thread) {
    return agentManager.executeAgent(userMessage, thread);
}

const app = new Koa();
const router = new Router();

const THREADS_FILE = path.join(__dirname, 'threads.json');

// 服务器启动时加载线程数据
async function loadThreads() {
    try {
        const data = await fs.readFile(THREADS_FILE, 'utf8');
        threads = JSON.parse(data);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error('Error reading threads file:', error);
        }
        // 如果文件不存在，就初始化为空数组
        threads = [];
    }
}

// 在创建新线程或回复消息时保存线程数据
async function saveThreads() {
    try {
        await fs.writeFile(THREADS_FILE, JSON.stringify(threads, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing threads file:', error);
    }
}

// 提供静态文件的中间件
app.use(serve(path.join(__dirname, 'public')));

app.use(bodyParser());


router.get('/threads', async ctx => {
    ctx.set('Cache-Control', 'no-cache, no-store, must-revalidate');  // 禁止缓存
    ctx.set('Pragma', 'no-cache');
    ctx.set('Expires', '0');
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
    const agent = ctx.request.body.agent || 'default'; // 默认为 'default'
    const newThread = { id: newThreadId, agent: agent, messages: [] }; // 现在线程对象包括策略
    threads.push(newThread);
    ctx.body = { threadId: newThreadId };
    await saveThreads();  // 保存更新后的线程数据
});

router.post('/reply', async ctx => {

    const messageId = ctx.request.body.messageId;
    const userMessage = ctx.request.body.message;
    const threadId = ctx.request.body.threadId || 'default';
    const actionAttributes = ctx.request.body.actionAttributes;

    // 查找或创建新的 thread
    let thread = threads.find(t => t.id === threadId);
    if (!thread) {
        thread = { id: threadId, messages: [] };
        threads.push(thread);
    }

    const timestamp = Date.now(); // 添加时间戳

    thread.messages.push({ sender: 'user', text: userMessage, id: messageId, timestamp, actionAttributes });
    
    // 使用 generateReply 函数生成回复
    const replyMessage = await generateReply(userMessage, thread);

    // 添加时间戳
    replyMessage.timestamp = timestamp;
    
    // 将生成的回复添加到 thread
    thread.messages.push(replyMessage);

    // 返回回复给客户端
    ctx.body = { message: replyMessage, threadId };

    await saveThreads();  // 保存更新后的线程数据

});

router.post('/form-submitted', async ctx => {
    const { threadId, messageId, submitted } = ctx.request.body;
    const thread = threads.find(t => t.id === threadId);
    // console.log(thread);
    if (thread) {
        const message = thread.messages.find(m => m.id === messageId);
        // console.log(message);
        if (message) {
            message.formSubmitted = submitted;
            await saveThreads();
            ctx.body = { status: 'success' };
            return;
        }
    }
    ctx.status = 404;
    ctx.body = { status: 'error', message: 'Thread or message not found' };
});

router.delete('/clear-thread/:threadId', async ctx => {
    const threadId = ctx.params.threadId;
    const threadIndex = threads.findIndex(t => t.id === threadId);
    if (threadIndex > -1) {
        threads[threadIndex].messages = []; // 清空消息
        await saveThreads(); // 保存更改
        ctx.body = { status: 'success' };
    } else {
        ctx.status = 404;
        ctx.body = { error: "Thread not found" };
    }
});

router.get('/agents', async ctx => {
    const agents = Object.keys(agentManager.agents); // 假设这会返回所有代理的键数组
    ctx.body = agents;
});

router.delete('/delete-thread/:threadId', async ctx => {
    const threadId = ctx.params.threadId;
    const threadIndex = threads.findIndex(t => t.id === threadId);
    if (threadIndex > -1) {
        threads.splice(threadIndex, 1); // 从数组中移除线程
        await saveThreads(); // 保存更改
        ctx.body = { status: 'success' };
    } else {
        ctx.status = 404;
        ctx.body = { error: "Thread not found" };
    }
});


loadThreads();


app.use(router.routes()).use(router.allowedMethods());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT} `);
});

```            
### agents.js

```
// agents.js

const { AgentManager, ReplyAgent } = require('./AgentManager');


// 实例化策略管理器
const agentManager = new AgentManager();

// 注册默认策略
class DefaultReplyAgent extends ReplyAgent {
    async execute(userMessage, thread) {
        // 默认策略的实现
        let replyText;
        let isHtml = false;
        let additionalData = {}; // 用于存储额外的JSON数据

        if (userMessage.includes("form")) {
            replyText = `<form id="special-form" action="/submit-form">
                             <label for="name">姓名:</label>
                             <input type="text" id="name" name="name"><br><br>
                             <label for="email">邮箱:</label>
                             <input type="text" id="email" name="email"><br><br>
                             <input type="submit" value="提交">
                             <button type="button" class="cancel-btn">取消</button>
                         </form>`;
            isHtml = true;
        } else {
            replyText = `回复: ${userMessage}`;
        }

        if (userMessage === "需要按钮") {
            additionalData = {
                buttons: {
                    '属性1': false,
                    '属性2': false,
                    // 添加更多属性和初始值（false 表示未激活/未选择）
                }
            };
        }
        return {
            id: 'msg_' + Math.random().toString(36).substr(2, 9),
            sender: 'bot',
            text: replyText,
            isHtml: isHtml,
            threadId: thread.id,
            additionalData: additionalData // 将additionalData包含在返回的消息中
        };
    }
}

agentManager.registerAgent('default', new DefaultReplyAgent());

const {GreenTeaReplyAgent} = require("green-tea");
agentManager.registerAgent('green_tea', new GreenTeaReplyAgent());

module.exports = agentManager;

```            
### AgentManager.js

```
const { ReplyAgent } = require("agent-base");

class AgentManager {
    constructor() {
        this.agents = {
            default: new ReplyAgent(), // 默认策略
        };
    }

    registerAgent(key, agentInstance) {
        this.agents[key] = agentInstance;
    }

    async executeAgent(userMessage, thread) {
        let agentKey = thread.agent;

        if (this.agents[agentKey]) {
            return this.agents[agentKey].execute(userMessage, thread);
        } else {
            console.log(`No agent found for key: ${agentKey}, falling back to default.`);
            return this.agents['default'].execute(userMessage, thread);
        }
    }
}

module.exports = { AgentManager, ReplyAgent };
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
    "koa-static": "^5.0.0",
    "agent-base": "git+https://github.com/jtong/agent-base.git",
    "green-tea": "file:../green_tea"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}

```            

## 任务

我希望 点击过的button通过某种方式记录状态，这样显示消息的时候就不再能点击他，而且不仅它不能点击，整个buttons都不能点击，还会标记点击了哪个