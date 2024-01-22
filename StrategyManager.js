class ReplyStrategy {
    async execute(userMessage, thread) {
        throw new Error("Method 'execute()' must be implemented.");
    }
}

class StrategyManager {
    constructor() {
        this.strategies = {
            default: new ReplyStrategy(), // 默认策略
        };
    }

    registerStrategy(key, strategyInstance) {
        this.strategies[key] = strategyInstance;
    }

    async executeStrategy(userMessage, thread) {
        // 示例条件选择逻辑，可以根据实际需要修改
        let strategyKey = Object.keys(this.strategies).find(key => userMessage.includes(key)) || 'default';

        if (this.strategies[strategyKey]) {
            return this.strategies[strategyKey].execute(userMessage, thread);
        } else {
            console.log(`No strategy found for key: ${strategyKey}, falling back to default.`);
            return this.strategies['default'].execute(userMessage, thread);
        }
    }
}

module.exports = { StrategyManager, ReplyStrategy };