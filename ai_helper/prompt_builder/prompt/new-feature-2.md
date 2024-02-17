## 技术上下文

我们在开发一个 基于 nodejs 的 web 应用，其工程的文件夹树形结构如下：

```
{{ folder_tree }}
```

## 前端相关文件

{{#related_files_from }}
```yaml
- path: public/index.html
  reader: all
- path: public/style.css
  reader: all
- path: public/script.js
  reader: all  
```
{{/related_files_from }}

## 后端相关文件

{{#related_files_from }}
```yaml
- path: server.js
  reader: all    
- path: agents.js
  reader: all
- path: AgentManager.js
  reader: all
- path: package.json
  reader: all    
```
{{/related_files_from }}

## 任务

我希望 输入了“需要按钮”，bot回复的message有了buttons的时候，具备下面的功能：

- 如果没有点击按钮，直接回复了user message，就不再显示所有的button。
- 如果点击了按钮，则标记点击了哪个button，所有的button都不能再点击。

点击时发送的消息还是走/reply。基于现有实现，给我一些设计思路。