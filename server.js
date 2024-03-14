const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const serve = require('koa-static');
const path = require('path');
const fs = require('fs').promises;  // 异步文件操作
const agentManager = require(path.join(__dirname, 'agents'));

async function generateReply(userMessage, thread) {
    return await agentManager.executeAgent(userMessage, thread);
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

    if (!actionAttributes) {
        // 遍历线程中的所有消息，隐藏包含按钮的消息
        // 找到最近的一条包含该按钮的消息，并更新按钮状态
        let lastMessage = thread.messages[thread.messages.length - 1];
        // console.log(lastMessage);
        if(lastMessage.additionalData && lastMessage.additionalData.buttons){
            lastMessage.ignoreButtons = true;
        } 
    } else {
        const buttonName = actionAttributes.action; // 获取被点击的按钮名称
        // 找到最近的一条包含该按钮的消息，并更新按钮状态
        for (let i = thread.messages.length - 1; i >= 0; i--) {
            const msg = thread.messages[i];
            if (msg.additionalData && msg.additionalData.buttons && msg.additionalData.buttons.hasOwnProperty(buttonName)) {
                msg.additionalData.buttons[buttonName] = true; // 更新按钮为已点击状态
                break; // 找到并更新后退出循环
            }
        }
    }


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
