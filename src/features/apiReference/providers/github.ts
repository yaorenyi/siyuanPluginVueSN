/**
 * GitHub API 提供者
 */
import type { ApiProvider } from '../types'

export const githubApiProvider: ApiProvider = {
  id: 'github',
  name: 'GitHub',
  description: 'GitHub API - 最大的代码托管平台的完整API接口',
  icon: '🐙',
  version: 'v3',
  documentationUrl: 'https://docs.github.com/en/rest',
  baseUrl: 'https://api.github.com',
  authType: 'bearer',
  categories: [
    {
      id: 'repos',
      title: '📦 仓库管理',
      description: '仓库的创建、查询、更新等操作',
      endpoints: [
        {
          id: 'list-repos',
          name: '列出仓库',
          method: 'GET',
          endpoint: '/user/repos',
          description: '列出当前用户的仓库',
          parameters: [
            {
              name: 'visibility',
              type: 'string',
              required: false,
              description: '可见性：all、public、private'
            },
            {
              name: 'sort',
              type: 'string',
              required: false,
              description: '排序方式：created、updated、pushed、full_name'
            },
            {
              name: 'direction',
              type: 'string',
              required: false,
              description: '排序方向：asc、desc'
            },
            {
              name: 'per_page',
              type: 'number',
              required: false,
              description: '每页数量（最大100）'
            }
          ],
          examples: [
            {
              title: '获取用户仓库',
              description: '获取当前用户的所有仓库',
              method: 'GET',
              endpoint: '/user/repos?sort=updated&per_page=10',
              headers: {
                'Authorization': 'Bearer YOUR_TOKEN',
                'Accept': 'application/vnd.github.v3+json'
              },
              response: [
                {
                  id: 123456,
                  name: 'my-repo',
                  full_name: 'username/my-repo',
                  description: 'My awesome repository',
                  private: false,
                  html_url: 'https://github.com/username/my-repo',
                  created_at: '2023-01-01T00:00:00Z',
                  updated_at: '2023-12-01T00:00:00Z',
                  stargazers_count: 100,
                  forks_count: 20
                }
              ]
            }
          ]
        },
        {
          id: 'get-repo',
          name: '获取仓库',
          method: 'GET',
          endpoint: '/repos/{owner}/{repo}',
          description: '获取特定仓库的详细信息',
          parameters: [
            {
              name: 'owner',
              type: 'string',
              required: true,
              description: '仓库所有者'
            },
            {
              name: 'repo',
              type: 'string',
              required: true,
              description: '仓库名称'
            }
          ],
          examples: [
            {
              title: '获取仓库详情',
              description: '获取指定仓库的详细信息',
              method: 'GET',
              endpoint: '/repos/microsoft/vscode',
              headers: {
                'Authorization': 'Bearer YOUR_TOKEN',
                'Accept': 'application/vnd.github.v3+json'
              },
              response: {
                id: 53807931,
                name: 'vscode',
                full_name: 'microsoft/vscode',
                description: 'Visual Studio Code',
                private: false,
                html_url: 'https://github.com/microsoft/vscode',
                default_branch: 'main',
                language: 'TypeScript',
                stargazers_count: 150000,
                forks_count: 25000,
                open_issues_count: 5000
              }
            }
          ]
        },
        {
          id: 'create-repo',
          name: '创建仓库',
          method: 'POST',
          endpoint: '/user/repos',
          description: '创建新仓库',
          parameters: [
            {
              name: 'name',
              type: 'string',
              required: true,
              description: '仓库名称'
            },
            {
              name: 'description',
              type: 'string',
              required: false,
              description: '仓库描述'
            },
            {
              name: 'private',
              type: 'boolean',
              required: false,
              description: '是否私有'
            },
            {
              name: 'auto_init',
              type: 'boolean',
              required: false,
              description: '是否初始化README'
            }
          ],
          examples: [
            {
              title: '创建仓库',
              description: '创建一个新的GitHub仓库',
              method: 'POST',
              endpoint: '/user/repos',
              headers: {
                'Authorization': 'Bearer YOUR_TOKEN',
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
              },
              body: {
                name: 'my-new-repo',
                description: 'My awesome new repository',
                private: false,
                auto_init: true
              },
              response: {
                id: 123456,
                name: 'my-new-repo',
                full_name: 'username/my-new-repo',
                description: 'My awesome new repository',
                private: false,
                html_url: 'https://github.com/username/my-new-repo',
                created_at: '2023-12-01T00:00:00Z'
              }
            }
          ]
        }
      ]
    },
    {
      id: 'issues',
      title: '🐛 问题管理',
      description: 'GitHub Issues 的创建、查询、更新等操作',
      endpoints: [
        {
          id: 'list-issues',
          name: '列出问题',
          method: 'GET',
          endpoint: '/repos/{owner}/{repo}/issues',
          description: '列出仓库的所有问题',
          parameters: [
            {
              name: 'state',
              type: 'string',
              required: false,
              description: '问题状态：open、closed、all'
            },
            {
              name: 'labels',
              type: 'string',
              required: false,
              description: '标签过滤'
            },
            {
              name: 'sort',
              type: 'string',
              required: false,
              description: '排序方式：created、updated、comments'
            },
            {
              name: 'direction',
              type: 'string',
              required: false,
              description: '排序方向：asc、desc'
            }
          ],
          examples: [
            {
              title: '获取仓库问题',
              description: '获取仓库的所有开放问题',
              method: 'GET',
              endpoint: '/repos/microsoft/vscode/issues?state=open&sort=updated',
              headers: {
                'Authorization': 'Bearer YOUR_TOKEN',
                'Accept': 'application/vnd.github.v3+json'
              },
              response: [
                {
                  id: 123456,
                  number: 123,
                  title: 'Bug in feature X',
                  state: 'open',
                  html_url: 'https://github.com/microsoft/vscode/issues/123',
                  created_at: '2023-12-01T00:00:00Z',
                  updated_at: '2023-12-02T00:00:00Z',
                  user: {
                    login: 'username',
                    avatar_url: 'https://github.com/images/error/username_happy.gif'
                  }
                }
              ]
            }
          ]
        },
        {
          id: 'create-issue',
          name: '创建问题',
          method: 'POST',
          endpoint: '/repos/{owner}/{repo}/issues',
          description: '创建新问题',
          parameters: [
            {
              name: 'title',
              type: 'string',
              required: true,
              description: '问题标题'
            },
            {
              name: 'body',
              type: 'string',
              required: false,
              description: '问题描述'
            },
            {
              name: 'assignees',
              type: 'array',
              required: false,
              description: '分配的用户'
            },
            {
              name: 'labels',
              type: 'array',
              required: false,
              description: '标签'
            }
          ],
          examples: [
            {
              title: '创建问题',
              description: '创建一个新的bug报告',
              method: 'POST',
              endpoint: '/repos/username/repo/issues',
              headers: {
                'Authorization': 'Bearer YOUR_TOKEN',
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
              },
              body: {
                title: 'Bug in feature X',
                body: 'I found a bug in feature X. It happens when...',
                assignees: ['username'],
                labels: ['bug', 'high-priority']
              },
              response: {
                id: 123456,
                number: 123,
                title: 'Bug in feature X',
                state: 'open',
                html_url: 'https://github.com/username/repo/issues/123',
                created_at: '2023-12-01T00:00:00Z'
              }
            }
          ]
        }
      ]
    },
    {
      id: 'pulls',
      title: '🔀 拉取请求',
      description: 'GitHub Pull Requests 的创建、查询、更新等操作',
      endpoints: [
        {
          id: 'list-pulls',
          name: '列出拉取请求',
          method: 'GET',
          endpoint: '/repos/{owner}/{repo}/pulls',
          description: '列出仓库的所有拉取请求',
          parameters: [
            {
              name: 'state',
              type: 'string',
              required: false,
              description: '状态：open、closed、all'
            },
            {
              name: 'head',
              type: 'string',
              required: false,
              description: '源分支：owner:branch'
            },
            {
              name: 'base',
              type: 'string',
              required: false,
              description: '目标分支'
            },
            {
              name: 'sort',
              type: 'string',
              required: false,
              description: '排序方式：created、updated、popularity'
            }
          ],
          examples: [
            {
              title: '获取拉取请求',
              description: '获取仓库的所有开放拉取请求',
              method: 'GET',
              endpoint: '/repos/microsoft/vscode/pulls?state=open',
              headers: {
                'Authorization': 'Bearer YOUR_TOKEN',
                'Accept': 'application/vnd.github.v3+json'
              },
              response: [
                {
                  id: 123456,
                  number: 123,
                  title: 'Add new feature X',
                  state: 'open',
                  html_url: 'https://github.com/microsoft/vscode/pull/123',
                  created_at: '2023-12-01T00:00:00Z',
                  updated_at: '2023-12-02T00:00:00Z',
                  user: {
                    login: 'contributor',
                    avatar_url: 'https://github.com/images/error/contributor_happy.gif'
                  },
                  head: {
                    ref: 'feature-x',
                    sha: 'abc123'
                  },
                  base: {
                    ref: 'main',
                    sha: 'def456'
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'users',
      title: '👤 用户管理',
      description: '用户信息的查询和管理',
      endpoints: [
        {
          id: 'get-user',
          name: '获取用户信息',
          method: 'GET',
          endpoint: '/users/{username}',
          description: '获取特定用户的详细信息',
          parameters: [
            {
              name: 'username',
              type: 'string',
              required: true,
              description: '用户名'
            }
          ],
          examples: [
            {
              title: '获取用户详情',
              description: '获取指定用户的详细信息',
              method: 'GET',
              endpoint: '/users/octocat',
              headers: {
                'Accept': 'application/vnd.github.v3+json'
              },
              response: {
                login: 'octocat',
                id: 1,
                avatar_url: 'https://github.com/images/error/octocat_happy.gif',
                html_url: 'https://github.com/octocat',
                name: 'monalisa octocat',
                company: 'GitHub',
                blog: 'https://github.com/blog',
                location: 'San Francisco',
                bio: 'There once was...',
                public_repos: 2,
                public_gists: 1,
                followers: 20,
                following: 0,
                created_at: '2008-01-14T04:33:35Z'
              }
            }
          ]
        },
        {
          id: 'get-authenticated-user',
          name: '获取当前用户',
          method: 'GET',
          endpoint: '/user',
          description: '获取当前认证用户的详细信息',
          examples: [
            {
              title: '获取当前用户',
              description: '获取当前认证用户的信息',
              method: 'GET',
              endpoint: '/user',
              headers: {
                'Authorization': 'Bearer YOUR_TOKEN',
                'Accept': 'application/vnd.github.v3+json'
              },
              response: {
                login: 'username',
                id: 123456,
                avatar_url: 'https://github.com/images/error/username_happy.gif',
                html_url: 'https://github.com/username',
                name: 'User Name',
                company: 'Company Inc.',
                blog: 'https://username.github.io',
                location: 'City, Country',
                email: 'user@example.com',
                public_repos: 10,
                public_gists: 5,
                followers: 100,
                following: 50,
                created_at: '2020-01-01T00:00:00Z'
              }
            }
          ]
        }
      ]
    },
    {
      id: 'gists',
      title: '📋 代码片段',
      description: 'GitHub Gists 的创建、查询、更新等操作',
      endpoints: [
        {
          id: 'list-gists',
          name: '列出代码片段',
          method: 'GET',
          endpoint: '/gists',
          description: '列出当前用户的代码片段',
          examples: [
            {
              title: '获取代码片段',
              description: '获取当前用户的所有代码片段',
              method: 'GET',
              endpoint: '/gists',
              headers: {
                'Authorization': 'Bearer YOUR_TOKEN',
                'Accept': 'application/vnd.github.v3+json'
              },
              response: [
                {
                  id: 'aa5a315d61ae9438b18d',
                  html_url: 'https://gist.github.com/aa5a315d61ae9438b18d',
                  description: 'My awesome gist',
                  public: true,
                  created_at: '2023-12-01T00:00:00Z',
                  files: {
                    'file1.txt': {
                      filename: 'file1.txt',
                      type: 'text/plain',
                      language: 'Text',
                      size: 1024
                    }
                  },
                  owner: {
                    login: 'username',
                    avatar_url: 'https://github.com/images/error/username_happy.gif'
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'search',
      title: '🔍 搜索',
      description: '搜索仓库、代码、用户等',
      endpoints: [
        {
          id: 'search-repos',
          name: '搜索仓库',
          method: 'GET',
          endpoint: '/search/repositories',
          description: '搜索GitHub仓库',
          parameters: [
            {
              name: 'q',
              type: 'string',
              required: true,
              description: '搜索查询'
            },
            {
              name: 'sort',
              type: 'string',
              required: false,
              description: '排序：stars、forks、help-wanted-issues、updated'
            },
            {
              name: 'order',
              type: 'string',
              required: false,
              description: '排序方向：asc、desc'
            }
          ],
          examples: [
            {
              title: '搜索仓库',
              description: '搜索包含"machine learning"主题的仓库',
              method: 'GET',
              endpoint: '/search/repositories?q=machine+learning&sort=stars&order=desc',
              headers: {
                'Accept': 'application/vnd.github.v3+json'
              },
              response: {
                total_count: 100000,
                incomplete_results: false,
                items: [
                  {
                    id: 123456,
                    name: 'awesome-machine-learning',
                    full_name: 'username/awesome-machine-learning',
                    description: 'A curated list of awesome Machine Learning frameworks',
                    html_url: 'https://github.com/username/awesome-machine-learning',
                    stargazers_count: 150000,
                    forks_count: 25000,
                    language: 'Python',
                    updated_at: '2023-12-01T00:00:00Z'
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  ]
}
