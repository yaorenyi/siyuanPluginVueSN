# 思源笔记 API 参考文档

思源笔记提供了丰富的 HTTP API 接口，用于操作笔记本、文档、块等核心功能。

## 基本信息

- **基础URL**: http://127.0.0.1:6806
- **认证方式**: Token
- **版本**: v2.x
- **官方文档**: https://github.com/siyuan-note/siyuan/blob/master/API_zh_CN.md

## 认证

### 获取 Token

在思源笔记设置 -> 关于 -> API token 中获取访问令牌。

### 请求头设置

```http
Authorization: Token YOUR_API_TOKEN
Content-Type: application/json
```

### 基本请求示例

```bash
curl -X POST http://127.0.0.1:6806/api/query/sql \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"stmt": "SELECT * FROM blocks LIMIT 10"}'
```

## 笔记本管理

### 获取笔记本列表

```http
POST /api/notebook/lsNotebooks
```

#### 示例请求

```json
{}
```

#### 示例响应

```json
{
  "code": 0,
  "msg": "",
  "data": {
    "notebooks": [
      {
        "id": "20210808180117-czj9bvb",
        "name": "思源笔记用户指南",
        "icon": "1f4d4",
        "sort": 0,
        "closed": false
      }
    ]
  }
}
```

### 打开笔记本

```http
POST /api/notebook/openNotebook
```

#### 请求参数

| 参数名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| notebook | string | 是 | 笔记本 ID |

#### 示例请求

```json
{
  "notebook": "20210808180117-czj9bvb"
}
```

### 关闭笔记本

```http
POST /api/notebook/closeNotebook
```

#### 示例请求

```json
{
  "notebook": "20210808180117-czj9bvb"
}
```

## 文档管理

### 创建文档

```http
POST /api/filetree/createDoc
```

#### 请求参数

| 参数名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| notebook | string | 是 | 笔记本 ID |
| path | string | 是 | 文档路径 |
| title | string | 否 | 文档标题 |
| md | string | 否 | Markdown 内容 |

#### 示例请求

```json
{
  "notebook": "20210808180117-czj9bvb",
  "path": "/新建文档",
  "title": "我的新文档",
  "md": "# 标题\n\n这是内容"
}
```

#### 示例响应

```json
{
  "code": 0,
  "msg": "",
  "data": {
    "id": "20230101120000-abcdefg"
  }
}
```

### 删除文档

```http
POST /api/filetree/removeDoc
```

#### 示例请求

```json
{
  "notebook": "20210808180117-czj9bvb",
  "path": "/要删除的文档"
}
```

### 重命名文档

```http
POST /api/filetree/renameDoc
```

#### 示例请求

```json
{
  "notebook": "20210808180117-czj9bvb",
  "path": "/原文档名",
  "title": "新文档名"
}
```

## 块操作

### 插入块

```http
POST /api/block/insertBlock
```

#### 请求参数

| 参数名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| dataType | string | 是 | 块类型：markdown, dom |
| data | string | 是 | 块内容 |
| nextID | string | 否 | 插入位置的下一个块 ID |
| previousID | string | 否 | 插入位置的上一个块 ID |
| parentID | string | 否 | 父块 ID |

#### 示例请求

```json
{
  "dataType": "markdown",
  "data": "这是一个新的段落",
  "parentID": "20230101120000-abcdefg"
}
```

### 更新块

```http
POST /api/block/updateBlock
```

#### 示例请求

```json
{
  "dataType": "markdown",
  "data": "更新后的内容",
  "id": "20230101120001-hijklmn"
}
```

### 删除块

```http
POST /api/block/deleteBlock
```

#### 示例请求

```json
{
  "id": "20230101120001-hijklmn"
}
```

### 获取块信息

```http
POST /api/block/getBlockInfo
```

#### 示例请求

```json
{
  "id": "20230101120001-hijklmn"
}
```

#### 示例响应

```json
{
  "code": 0,
  "msg": "",
  "data": {
    "id": "20230101120001-hijklmn",
    "rootID": "20230101120000-abcdefg",
    "parentID": "20230101120000-abcdefg",
    "type": "p",
    "content": "这是段落内容"
  }
}
```

## SQL 查询

### 执行 SQL 查询

```http
POST /api/query/sql
```

#### 请求参数

| 参数名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| stmt | string | 是 | SQL 语句 |

#### 示例请求

```json
{
  "stmt": "SELECT * FROM blocks WHERE content LIKE '%思源%' LIMIT 10"
}
```

#### 示例响应

```json
{
  "code": 0,
  "msg": "",
  "data": [
    {
      "id": "20230101120001-hijklmn",
      "parent_id": "20230101120000-abcdefg",
      "root_id": "20230101120000-abcdefg",
      "type": "p",
      "content": "包含思源的内容"
    }
  ]
}
```

### 常用 SQL 查询示例

#### 查询所有文档

```sql
SELECT * FROM blocks WHERE type = 'd' ORDER BY created DESC
```

#### 查询包含特定内容的块

```sql
SELECT * FROM blocks WHERE content LIKE '%关键词%' AND type = 'p'
```

#### 查询特定笔记本的文档

```sql
SELECT * FROM blocks WHERE box = '笔记本ID' AND type = 'd'
```

## 搜索功能

### 全文搜索

```http
POST /api/search/searchBlock
```

#### 请求参数

| 参数名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| query | string | 是 | 搜索关键词 |
| types | object | 否 | 搜索类型配置 |

#### 示例请求

```json
{
  "query": "思源笔记",
  "types": {
    "document": true,
    "heading": true,
    "paragraph": true
  }
}
```

#### 示例响应

```json
{
  "code": 0,
  "msg": "",
  "data": {
    "blocks": [
      {
        "id": "20230101120001-hijklmn",
        "rootID": "20230101120000-abcdefg",
        "content": "包含思源笔记的内容",
        "type": "p"
      }
    ]
  }
}
```

## 模板功能

### 渲染模板

```http
POST /api/template/render
```

#### 示例请求

```json
{
  "id": "20230101120001-hijklmn",
  "path": "/templates/daily-note.md"
}
```

## 导出功能

### 导出文档

```http
POST /api/export/exportMd
```

#### 示例请求

```json
{
  "id": "20230101120000-abcdefg"
}
```

### 导出为 PDF

```http
POST /api/export/exportPDF
```

#### 示例请求

```json
{
  "id": "20230101120000-abcdefg",
  "savePath": "/path/to/save.pdf"
}
```

## 资源文件

### 上传资源

```http
POST /api/asset/upload
```

#### 请求参数

使用 multipart/form-data 格式上传文件。

#### 示例响应

```json
{
  "code": 0,
  "msg": "",
  "data": {
    "succMap": {
      "image.png": "assets/image-20230101120000-abcdefg.png"
    }
  }
}
```

## 系统信息

### 获取系统信息

```http
POST /api/system/getConf
```

#### 示例响应

```json
{
  "code": 0,
  "msg": "",
  "data": {
    "conf": {
      "appearance": {
        "mode": 0,
        "themeDark": "midnight",
        "themeLight": "daylight"
      },
      "editor": {
        "fontSize": 16,
        "lineHeight": 22
      }
    }
  }
}
```

## 插件开发

### 插件 API

思源笔记为插件开发提供了专门的 API：

#### 加载数据

```javascript
const data = await plugin.loadData('key')
```

#### 保存数据

```javascript
await plugin.saveData('key', data)
```

#### 添加菜单项

```javascript
plugin.addTopBar({
  icon: 'iconName',
  title: '插件名称',
  callback: () => {
    // 点击回调
  }
})
```

#### 监听事件

```javascript
plugin.eventBus.on('ws-main', (event) => {
  // 处理 WebSocket 事件
})
```

## 错误处理

### 错误码说明

- **0**: 成功
- **-1**: 参数错误
- **-2**: 权限不足
- **-3**: 资源不存在
- **-4**: 操作失败

### 错误响应格式

```json
{
  "code": -1,
  "msg": "参数错误：缺少必需参数 'id'",
  "data": null
}
```

## 最佳实践

### 1. 批量操作

对于大量数据操作，建议使用批量 API 或 SQL 查询以提高性能。

### 2. 错误处理

始终检查 API 响应的 `code` 字段，确保操作成功。

### 3. 权限控制

确保 API token 的安全性，不要在客户端代码中暴露。

### 4. 性能优化

- 使用 SQL 查询替代多次 API 调用
- 合理使用分页参数
- 避免频繁的小量数据操作

## 代码示例

### JavaScript

```javascript
// 获取笔记本列表
async function getNotebooks() {
  const response = await fetch('http://127.0.0.1:6806/api/notebook/lsNotebooks', {
    method: 'POST',
    headers: {
      'Authorization': 'Token YOUR_TOKEN',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  })
  
  const data = await response.json()
  return data.data.notebooks
}

// 创建文档
async function createDoc(notebook, path, title, content) {
  const response = await fetch('http://127.0.0.1:6806/api/filetree/createDoc', {
    method: 'POST',
    headers: {
      'Authorization': 'Token YOUR_TOKEN',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      notebook,
      path,
      title,
      md: content
    })
  })
  
  return await response.json()
}
```

### Python

```python
import requests
import json

class SiyuanAPI:
    def __init__(self, token, base_url='http://127.0.0.1:6806'):
        self.token = token
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Token {token}',
            'Content-Type': 'application/json'
        }
    
    def post(self, endpoint, data=None):
        url = f'{self.base_url}/api/{endpoint}'
        response = requests.post(url, headers=self.headers, json=data or {})
        return response.json()
    
    def get_notebooks(self):
        return self.post('notebook/lsNotebooks')
    
    def create_doc(self, notebook, path, title, content):
        return self.post('filetree/createDoc', {
            'notebook': notebook,
            'path': path,
            'title': title,
            'md': content
        })
    
    def sql_query(self, stmt):
        return self.post('query/sql', {'stmt': stmt})

# 使用示例
api = SiyuanAPI('YOUR_TOKEN')
notebooks = api.get_notebooks()
print(notebooks)
```

---

更多详细信息请参考 [思源笔记官方 API 文档](https://github.com/siyuan-note/siyuan/blob/master/API_zh_CN.md)。
