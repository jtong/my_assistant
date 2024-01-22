// strategies.js

const { StrategyManager, ReplyStrategy } = require('./StrategyManager');


// 实例化策略管理器
const strategyManager = new StrategyManager();

// 注册默认策略
class DefaultReplyStrategy extends ReplyStrategy {
    async execute(userMessage, thread) {
        // 默认策略的实现
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
}

strategyManager.registerStrategy('default', new DefaultReplyStrategy());

// 示例：注册自定义策略
// class CustomReplyStrategy extends ReplyStrategy {
//     async execute(userMessage, thread) {
//         // 自定义策略的实现...
//     }
// }
// strategyManager.registerStrategy('customKey', new CustomReplyStrategy());

module.exports = strategyManager;
