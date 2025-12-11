/**
 * 思源笔记 API 提供者
 */
import type { ApiProvider } from '../types'

export const siyuanApiProvider: ApiProvider = {
  id: 'siyuan',
  name: 'SiYuan',
  description: '思源笔记 API - 本地知识管理工具的完整 API 接口',
  icon: '📝',
  version: '1.0.0',
  documentationUrl: 'https://github.com/siyuan-note/siyuan/blob/master/API_zh_CN.md',
  baseUrl: 'http://127.0.0.1:6806',
  authType: 'apiKey',
  categories: [
    {
      id: 'notebook',
      title: '📚 笔记本操作',
      description: '管理笔记本的 CRUD 操作',
      endpoints: [
        {
          id: 'lsNotebooks',
          name: '列出笔记本',
          method: 'POST',
          endpoint: '/api/notebook/lsNotebooks',
          description: '获取所有笔记本列表',
          examples: [
            {
              title: '基本用法',
              description: '获取所有笔记本',
              method: 'POST',
              endpoint: '/api/notebook/lsNotebooks',
              response: {
                code: 0,
                data: {
                  notebooks: [
                    {
                      id: '20210817205410-2kvfpfn',
                      name: '测试笔记本',
                      icon: '1f41b',
                      sort: 0,
                      closed: false
                    }
                  ]
                }
              }
            }
          ]
        },
        {
          id: 'createNotebook',
          name: '创建笔记本',
          method: 'POST',
          endpoint: '/api/notebook/createNotebook',
          description: '创建新的笔记本',
          parameters: [
            {
              name: 'name',
              type: 'string',
              required: true,
              description: '笔记本名称'
            }
          ],
          examples: [
            {
              title: '创建笔记本',
              description: '创建一个名为"新笔记本"的笔记本',
              method: 'POST',
              endpoint: '/api/notebook/createNotebook',
              body: {
                name: '新笔记本名称'
              },
              response: {
                code: 0,
                data: {
                  notebook: {
                    id: '20220126215949-r1wvoch',
                    name: '新笔记本名称',
                    icon: '',
                    sort: 0,
                    closed: false
                  }
                }
              }
            }
          ]
        },
        {
          id: 'openNotebook',
          name: '打开笔记本',
          method: 'POST',
          endpoint: '/api/notebook/openNotebook',
          description: '打开已关闭的笔记本',
          parameters: [
            {
              name: 'notebook',
              type: 'string',
              required: true,
              description: '笔记本ID'
            }
          ],
          examples: [
            {
              title: '打开笔记本',
              description: '通过ID打开笔记本',
              method: 'POST',
              endpoint: '/api/notebook/openNotebook',
              body: {
                notebook: '20210817205410-2kvfpfn'
              }
            }
          ]
        },
        {
          id: 'closeNotebook',
          name: '关闭笔记本',
          method: 'POST',
          endpoint: '/api/notebook/closeNotebook',
          description: '关闭指定的笔记本',
          parameters: [
            {
              name: 'notebook',
              type: 'string',
              required: true,
              description: '笔记本ID'
            }
          ],
          examples: [
            {
              title: '关闭笔记本',
              description: '通过ID关闭笔记本',
              method: 'POST',
              endpoint: '/api/notebook/closeNotebook',
              body: {
                notebook: '20210817205410-2kvfpfn'
              }
            }
          ]
        }
      ]
    },
    {
      id: 'document',
      title: '📄 文档操作',
      description: '文档的创建、重命名、删除等操作',
      endpoints: [
        {
          id: 'createDocWithMd',
          name: '创建文档',
          method: 'POST',
          endpoint: '/api/filetree/createDocWithMd',
          description: '通过 Markdown 内容创建新文档',
          parameters: [
            {
              name: 'notebook',
              type: 'string',
              required: true,
              description: '笔记本ID'
            },
            {
              name: 'path',
              type: 'string',
              required: true,
              description: '文档路径'
            },
            {
              name: 'markdown',
              type: 'string',
              required: true,
              description: 'Markdown 内容'
            }
          ],
          examples: [
            {
              title: '创建文档',
              description: '创建一个包含 Markdown 内容的新文档',
              method: 'POST',
              endpoint: '/api/filetree/createDocWithMd',
              body: {
                notebook: '20210817205410-2kvfpfn',
                path: '/新文档',
                markdown: '# 文档标题\n\n内容...'
              },
              response: {
                code: 0,
                data: '20210914223645-oj2vnx2'
              }
            }
          ]
        },
        {
          id: 'renameDocByID',
          name: '重命名文档',
          method: 'POST',
          endpoint: '/api/filetree/renameDocByID',
          description: '通过 ID 重命名文档',
          parameters: [
            {
              name: 'id',
              type: 'string',
              required: true,
              description: '文档ID'
            },
            {
              name: 'title',
              type: 'string',
              required: true,
              description: '新标题'
            }
          ],
          examples: [
            {
              title: '重命名文档',
              description: '修改文档标题',
              method: 'POST',
              endpoint: '/api/filetree/renameDocByID',
              body: {
                id: '20210914223645-oj2vnx2',
                title: '新标题'
              }
            }
          ]
        },
        {
          id: 'removeDocByID',
          name: '删除文档',
          method: 'POST',
          endpoint: '/api/filetree/removeDocByID',
          description: '通过 ID 删除文档',
          parameters: [
            {
              name: 'id',
              type: 'string',
              required: true,
              description: '文档ID'
            }
          ],
          examples: [
            {
              title: '删除文档',
              description: '删除指定的文档',
              method: 'POST',
              endpoint: '/api/filetree/removeDocByID',
              body: {
                id: '20210914223645-oj2vnx2'
              }
            }
          ]
        }
      ]
    },
    {
      id: 'block',
      title: '🧱 块操作',
      description: '块的插入、更新、删除、移动等操作',
      endpoints: [
        {
          id: 'insertBlock',
          name: '插入块',
          method: 'POST',
          endpoint: '/api/block/insertBlock',
          description: '在指定位置插入新块',
          parameters: [
            {
              name: 'dataType',
              type: 'string',
              required: true,
              description: '数据类型，如 markdown'
            },
            {
              name: 'data',
              type: 'string',
              required: true,
              description: '插入的内容'
            },
            {
              name: 'previousID',
              type: 'string',
              required: false,
              description: '前一块ID'
            },
            {
              name: 'parentID',
              type: 'string',
              required: false,
              description: '父块ID'
            }
          ],
          examples: [
            {
              title: '插入块',
              description: '在当前块后插入新内容',
              method: 'POST',
              endpoint: '/api/block/insertBlock',
              body: {
                dataType: 'markdown',
                data: '插入的内容',
                previousID: '前一块ID',
                parentID: '父块ID'
              }
            }
          ]
        },
        {
          id: 'updateBlock',
          name: '更新块',
          method: 'POST',
          endpoint: '/api/block/updateBlock',
          description: '更新指定块的内容',
          parameters: [
            {
              name: 'id',
              type: 'string',
              required: true,
              description: '块ID'
            },
            {
              name: 'dataType',
              type: 'string',
              required: true,
              description: '数据类型，如 markdown'
            },
            {
              name: 'data',
              type: 'string',
              required: true,
              description: '新内容'
            }
          ],
          examples: [
            {
              title: '更新块',
              description: '修改指定块的内容',
              method: 'POST',
              endpoint: '/api/block/updateBlock',
              body: {
                id: '块ID',
                dataType: 'markdown',
                data: '新内容'
              }
            }
          ]
        },
        {
          id: 'deleteBlock',
          name: '删除块',
          method: 'POST',
          endpoint: '/api/block/deleteBlock',
          description: '删除指定的块',
          parameters: [
            {
              name: 'id',
              type: 'string',
              required: true,
              description: '块ID'
            }
          ],
          examples: [
            {
              title: '删除块',
              description: '删除指定的块',
              method: 'POST',
              endpoint: '/api/block/deleteBlock',
              body: {
                id: '块ID'
              }
            }
          ]
        },
        {
          id: 'moveBlock',
          name: '移动块',
          method: 'POST',
          endpoint: '/api/block/moveBlock',
          description: '移动块到新位置',
          parameters: [
            {
              name: 'id',
              type: 'string',
              required: true,
              description: '待移动块ID'
            },
            {
              name: 'previousID',
              type: 'string',
              required: false,
              description: '前一块ID'
            },
            {
              name: 'parentID',
              type: 'string',
              required: false,
              description: '父块ID'
            }
          ],
          examples: [
            {
              title: '移动块',
              description: '将块移动到新位置',
              method: 'POST',
              endpoint: '/api/block/moveBlock',
              body: {
                id: '待移动块ID',
                previousID: '前一块ID',
                parentID: '父块ID'
              }
            }
          ]
        }
      ]
    },
    {
      id: 'attribute',
      title: '🏷️ 属性操作',
      description: '块的属性设置和获取',
      endpoints: [
        {
          id: 'setBlockAttrs',
          name: '设置块属性',
          method: 'POST',
          endpoint: '/api/attr/setBlockAttrs',
          description: '为块设置自定义属性',
          parameters: [
            {
              name: 'id',
              type: 'string',
              required: true,
              description: '块ID'
            },
            {
              name: 'attrs',
              type: 'object',
              required: true,
              description: '属性对象'
            }
          ],
          examples: [
            {
              title: '设置属性',
              description: '为块设置自定义属性',
              method: 'POST',
              endpoint: '/api/attr/setBlockAttrs',
              body: {
                id: '块ID',
                attrs: {
                  'custom-attr1': '值'
                }
              }
            }
          ]
        },
        {
          id: 'getBlockAttrs',
          name: '获取块属性',
          method: 'POST',
          endpoint: '/api/attr/getBlockAttrs',
          description: '获取块的所有属性',
          parameters: [
            {
              name: 'id',
              type: 'string',
              required: true,
              description: '块ID'
            }
          ],
          examples: [
            {
              title: '获取属性',
              description: '获取块的所有属性',
              method: 'POST',
              endpoint: '/api/attr/getBlockAttrs',
              body: {
                id: '块ID'
              },
              response: {
                code: 0,
                data: {
                  'custom-attr1': '值',
                  id: '20210912214605-uhi5gco',
                  title: 'PDF 标注双链演示',
                  type: 'doc',
                  updated: '20210916120715'
                }
              }
            }
          ]
        }
      ]
    },
    {
      id: 'sql',
      title: '🔍 SQL查询',
      description: '执行SQL语句查询数据库',
      endpoints: [
        {
          id: 'querySql',
          name: '执行SQL查询',
          method: 'POST',
          endpoint: '/api/query/sql',
          description: '执行SQL语句查询数据库',
          parameters: [
            {
              name: 'stmt',
              type: 'string',
              required: true,
              description: 'SQL语句'
            }
          ],
          examples: [
            {
              title: '查询标题',
              description: '查询所有一级标题',
              method: 'POST',
              endpoint: '/api/query/sql',
              body: {
                stmt: "SELECT * FROM blocks WHERE type = 'h1' LIMIT 10"
              },
              response: {
                code: 0,
                data: [
                  { 列: '值' }
                ]
              }
            }
          ]
        }
      ]
    },
    {
      id: 'file',
      title: '📁 文件操作',
      description: '工作空间中的文件读写操作',
      endpoints: [
        {
          id: 'getFile',
          name: '获取文件',
          method: 'POST',
          endpoint: '/api/file/getFile',
          description: '读取工作空间中的文件',
          parameters: [
            {
              name: 'path',
              type: 'string',
              required: true,
              description: '工作空间路径下的文件路径'
            }
          ],
          examples: [
            {
              title: '读取文件',
              description: '读取图片文件',
              method: 'POST',
              endpoint: '/api/file/getFile',
              body: {
                path: '/data/assets/example.png'
              }
            }
          ]
        },
        {
          id: 'putFile',
          name: '写入文件',
          method: 'POST',
          endpoint: '/api/file/putFile',
          description: '将文件写入工作空间',
          parameters: [
            {
              name: 'path',
              type: 'string',
              required: true,
              description: '工作空间路径下的文件路径'
            },
            {
              name: 'file',
              type: 'file',
              required: true,
              description: '文件数据（multipart/form-data）'
            }
          ],
          examples: [
            {
              title: '上传文件',
              description: '上传图片到资源文件夹',
              method: 'POST',
              endpoint: '/api/file/putFile',
              body: 'multipart/form-data'
            }
          ]
        }
      ]
    },
    {
      id: 'notification',
      title: '🔔 通知',
      description: '显示通知消息和错误提示',
      endpoints: [
        {
          id: 'pushMsg',
          name: '推送消息',
          method: 'POST',
          endpoint: '/api/notification/pushMsg',
          description: '显示通知消息',
          parameters: [
            {
              name: 'msg',
              type: 'string',
              required: true,
              description: '消息内容'
            },
            {
              name: 'timeout',
              type: 'number',
              required: false,
              description: '显示时长（毫秒）'
            }
          ],
          examples: [
            {
              title: '显示成功消息',
              description: '显示操作成功的提示',
              method: 'POST',
              endpoint: '/api/notification/pushMsg',
              body: {
                msg: '操作成功完成',
                timeout: 3000
              },
              response: {
                code: 0,
                data: {
                  id: '62jtmqi'
                }
              }
            }
          ]
        },
        {
          id: 'pushErrMsg',
          name: '推送错误消息',
          method: 'POST',
          endpoint: '/api/notification/pushErrMsg',
          description: '显示错误通知',
          parameters: [
            {
              name: 'msg',
              type: 'string',
              required: true,
              description: '错误消息'
            },
            {
              name: 'timeout',
              type: 'number',
              required: false,
              description: '显示时长（毫秒）'
            }
          ],
          examples: [
            {
              title: '显示错误消息',
              description: '显示操作失败的错误提示',
              method: 'POST',
              endpoint: '/api/notification/pushErrMsg',
              body: {
                msg: '操作失败',
                timeout: 5000
              },
              response: {
                code: 0,
                data: {
                  id: 'qc9znut'
                }
              }
            }
          ]
        }
      ]
    },
    {
      id: 'system',
      title: '⚙️ 系统',
      description: '系统信息和状态查询',
      endpoints: [
        {
          id: 'version',
          name: '获取系统版本',
          method: 'GET',
          endpoint: '/api/system/version',
          description: '获取思源笔记版本号',
          examples: [
            {
              title: '获取版本',
              description: '获取当前思源笔记版本',
              method: 'GET',
              endpoint: '/api/system/version',
              response: {
                code: 0,
                data: '1.3.5'
              }
            }
          ]
        },
        {
          id: 'currentTime',
          name: '获取当前时间',
          method: 'GET',
          endpoint: '/api/system/currentTime',
          description: '获取系统当前时间（毫秒）',
          examples: [
            {
              title: '获取时间戳',
              description: '获取当前时间戳',
              method: 'GET',
              endpoint: '/api/system/currentTime',
              response: {
                code: 0,
                data: 1631850968131
              }
            }
          ]
        },
        {
          id: 'bootProgress',
          name: '获取启动进度',
          method: 'GET',
          endpoint: '/api/system/bootProgress',
          description: '获取系统启动进度',
          examples: [
            {
              title: '获取启动进度',
              description: '检查系统启动状态',
              method: 'GET',
              endpoint: '/api/system/bootProgress',
              response: {
                code: 0,
                data: {
                  details: 'Finishing boot...',
                  progress: 100
                }
              }
            }
          ]
        }
      ]
    }
  ]
}
