// replyGenerator.js

async function generateReply(userMessage, thread) {
    let replyText;
    let isHtml = false;

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

    return {
        id: 'msg_' + Math.random().toString(36).substr(2, 9),
        sender: 'bot',
        text: replyText,
        isHtml: isHtml,
        threadId: thread.id
    };
}

module.exports = generateReply;
