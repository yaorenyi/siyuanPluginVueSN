/**
 * OpenAI API 提供者 - Markdown 格式
 * 提供 OpenAI API 的完整参考文档
 */

export const openaiMarkdownContent = `# OpenAI API 参考文档

OpenAI API 提供了访问 GPT 模型和其他 AI 服务的强大接口。

## 基本信息

- **基础URL**: https://api.openai.com/v1
- **认证方式**: Bearer Token
- **版本**: v1
- **官方文档**: https://platform.openai.com/docs/api-reference

## 快速开始

### 认证

所有 API 请求都需要在请求头中包含您的 API 密钥：

\`\`\`http
Authorization: Bearer YOUR_API_KEY
\`\`\`

### 基本请求示例

\`\`\`bash
curl https://api.openai.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
\`\`\`

## 聊天完成 API

### POST /chat/completions

创建一个聊天完成请求，这是与 GPT 模型交互的主要方式。

#### 请求参数

| 参数名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| model | string | 是 | 要使用的模型ID，如 \`gpt-3.5-turbo\` 或 \`gpt-4\` |
| messages | array | 是 | 对话消息列表，每个消息包含 role 和 content |
| temperature | number | 否 | 控制输出随机性，范围 0-2，默认 1 |
| max_tokens | integer | 否 | 生成的最大token数量 |
| stream | boolean | 否 | 是否启用流式响应，默认 false |

#### 消息格式

每个消息对象包含以下字段：

- **role**: 消息角色，可以是 \`system\`、\`user\` 或 \`assistant\`
- **content**: 消息内容

#### 示例请求

\`\`\`json
{
  "model": "gpt-3.5-turbo",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 150
}
\`\`\`

#### 示例响应

\`\`\`json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "gpt-3.5-turbo-0613",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! I'm doing well, thank you for asking. How can I help you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 13,
    "completion_tokens": 17,
    "total_tokens": 30
  }
}
\`\`\`

## 流式响应

启用流式响应可以实时接收生成的内容：

\`\`\`json
{
  "model": "gpt-3.5-turbo",
  "messages": [{"role": "user", "content": "Tell me a story"}],
  "stream": true
}
\`\`\`

流式响应格式：

\`\`\`
data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1677652288,"model":"gpt-3.5-turbo-0613","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1677652288,"model":"gpt-3.5-turbo-0613","choices":[{"index":0,"delta":{"content":" there"},"finish_reason":null}]}

data: [DONE]
\`\`\`

## 模型列表

### 可用模型

| 模型名称 | 描述 | 最大tokens |
|----------|------|------------|
| gpt-4 | 最新的 GPT-4 模型 | 8,192 |
| gpt-4-32k | GPT-4 的长上下文版本 | 32,768 |
| gpt-3.5-turbo | 最新的 GPT-3.5 模型 | 4,096 |
| gpt-3.5-turbo-16k | GPT-3.5 的长上下文版本 | 16,384 |

### GET /models

获取可用模型列表：

\`\`\`bash
curl https://api.openai.com/v1/models \\
  -H "Authorization: Bearer YOUR_API_KEY"
\`\`\`

## 错误处理

API 使用标准的 HTTP 状态码来表示请求的成功或失败：

- **200**: 请求成功
- **400**: 请求参数错误
- **401**: 认证失败
- **429**: 请求频率限制
- **500**: 服务器内部错误

### 错误响应格式

\`\`\`json
{
  "error": {
    "message": "Invalid request: missing required parameter 'model'",
    "type": "invalid_request_error",
    "param": "model",
    "code": null
  }
}
\`\`\`

## 最佳实践

### 1. 合理设置参数

- **temperature**: 创意任务使用较高值(0.7-1.0)，事实性任务使用较低值(0.0-0.3)
- **max_tokens**: 根据需要设置合理的限制，避免不必要的消耗

### 2. 使用系统消息

通过系统消息设置助手的行为和角色：

\`\`\`json
{
  "messages": [
    {
      "role": "system",
      "content": "You are a professional translator. Translate the following text to Chinese."
    },
    {
      "role": "user",
      "content": "Hello, world!"
    }
  ]
}
\`\`\`

### 3. 处理长对话

对于长对话，注意 token 限制，必要时截断或总结历史消息。

### 4. 错误重试

实现指数退避重试机制处理临时错误和速率限制。

## 代码示例

### Python

\`\`\`python
import openai

openai.api_key = "YOUR_API_KEY"

response = openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "user", "content": "Hello, how are you?"}
    ]
)

print(response.choices[0].message.content)
\`\`\`

### JavaScript

\`\`\`javascript
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: "YOUR_API_KEY",
});
const openai = new OpenAIApi(configuration);

async function chatCompletion() {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "user", content: "Hello, how are you?" }
    ],
  });
  
  console.log(response.data.choices[0].message.content);
}
\`\`\`

### cURL

\`\`\`bash
curl https://api.openai.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {
        "role": "user",
        "content": "Hello, how are you?"
      }
    ],
    "temperature": 0.7
  }'
\`\`\`

## 费用和限制

### Token 计算

- 输入和输出都会计算 token
- 1 token ≈ 4 个字符（英文）
- 中文字符通常需要更多 token

### 速率限制

不同模型有不同的速率限制，请查看官方文档获取最新信息。

### 费用

费用基于使用的 token 数量计算，不同模型价格不同。建议在 OpenAI 控制台查看实时定价。

---

更多详细信息请参考 [OpenAI 官方文档](https://platform.openai.com/docs/api-reference)。
`