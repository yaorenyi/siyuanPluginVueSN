/**
 * 谐音翻译功能模块
 * 使用通义大模型API生成英语单词的谐音记忆
 */
import { Plugin, showMessage } from 'siyuan';
import { createApp, h } from 'vue';
// @ts-ignore
import PronunciationPanel from './PronunciationPanel.vue';

/**
 * 谐音翻译类
 */
export class Pronunciation {
  private plugin: Plugin;
  private currentProvider: string = 'tongyi';
  private currentModel: string = 'qwen-plus';
  private apiKey: string = '';
  private customApiEndpoint: string = '';

  constructor(plugin: Plugin) {
    this.plugin = plugin;
    // 从插件配置中初始化API配置
    const settings = (plugin as any).settings;
    this.currentProvider = settings.aiApiProvider || 'tongyi';
    this.currentModel = settings.aiModel || 'qwen-plus';
    this.apiKey = settings.aiApiKey || 'sk-fae27cc50015409fb2524b0970d3f0b0';
    this.customApiEndpoint = settings.aiCustomEndpoint || '';
  }

  /**
   * 更新API配置（由超级面板调用）
   */
  public updateApiConfig(provider: string, model: string, apiKey: string, customEndpoint: string) {
    this.currentProvider = provider;
    this.currentModel = model;
    this.apiKey = apiKey;
    this.customApiEndpoint = customEndpoint;
    console.log('Pronunciation API配置已更新:', { provider, model, customEndpoint });
  }

  /**
   * 获取API Key
   */
  private getApiKey(): string {
    return this.apiKey || 'sk-fae27cc50015409fb2524b0970d3f0b0';
  }

  /**
   * 初始化谐音翻译功能
   */
  public init() {
    this.addDock();
    this.registerContextMenu();
    this.registerCommands();
    console.log('谐音翻译模块已初始化');
  }

  /**
   * 添加谐音翻译 Dock 到右侧边栏
   */
  private addDock() {
    const self = this;
    this.plugin.addDock({
      config: {
        position: 'RightTop',
        size: { width: 360, height: 0 },
        icon: 'iconVolumeUp',
        title: this.plugin.i18n.pronunciation || '谐音翻译',
        show: false,
      },
      data: {},
      type: 'pronunciation-dock',
      init: (dock: any) => {
        const container = document.createElement('div');
        container.style.height = '100%';
        container.style.overflow = 'hidden';

        const app = createApp({
          setup() {
            return () => h(PronunciationPanel, {
              i18n: self.plugin.i18n,
              onGenerate: async (word: string) => {
                return await self.generatePronunciation(word);
              }
            });
          }
        });

        app.mount(container);
        dock.element?.appendChild(container);

        dock.__app = app;
        dock.__container = container;
      },
    });
  }

  /**
   * 注册右键菜单
   */
  private registerContextMenu() {
    this.plugin.eventBus.on('open-menu-content', this.handleEditorContextMenu);
  }

  /**
   * 注册快捷键命令
   */
  private registerCommands() {
    this.plugin.addCommand({
      langKey: 'pronunciationHelp',
      hotkey: '⇧⌘H',
      editorCallback: () => {
        const selectedText = window.getSelection()?.toString().trim();
        if (selectedText) {
          this.generatePronunciation(selectedText);
        } else {
          showMessage(this.plugin.i18n.noTextSelected || '请选择文本', 3000, 'error');
        }
      },
    });
  }

  /**
   * 处理编辑器右键菜单事件
   */
  private handleEditorContextMenu = async ({ detail }: any) => {
    const menu = detail.menu;
    const selectedText = window.getSelection()?.toString().trim();

    if (selectedText && this.isEnglishWord(selectedText)) {
      menu.addItem({
        iconHTML: '🔊',
        label: this.plugin.i18n.pronunciationHelp || '谐音翻译',
        click: async () => {
          await this.generatePronunciation(selectedText);
        },
      });
    }
  };

  /**
   * 检测是否为英文单词
   */
  private isEnglishWord(text: string): boolean {
    return /^[a-zA-Z\s-]+$/.test(text);
  }

  /**
   * 生成谐音翻译
   */
  public async generatePronunciation(word: string): Promise<string> {
    if (!word) {
      showMessage(this.plugin.i18n.noTextSelected || '请输入单词', 3000, 'error');
      return '';
    }

    if (!this.isEnglishWord(word)) {
      showMessage('请选择英文单词', 3000, 'error');
      return '';
    }

    showMessage('🔊 正在生成谐音翻译...', 2000, 'info');

    try {
      const prompt = this.buildPrompt(word);
      const response = await this.callAPI(prompt);

      if (response) {
        await this.insertToDocument(response);
        showMessage('✓ 谐音翻译已生成', 2000, 'info');
        return response;
      } else {
        showMessage('生成失败，请重试', 3000, 'error');
        return '';
      }
    } catch (error) {
      console.error('Pronunciation generation error:', error);
      const errorMsg = (error as Error).message || '未知错误';
      showMessage('🚫 生成失败: ' + errorMsg, 5000, 'error');
      return '';
    }
  }

  /**
   * 构建提示词
   */
  private buildPrompt(word: string): string {
    return `请为英文单词 "${word}" 生成谐音记忆，要求：

1. 使用英式标准发音
2. 谐音使用带声调的拼音标注
3. 严格按照以下格式输出：

#### ${word}

单词：${word}
音标：[英式音标]
释义：[中文释义]
谐音：[中文谐音(使用英式自然发音,带拼音标注),如:西斯腾(xī sī téng)]
发音：[发音要点说明]

注意事项：
- 音标必须是英式音标
- 谐音要贴近实际发音，便于记忆
- 拼音必须带声调
- 发音说明要包含音节、重音、元音特点等
- 只输出格式化内容，不要有其他说明文字`;
  }

  /**
   * 调用API
   */
  private async callAPI(prompt: string): Promise<string> {
    switch (this.currentProvider) {
      case 'tongyi':
        return await this.callTongyiAPI(prompt);
      case 'openai':
        return await this.callOpenAIAPI(prompt);
      case 'deepseek':
        return await this.callDeepSeekAPI(prompt);
      case 'custom':
        return await this.callCustomAPI(prompt);
      default:
        throw new Error(`不支持的API供应商: ${this.currentProvider}`);
    }
  }

  /**
   * 调用通义千问API
   */
  private async callTongyiAPI(prompt: string): Promise<string> {
    const apiKey = this.getApiKey();
    const apiUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
    
    const requestBody = {
      model: this.currentModel || 'qwen-plus',
      input: {
        messages: [
          {
            role: 'system',
            content: '你是一个专业的英语发音教学助手，擅长用中文谐音帮助学习者记忆英语单词发音。'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      parameters: {
        temperature: 0.7,
        top_p: 0.8,
        max_tokens: 800
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API请求失败: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    if (data.output && data.output.text) {
      return data.output.text;
    } else if (data.output && data.output.choices && data.output.choices.length > 0) {
      return data.output.choices[0].message.content;
    } else if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    } else if (data.text) {
      return data.text;
    } else if (data.content) {
      return data.content;
    } else {
      throw new Error(`API返回数据格式错误，响应结构: ${JSON.stringify(Object.keys(data))}`);
    }
  }

  /**
   * 调用OpenAI API
   */
  private async callOpenAIAPI(prompt: string): Promise<string> {
    const apiKey = this.getApiKey();
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    
    const requestBody = {
      model: this.currentModel || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的英语发音教学助手，擅长用中文谐音帮助学习者记忆英语单词发音。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API请求失败: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    } else {
      throw new Error('OpenAI API返回数据格式错误');
    }
  }

  /**
   * 调用DeepSeek API
   */
  private async callDeepSeekAPI(prompt: string): Promise<string> {
    const apiKey = this.getApiKey();
    const apiUrl = 'https://api.deepseek.com/v1/chat/completions';
    
    const requestBody = {
      model: this.currentModel || 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的英语发音教学助手，擅长用中文谐音帮助学习者记忆英语单词发音。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API请求失败: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    } else {
      throw new Error('DeepSeek API返回数据格式错误');
    }
  }

  /**
   * 调用自定义API
   */
  private async callCustomAPI(prompt: string): Promise<string> {
    const apiKey = this.getApiKey();
    const apiUrl = this.customApiEndpoint;

    if (!apiUrl) {
      throw new Error('自定义API端点未设置');
    }

    const requestBody = {
      model: this.currentModel || 'default',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的英语发音教学助手，擅长用中文谐音帮助学习者记忆英语单词发音。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`自定义API请求失败: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    } else if (data.output && data.output.text) {
      return data.output.text;
    } else if (data.text) {
      return data.text;
    } else if (data.content) {
      return data.content;
    } else {
      throw new Error('自定义API返回数据格式错误');
    }
  }

  /**
   * 将生成的内容插入到文档中
   */
  private async insertToDocument(content: string) {
    await navigator.clipboard.writeText(content);
    showMessage('📋 已复制到剪贴板\n\n' + content, 8000, 'info');
  }

  /**
   * 销毁功能
   */
  public destroy() {
    this.plugin.eventBus.off('open-menu-content', this.handleEditorContextMenu);
    console.log('谐音翻译模块已销毁');
  }
}

/**
 * 注册谐音翻译模块
 */
export function registerPronunciation(plugin: Plugin) {
  const pronunciation = new Pronunciation(plugin);
  pronunciation.init();

  // 保存实例到插件对象中
  (plugin as any).__pronunciation = pronunciation;

  console.log('谐音翻译模块已注册');
  return pronunciation;
}
