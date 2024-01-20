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
