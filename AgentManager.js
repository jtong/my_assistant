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
            return await this.agents[agentKey].execute(userMessage, thread);
        } else {
            console.log(`No agent found for key: ${agentKey}, falling back to default.`);
            return await this.agents['default'].execute(userMessage, thread);
        }
    }
}

module.exports = { AgentManager, ReplyAgent };