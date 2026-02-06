/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SlashCommand,
  SlashCommandActionReturn,
  CommandContext,
  CommandKind,
} from './types.js';

const COLOR_GREEN = '\u001b[32m';
const COLOR_YELLOW = '\u001b[33m';
const COLOR_RED = '\u001b[31m';
const COLOR_CYAN = '\u001b[36m';
const COLOR_GREY = '\u001b[90m';
const RESET_COLOR = '\u001b[0m';

/**
 * 按提供商分组的模型列表
 */
const MODEL_GROUPS = {
  gemini: {
    name: 'Gemini',
    envVar: 'GEMINI_API_KEY',
    models: [
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.0-pro',
      'gemini-pro-vision',
      'gemini-2.0-flash-exp',
      'gemini-2.5-pro',
    ],
  },
};

/**
 * 获取所有可用模型的平面列表
 */
function getAllModels(): string[] {
  const allModels: string[] = [];
  for (const group of Object.values(MODEL_GROUPS)) {
    allModels.push(...group.models);
  }
  return allModels;
}

/**
 * 显示当前模型
 */
const showCurrentModel = async (context: CommandContext): Promise<SlashCommandActionReturn> => {
  const { config } = context.services;
  if (!config) {
    return {
      type: 'message',
      messageType: 'error',
      content: 'Configuration not available.',
    };
  }

  const currentModel = config.getModel();
  const contentGeneratorConfig = config.getContentGeneratorConfig();

  let message = `${COLOR_CYAN}Current Model Configuration${RESET_COLOR}\n\n`;
  
  if (currentModel) {
    const providerGroup = Object.entries(MODEL_GROUPS).find(([_, group]) =>
      group.models.includes(currentModel),
    );
    const providerName = providerGroup?.[1].name ?? 'Gemini';

    message += `${COLOR_CYAN}Active Model:${RESET_COLOR} ${COLOR_GREEN}${currentModel}${RESET_COLOR}\n`;
    message += `${COLOR_CYAN}Provider:${RESET_COLOR} ${COLOR_GREEN}${providerName}${RESET_COLOR}\n`;
    message += `${COLOR_CYAN}Auth Type:${RESET_COLOR} ${COLOR_GREEN}${contentGeneratorConfig?.authType || 'Not set'}${RESET_COLOR}\n`;
    
    if (providerGroup) {
      const [, group] = providerGroup;
      const apiKey = process.env[group.envVar];
      const keyStatus = apiKey ? 
        `${COLOR_GREEN}✓ Configured${RESET_COLOR}` : 
        `${COLOR_RED}✗ Not configured${RESET_COLOR}`;
      message += `${COLOR_CYAN}API Key:${RESET_COLOR} ${keyStatus}\n`;
    }
  } else {
    message += `${COLOR_YELLOW}⚠ No model currently set${RESET_COLOR}\n`;
    message += `Use '/model set <model-name>' to set a model\n`;
  }

  message += `\n${COLOR_GREY}Use '/model list' to see all available models${RESET_COLOR}`;

  return {
    type: 'message',
    messageType: 'info',
    content: message,
  };
};

/**
 * 设置模型
 */
const setModel = async (
  context: CommandContext,
  args: string
): Promise<SlashCommandActionReturn> => {
  const { config } = context.services;
  if (!config) {
    return {
      type: 'message',
      messageType: 'error',
      content: 'Configuration not available.',
    };
  }

  const modelName = args.trim();
  if (!modelName) {
    return {
      type: 'message',
      messageType: 'error',
      content: 'Please specify a model name. Use "/model list" to see available models.',
    };
  }

  // 检查模型是否存在
  const allModels = getAllModels();
  if (!allModels.includes(modelName)) {
    return {
      type: 'message',
      messageType: 'error',
      content: `Unknown model: ${modelName}. Use "/model list" to see available models.`,
    };
  }

  // 检查对应的 API 密钥是否配置
  const providerGroup = Object.entries(MODEL_GROUPS).find(([key, group]) => 
    group.models.includes(modelName)
  );

  if (providerGroup) {
    const [providerKey, group] = providerGroup;
    const apiKey = process.env[group.envVar];
    
    if (!apiKey) {
      return {
        type: 'message',
        messageType: 'error',
        content: `${COLOR_YELLOW}⚠ Warning:${RESET_COLOR} Model "${modelName}" requires ${group.name} API key (${group.envVar}) which is not configured.\n\nUse '/api config ${providerKey}' for setup instructions.\n\nModel has been set but may not work without proper API configuration.`,
      };
    }
  }

  try {
    // 设置模型
    config.setModel(modelName);
    
    let message = `${COLOR_GREEN}✓ Model successfully set to: ${modelName}${RESET_COLOR}\n\n`;
    
    if (providerGroup) {
      const [, group] = providerGroup;
      message += `${COLOR_CYAN}Provider:${RESET_COLOR} ${group.name}\n`;
      message += `${COLOR_CYAN}API Key:${RESET_COLOR} ${COLOR_GREEN}✓ Configured${RESET_COLOR}\n`;
    }
    
    message += `\n${COLOR_GREY}The model is now active and ready to use.${RESET_COLOR}`;

    return {
      type: 'message',
      messageType: 'info',
      content: message,
    };
  } catch (error) {
    return {
      type: 'message',
      messageType: 'error',
      content: `Failed to set model: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

/**
 * 列出所有可用模型
 */
const listModels = async (
  context: CommandContext,
  args: string
): Promise<SlashCommandActionReturn> => {
  const providerFilter = args.trim().toLowerCase();

  let message = `${COLOR_CYAN}Available Models${RESET_COLOR}\n\n`;

  for (const [providerKey, group] of Object.entries(MODEL_GROUPS)) {
    // 如果指定了提供商过滤器，只显示该提供商的模型
    if (providerFilter && providerKey !== providerFilter) {
      continue;
    }

    const apiKey = process.env[group.envVar];
    const status = apiKey ? `${COLOR_GREEN}✓${RESET_COLOR}` : `${COLOR_RED}✗${RESET_COLOR}`;
    
    message += `${status} ${COLOR_CYAN}${group.name}${RESET_COLOR} (${group.envVar})\n`;
    
    for (const model of group.models) {
      message += `    ${model}\n`;
    }
    message += '\n';
  }

  if (providerFilter && !MODEL_GROUPS[providerFilter as keyof typeof MODEL_GROUPS]) {
    return {
      type: 'message',
      messageType: 'error',
      content: `Unknown provider: ${providerFilter}. Available providers: ${Object.keys(MODEL_GROUPS).join(', ')}`,
    };
  }

  message += `${COLOR_GREY}Legend: ${COLOR_GREEN}✓${RESET_COLOR} API configured, ${COLOR_RED}✗${RESET_COLOR} API not configured\n`;
  message += `Use '/model set <model-name>' to switch to a specific model\n`;
  message += `Use '/api config <provider>' for API setup instructions${RESET_COLOR}`;

  return {
    type: 'message',
    messageType: 'info',
    content: message,
  };
};

/**
 * 搜索模型
 */
const searchModels = async (
  context: CommandContext,
  args: string
): Promise<SlashCommandActionReturn> => {
  const searchTerm = args.trim().toLowerCase();
  
  if (!searchTerm) {
    return {
      type: 'message',
      messageType: 'error',
      content: 'Please provide a search term.',
    };
  }

  const allModels = getAllModels();
  const matchingModels = allModels.filter(model => 
    model.toLowerCase().includes(searchTerm)
  );

  if (matchingModels.length === 0) {
    return {
      type: 'message',
      messageType: 'info',
      content: `No models found matching "${searchTerm}". Use '/model list' to see all available models.`,
    };
  }

  let message = `${COLOR_CYAN}Models matching "${searchTerm}"${RESET_COLOR}\n\n`;

  for (const model of matchingModels) {
    const providerGroup = Object.entries(MODEL_GROUPS).find(([key, group]) => 
      group.models.includes(model)
    );
    
    if (providerGroup) {
      const [, group] = providerGroup;
      const apiKey = process.env[group.envVar];
      const status = apiKey ? `${COLOR_GREEN}✓${RESET_COLOR}` : `${COLOR_RED}✗${RESET_COLOR}`;
      message += `${status} ${model} (${group.name})\n`;
    } else {
      message += `  ${model}\n`;
    }
  }

  message += `\n${COLOR_GREY}Found ${matchingModels.length} matching model(s)${RESET_COLOR}`;

  return {
    type: 'message',
    messageType: 'info',
    content: message,
  };
};

/**
 * 主要的模型命令
 */
export const modelCommand: SlashCommand = {
  name: 'model',
  description: 'Manage and switch between AI models',
  kind: CommandKind.BUILT_IN,
  action: showCurrentModel,
  subCommands: [
    {
      name: 'current',
      altNames: ['show', 'status'],
      description: 'Show current active model',
      kind: CommandKind.BUILT_IN,
      action: showCurrentModel,
    },
    {
      name: 'set',
      altNames: ['use', 'switch'],
      description: 'Set the active model',
      kind: CommandKind.BUILT_IN,
      action: setModel,
    },
    {
      name: 'list',
      altNames: ['ls', 'all'],
      description: 'List all available models (optionally filter by provider)',
      kind: CommandKind.BUILT_IN,
      action: listModels,
    },
    {
      name: 'search',
      altNames: ['find'],
      description: 'Search for models by name',
      kind: CommandKind.BUILT_IN,
      action: searchModels,
    },
  ],
};
