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
