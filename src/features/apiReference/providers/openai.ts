/**
 * OpenAI API 提供者
 */
import type { ApiProvider } from '../types'

export const openaiApiProvider: ApiProvider = {
  id: 'openai',
  name: 'OpenAI',
  description: 'OpenAI API - 强大的大语言模型和AI服务接口',
  icon: '🤖',
  version: 'v1',
  documentationUrl: 'https://platform.openai.com/docs/api-reference',
  baseUrl: 'https://api.openai.com/v1',
  authType: 'bearer',
  categories: [
    {
      id: 'chat',
      title: '💬 对话生成',
      description: '使用 GPT 模型进行对话和文本生成',
      endpoints: [
        {
          id: 'chat-completions',
          name: '创建对话',
          method: 'POST',
          endpoint: '/chat/completions',
          description: '使用 GPT 模型生成对话响应',
          parameters: [
            {
              name: 'model',
              type: 'string',
              required: true,
              description: '模型名称，如 gpt-3.5-turbo、gpt-4'
            },
            {
              name: 'messages',
              type: 'array',
              required: true,
              description: '消息数组'
            },
            {
              name: 'temperature',
              type: 'number',
              required: false,
              description: '温度参数，控制随机性（0-2）'
            },
            {
              name: 'max_tokens',
              type: 'number',
              required: false,
              description: '最大生成token数'
            }
          ],
          examples: [
            {
              title: '基本对话',
              description: '与GPT进行简单的问答对话',
              method: 'POST',
              endpoint: '/chat/completions',
              headers: {
                'Authorization': 'Bearer YOUR_API_KEY',
                'Content-Type': 'application/json'
              },
              body: {
                model: 'gpt-3.5-turbo',
                messages: [
                  {
                    role: 'user',
                    content: '你好，请介绍一下自己'
                  }
                ],
                temperature: 0.7,
                max_tokens: 150
              },
              response: {
                id: 'chatcmpl-abc123',
                object: 'chat.completion',
                created: 1677652288,
                model: 'gpt-3.5-turbo-0125',
                choices: [
                  {
                    index: 0,
                    message: {
                      role: 'assistant',
                      content: '你好！我是由OpenAI开发的人工智能助手...'
                    },
                    finish_reason: 'stop'
                  }
                ],
                usage: {
                  prompt_tokens: 9,
                  completion_tokens: 12,
                  total_tokens: 21
                }
              }
            }
          ]
        }
      ]
    },
    {
      id: 'completions',
      title: '📝 文本补全',
      description: '使用 GPT 模型进行文本补全',
      endpoints: [
        {
          id: 'completions',
          name: '创建补全',
          method: 'POST',
          endpoint: '/completions',
          description: '使用 GPT 模型进行文本补全',
          parameters: [
            {
              name: 'model',
              type: 'string',
              required: true,
              description: '模型名称，如 text-davinci-003'
            },
            {
              name: 'prompt',
              type: 'string',
              required: true,
              description: '提示文本'
            },
            {
              name: 'max_tokens',
              type: 'number',
              required: false,
              description: '最大生成token数'
            },
            {
              name: 'temperature',
              type: 'number',
              required: false,
              description: '温度参数（0-2）'
            }
          ],
          examples: [
            {
              title: '文本补全',
              description: '根据提示补全文本',
              method: 'POST',
              endpoint: '/completions',
              headers: {
                'Authorization': 'Bearer YOUR_API_KEY',
                'Content-Type': 'application/json'
              },
              body: {
                model: 'text-davinci-003',
                prompt: '写一个关于人工智能的介绍',
                max_tokens: 200,
                temperature: 0.7
              },
              response: {
                id: 'cmpl-abc123',
                object: 'text_completion',
                created: 1677652288,
                model: 'text-davinci-003',
                choices: [
                  {
                    text: '人工智能（Artificial Intelligence，简称AI）是指...',
                    index: 0,
                    finish_reason: 'stop'
                  }
                ],
                usage: {
                  prompt_tokens: 10,
                  completion_tokens: 50,
                  total_tokens: 60
                }
              }
            }
          ]
        }
      ]
    },
    {
      id: 'embeddings',
      title: '🔢 向量嵌入',
      description: '生成文本的向量嵌入表示',
      endpoints: [
        {
          id: 'embeddings',
          name: '创建嵌入',
          method: 'POST',
          endpoint: '/embeddings',
          description: '生成文本的向量嵌入',
          parameters: [
            {
              name: 'model',
              type: 'string',
              required: true,
              description: '模型名称，如 text-embedding-ada-002'
            },
            {
              name: 'input',
              type: 'array',
              required: true,
              description: '要嵌入的文本数组'
            }
          ],
          examples: [
            {
              title: '生成嵌入',
              description: '为文本生成向量嵌入',
              method: 'POST',
              endpoint: '/embeddings',
              headers: {
                'Authorization': 'Bearer YOUR_API_KEY',
                'Content-Type': 'application/json'
              },
              body: {
                model: 'text-embedding-ada-002',
                input: ['Hello world', 'This is a test']
              },
              response: {
                object: 'list',
                data: [
                  {
                    object: 'embedding',
                    embedding: [0.1, 0.2, 0.3],
                    index: 0
                  },
                  {
                    object: 'embedding',
                    embedding: [0.4, 0.5, 0.6],
                    index: 1
                  }
                ],
                model: 'text-embedding-ada-002',
                usage: {
                  prompt_tokens: 5,
                  total_tokens: 5
                }
              }
            }
          ]
        }
      ]
    },
    {
      id: 'images',
      title: '🎨 图像生成',
      description: '使用 DALL-E 生成图像',
      endpoints: [
        {
          id: 'images-generations',
          name: '生成图像',
          method: 'POST',
          endpoint: '/images/generations',
          description: '使用 DALL-E 模型生成图像',
          parameters: [
            {
              name: 'model',
              type: 'string',
              required: true,
              description: '模型名称，如 dall-e-3、dall-e-2'
            },
            {
              name: 'prompt',
              type: 'string',
              required: true,
              description: '图像描述'
            },
            {
              name: 'size',
              type: 'string',
              required: false,
              description: '图像尺寸，如 1024x1024'
            },
            {
              name: 'quality',
              type: 'string',
              required: false,
              description: '图像质量，如 hd、standard'
            },
            {
              name: 'n',
              type: 'number',
              required: false,
              description: '生成图像数量'
            }
          ],
          examples: [
            {
              title: '生成图像',
              description: '根据描述生成图像',
              method: 'POST',
              endpoint: '/images/generations',
              headers: {
                'Authorization': 'Bearer YOUR_API_KEY',
                'Content-Type': 'application/json'
              },
              body: {
                model: 'dall-e-3',
                prompt: '一只可爱的小猫在花园里玩耍',
                size: '1024x1024',
                quality: 'hd',
                n: 1
              },
              response: {
                created: 1677652288,
                data: [
                  {
                    url: 'https://oaidalle...'
                  }
                ]
              }
            }
          ]
        }
      ]
    },
    {
      id: 'moderations',
      title: '🛡️ 内容审核',
      description: '检测文本是否包含有害内容',
      endpoints: [
        {
          id: 'moderations',
          name: '审核内容',
          method: 'POST',
          endpoint: '/moderations',
          description: '检测文本是否包含有害内容',
          parameters: [
            {
              name: 'input',
              type: 'string',
              required: true,
              description: '要审核的文本'
            },
            {
              name: 'model',
              type: 'string',
              required: false,
              description: '模型名称，如 text-moderation-stable'
            }
          ],
          examples: [
            {
              title: '内容审核',
              description: '检测文本是否包含有害内容',
              method: 'POST',
              endpoint: '/moderations',
              headers: {
                'Authorization': 'Bearer YOUR_API_KEY',
                'Content-Type': 'application/json'
              },
              body: {
                input: 'I love programming!',
                model: 'text-moderation-stable'
              },
              response: {
                id: 'modr-abc123',
                model: 'text-moderation-stable',
                results: [
                  {
                    flagged: false,
                    categories: {
                      sexual: false,
                      hate: false,
                      harassment: false,
                      'self-harm': false,
                      violence: false,
                      'violence/graphic': false
                    },
                    category_scores: {
                      sexual: 0.1,
                      hate: 0.1,
                      harassment: 0.1,
                      'self-harm': 0.1,
                      violence: 0.1,
                      'violence/graphic': 0.1
                    }
                  }
                ]
              }
            }
          ]
        }
      ]
    },
    {
      id: 'models',
      title: '🤖 模型管理',
      description: '列出和获取模型信息',
      endpoints: [
        {
          id: 'models-list',
          name: '列出模型',
          method: 'GET',
          endpoint: '/models',
          description: '获取所有可用模型的列表',
          examples: [
            {
              title: '获取模型列表',
              description: '列出所有可用的模型',
              method: 'GET',
              endpoint: '/models',
              headers: {
                'Authorization': 'Bearer YOUR_API_KEY'
              },
              response: {
                object: 'list',
                data: [
                  {
                    id: 'gpt-4',
                    object: 'model',
                    created: 1677611942,
                    owned_by: 'openai'
                  }
                ]
              }
            }
          ]
        },
        {
          id: 'models-retrieve',
          name: '获取模型',
          method: 'GET',
          endpoint: '/models/{model}',
          description: '获取特定模型的详细信息',
          examples: [
            {
              title: '获取模型详情',
              description: '获取指定模型的详细信息',
              method: 'GET',
              endpoint: '/models/gpt-4',
              headers: {
                'Authorization': 'Bearer YOUR_API_KEY'
              },
              response: {
                id: 'gpt-4',
                object: 'model',
                created: 1677611942,
                owned_by: 'openai'
              }
            }
          ]
        }
      ]
    }
  ]
}
