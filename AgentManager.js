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
        // 示例条件选择逻辑，可以根据实际需要修改
        let agentKey = Object.keys(this.agents).find(key => userMessage.includes(key)) || 'default';

        if (this.agents[agentKey]) {
            return this.agents[agentKey].execute(userMessage, thread);
        } else {
            console.log(`No agent found for key: ${agentKey}, falling back to default.`);
            return this.agents['default'].execute(userMessage, thread);
        }
    }
}

module.exports = { AgentManager, ReplyAgent };