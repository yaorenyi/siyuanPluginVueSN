/**
 * 通用 REST API 提供者
 * 用于展示常见的REST API设计模式和最佳实践
 */
import type { ApiProvider } from '../types'

export const restApiProvider: ApiProvider = {
  id: 'rest',
  name: 'REST API',
  description: '通用 REST API 设计模式和最佳实践参考',
  icon: '🌐',
  version: '1.0',
  documentationUrl: 'https://restfulapi.net/',
  baseUrl: 'https://api.example.com',
  authType: 'apiKey',
  categories: [
    {
      id: 'crud',
      title: '📋 基础 CRUD',
      description: '标准的增删改查操作模式',
      endpoints: [
        {
          id: 'get-list',
          name: '获取列表',
          method: 'GET',
          endpoint: '/{resource}',
          description: '获取资源列表（分页、排序、过滤）',
          parameters: [
            {
              name: 'page',
              type: 'integer',
              required: false,
              description: '页码（从1开始）'
            },
            {
              name: 'limit',
              type: 'integer',
              required: false,
              description: '每页数量'
            },
            {
              name: 'sort',
              type: 'string',
              required: false,
              description: '排序字段'
            },
            {
              name: 'order',
              type: 'string',
              required: false,
              description: '排序方向：asc、desc'
            },
            {
              name: 'filter[field]',
              type: 'string',
              required: false,
              description: '字段过滤'
            }
          ],
          examples: [
            {
              title: '获取用户列表',
              description: '获取所有用户，支持分页和排序',
              method: 'GET',
              endpoint: '/users?page=1&limit=10&sort=created_at&order=desc',
              response: {
                data: [
                  {
                    id: 1,
                    name: 'John Doe',
                    email: 'john@example.com',
                    created_at: '2023-01-01T00:00:00Z'
                  }
                ],
                pagination: {
                  page: 1,
                  limit: 10,
                  total: 100,
                  totalPages: 10
                }
              }
            }
          ]
        },
        {
          id: 'get-item',
          name: '获取单个资源',
          method: 'GET',
          endpoint: '/{resource}/{id}',
          description: '根据ID获取单个资源的详细信息',
          parameters: [
            {
              name: 'id',
              type: 'string|integer',
              required: true,
              description: '资源ID'
            }
          ],
          examples: [
            {
              title: '获取用户详情',
              description: '根据ID获取特定用户的详细信息',
              method: 'GET',
              endpoint: '/users/123',
              response: {
                id: 123,
                name: 'John Doe',
                email: 'john@example.com',
                profile: {
                  firstName: 'John',
                  lastName: 'Doe',
                  age: 30
                },
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-12-01T00:00:00Z'
              }
            }
          ]
        },
        {
          id: 'create',
          name: '创建资源',
          method: 'POST',
          endpoint: '/{resource}',
          description: '创建新资源',
          parameters: [
            {
              name: 'body',
              type: 'object',
              required: true,
              description: '资源数据'
            }
          ],
          examples: [
            {
              title: '创建用户',
              description: '创建一个新用户',
              method: 'POST',
              endpoint: '/users',
              body: {
                name: 'Jane Doe',
                email: 'jane@example.com',
                password: 'secure_password',
                profile: {
                  firstName: 'Jane',
                  lastName: 'Doe',
                  age: 25
                }
              },
              response: {
                id: 124,
                name: 'Jane Doe',
                email: 'jane@example.com',
                profile: {
                  firstName: 'Jane',
                  lastName: 'Doe',
                  age: 25
                },
                created_at: '2023-12-01T00:00:00Z',
                updated_at: '2023-12-01T00:00:00Z'
              }
            }
          ]
        },
        {
          id: 'update',
          name: '更新资源',
          method: 'PUT',
          endpoint: '/{resource}/{id}',
          description: '完全更新资源（替换所有字段）',
          parameters: [
            {
              name: 'id',
              type: 'string|integer',
              required: true,
              description: '资源ID'
            },
            {
              name: 'body',
              type: 'object',
              required: true,
              description: '完整资源数据'
            }
          ],
          examples: [
            {
              title: '更新用户信息',
              description: '完全更新用户的所有字段',
              method: 'PUT',
              endpoint: '/users/123',
              body: {
                id: 123,
                name: 'John Smith',
                email: 'john.smith@example.com',
                profile: {
                  firstName: 'John',
                  lastName: 'Smith',
                  age: 31
                }
              },
              response: {
                id: 123,
                name: 'John Smith',
                email: 'john.smith@example.com',
                profile: {
                  firstName: 'John',
                  lastName: 'Smith',
                  age: 31
                },
                updated_at: '2023-12-02T00:00:00Z'
              }
            }
          ]
        },
        {
          id: 'patch',
          name: '部分更新',
          method: 'PATCH',
          endpoint: '/{resource}/{id}',
          description: '部分更新资源（仅更新指定字段）',
          parameters: [
            {
              name: 'id',
              type: 'string|integer',
              required: true,
              description: '资源ID'
            },
            {
              name: 'body',
              type: 'object',
              required: true,
              description: '要更新的字段'
            }
          ],
          examples: [
            {
              title: '更新用户邮箱',
              description: '只更新用户的邮箱地址',
              method: 'PATCH',
              endpoint: '/users/123',
              body: {
                email: 'newemail@example.com'
              },
              response: {
                id: 123,
                name: 'John Doe',
                email: 'newemail@example.com',
                profile: {
                  firstName: 'John',
                  lastName: 'Doe',
                  age: 30
                },
                updated_at: '2023-12-02T00:00:00Z'
              }
            }
          ]
        },
        {
          id: 'delete',
          name: '删除资源',
          method: 'DELETE',
          endpoint: '/{resource}/{id}',
          description: '删除指定资源',
          parameters: [
            {
              name: 'id',
              type: 'string|integer',
              required: true,
              description: '资源ID'
            }
          ],
          examples: [
            {
              title: '删除用户',
              description: '删除指定的用户',
              method: 'DELETE',
              endpoint: '/users/123',
              response: {
                success: true,
                message: 'User deleted successfully'
              }
            }
          ]
        }
      ]
    },
    {
      id: 'authentication',
      title: '🔐 认证授权',
      description: '常见的认证和授权机制',
      endpoints: [
        {
          id: 'login',
          name: '用户登录',
          method: 'POST',
          endpoint: '/auth/login',
          description: '用户身份验证',
          parameters: [
            {
              name: 'email',
              type: 'string',
              required: true,
              description: '用户邮箱'
            },
            {
              name: 'password',
              type: 'string',
              required: true,
              description: '用户密码'
            }
          ],
          examples: [
            {
              title: '登录',
              description: '使用邮箱和密码登录',
              method: 'POST',
              endpoint: '/auth/login',
              body: {
                email: 'user@example.com',
                password: 'password123'
              },
              response: {
                success: true,
                data: {
                  user: {
                    id: 123,
                    name: 'John Doe',
                    email: 'user@example.com',
                    role: 'user'
                  },
                  tokens: {
                    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    expiresIn: 3600
                  }
                }
              }
            }
          ]
        },
        {
          id: 'refresh',
          name: '刷新令牌',
          method: 'POST',
          endpoint: '/auth/refresh',
          description: '使用刷新令牌获取新的访问令牌',
          parameters: [
            {
              name: 'refreshToken',
              type: 'string',
              required: true,
              description: '刷新令牌'
            }
          ],
          examples: [
            {
              title: '刷新令牌',
              description: '使用刷新令牌获取新的访问令牌',
              method: 'POST',
              endpoint: '/auth/refresh',
              body: {
                refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
              },
              response: {
                success: true,
                data: {
                  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  expiresIn: 3600
                }
              }
            }
          ]
        },
        {
          id: 'logout',
          name: '用户登出',
          method: 'POST',
          endpoint: '/auth/logout',
          description: '用户登出，使当前令牌失效',
          examples: [
            {
              title: '登出',
              description: '用户登出，使访问令牌失效',
              method: 'POST',
              endpoint: '/auth/logout',
              headers: {
                'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
              },
              response: {
                success: true,
                message: 'Logged out successfully'
              }
            }
          ]
        }
      ]
    },
    {
      id: 'bulk',
      title: '📦 批量操作',
      description: '批量处理多个资源',
      endpoints: [
        {
          id: 'bulk-create',
          name: '批量创建',
          method: 'POST',
          endpoint: '/{resource}/batch',
          description: '批量创建多个资源',
          parameters: [
            {
              name: 'items',
              type: 'array',
              required: true,
              description: '要创建的资源数组'
            }
          ],
          examples: [
            {
              title: '批量创建用户',
              description: '一次性创建多个用户',
              method: 'POST',
              endpoint: '/users/batch',
              body: {
                items: [
                  {
                    name: 'User 1',
                    email: 'user1@example.com'
                  },
                  {
                    name: 'User 2',
                    email: 'user2@example.com'
                  }
                ]
              },
              response: {
                success: true,
                data: {
                  created: [
                    {
                      id: 125,
                      name: 'User 1',
                      email: 'user1@example.com'
                    },
                    {
                      id: 126,
                      name: 'User 2',
                      email: 'user2@example.com'
                    }
                  ],
                  failed: []
                }
              }
            }
          ]
        },
        {
          id: 'bulk-update',
          name: '批量更新',
          method: 'PUT',
          endpoint: '/{resource}/batch',
          description: '批量更新多个资源',
          examples: [
            {
              title: '批量更新用户',
              description: '一次性更新多个用户',
              method: 'PUT',
              endpoint: '/users/batch',
              body: {
                items: [
                  {
                    id: 125,
                    name: 'Updated User 1'
                  },
                  {
                    id: 126,
                    name: 'Updated User 2'
                  }
                ]
              },
              response: {
                success: true,
                data: {
                  updated: [
                    {
                      id: 125,
                      name: 'Updated User 1',
                      email: 'user1@example.com'
                    },
                    {
                      id: 126,
                      name: 'Updated User 2',
                      email: 'user2@example.com'
                    }
                  ],
                  failed: []
                }
              }
            }
          ]
        }
      ]
    },
    {
      id: 'relationships',
      title: '🔗 关联关系',
      description: '处理资源之间的关联关系',
      endpoints: [
        {
          id: 'get-related',
          name: '获取关联资源',
          method: 'GET',
          endpoint: '/{resource}/{id}/{relatedResource}',
          description: '获取主资源的关联资源',
          parameters: [
            {
              name: 'id',
              type: 'string|integer',
              required: true,
              description: '主资源ID'
            },
            {
              name: 'relatedResource',
              type: 'string',
              required: true,
              description: '关联资源名称'
            }
          ],
          examples: [
            {
              title: '获取用户的文章',
              description: '获取指定用户的所有文章',
              method: 'GET',
              endpoint: '/users/123/posts',
              response: [
                {
                  id: 1,
                  title: 'Post 1',
                  content: 'Content of post 1',
                  created_at: '2023-01-01T00:00:00Z'
                },
                {
                  id: 2,
                  title: 'Post 2',
                  content: 'Content of post 2',
                  created_at: '2023-01-02T00:00:00Z'
                }
              ]
            }
          ]
        },
        {
          id: 'link-resources',
          name: '关联资源',
          method: 'POST',
          endpoint: '/{resource}/{id}/{relatedResource}',
          description: '建立两个资源之间的关联关系',
          examples: [
            {
              title: '关联用户和角色',
              description: '为用户分配角色',
              method: 'POST',
              endpoint: '/users/123/roles',
              body: {
                roleId: 456
              },
              response: {
                success: true,
                message: 'Role assigned successfully'
              }
            }
          ]
        },
        {
          id: 'unlink-resources',
          name: '取消关联',
          method: 'DELETE',
          endpoint: '/{resource}/{id}/{relatedResource}/{relatedId}',
          description: '移除两个资源之间的关联关系',
          examples: [
            {
              title: '移除用户角色',
              description: '移除用户的特定角色',
              method: 'DELETE',
              endpoint: '/users/123/roles/456',
              response: {
                success: true,
                message: 'Role removed successfully'
              }
            }
          ]
        }
      ]
    },
    {
      id: 'errors',
      title: '⚠️ 错误处理',
      description: '标准的错误响应格式和处理方式',
      endpoints: [],
      examples: []
    },
    {
      id: 'versioning',
      title: '📌 版本控制',
      description: 'API版本管理策略',
      endpoints: [],
      examples: []
    }
  ]
}
