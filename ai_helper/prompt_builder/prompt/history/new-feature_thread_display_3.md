## 技术上下文

我们在开发一个 基于 nodejs 的 web 应用，其工程的文件夹树形结构如下：

```
{{ folder_tree }}
```

## 相关文件

{{#related_files_from }}
```yaml
- path: public/index.html
  reader: all
- path: public/style.css
  reader: all
- path: public/script.js
  reader: all  
- path: server.js
  reader: all    
- path: package.json
  reader: all    
```
{{/related_files_from }}

## 任务

我希望 存在一个新建按钮，可以新建thread，后面发的消息都是在这个thread里，而且thread列表会自动更新。当我点击了某个thread，那么后面发的消息也都在点击了的那个thread里。