const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const serve = require('koa-static');
const path = require('path');
const fs = require('fs').promises;  // 异步文件操作

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
    const newThread = { id: newThreadId, messages: [] };
    threads.push(newThread);
    ctx.body = { threadId: newThreadId };
    await saveThreads();  // 保存更新后的线程数据
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
    await saveThreads();  // 保存更新后的线程数据

});

loadThreads();


app.use(router.routes()).use(router.allowedMethods());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT} `);
});
