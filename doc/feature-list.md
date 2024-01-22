## 特性列表

### message
- [x]支持显示form
- [x]form可以提交，提交后不能再次提交
- [x]处理消息会有一个单独的函数，可以扩展

### thread
- [x]支持Thread，消息只回复并保存在Thread中
- [ ]Thread要支持改名
- [ ]Thread要支持定义了某个Agent，方面扩展agent
- [ ]一个thread可以支持多个agent，可以通过@或选择来决定使用哪个agent

### agent
- [ ] agent 要支持注入不同的agent
- [ ] 要支持根据thread上设置的不同的agent，转发给对应的agent
- [ ] 要支持agent可以读取所有的历史记录
