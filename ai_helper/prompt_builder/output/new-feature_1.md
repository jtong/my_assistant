## 技术上下文

我们在开发一个 vscode 插件，其工程的文件夹树形结构如下：

```
.
├── index.html
├── script.js
└── style.css

```

## 相关文件

### index.html

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>对话UI</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="chat-container">
        <div id="chat-box"></div>
        <input type="text" id="user-input" placeholder="输入信息...">
        <button id="send-btn">发送</button>
    </div>
    <script src="script.js"></script>
</body>
</html>

```            
### style.css

```
#chat-container {
    width: 80%;
    margin: auto;
    height: 500px;
    border: 1px solid #ddd;
    padding: 20px;
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
### script.js

```
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
            displayMessage(data.reply, 'bot');
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

```            

## 任务

我希望 建一个nodejs项目，可以启动服务，可以接受请求，后端使用koa.js