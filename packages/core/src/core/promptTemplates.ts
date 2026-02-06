/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIProvider } from './modelProviderMapping.js';
import { getCoreSystemPrompt } from './prompts.js';

/**
 * 提示词模板类型
 */
export interface PromptTemplate {
  name: string;
  description: string;
  provider: AIProvider;
  getSystemPrompt: (userMemory?: string, todoPrompt?: string) => string;
}

/**
 * 简化的提示词模板 - 仅按模型类别区分
 */
export const PROMPT_TEMPLATES: Record<string, PromptTemplate> = {
  // 通用模板（适用于其他所有模型）
  general_assistant: {
    name: '通用助手',
    description: '适用于通用模型的系统提示词',
    provider: AIProvider.GEMINI, // 默认提供者，代表通用
    getSystemPrompt: (userMemory?: string, todoPrompt?: string) => getCoreSystemPrompt(userMemory, todoPrompt),
  },
};

/**
 * 根据模型名称获取对应的提示词模板（简化版本）
 */
export function getRecommendedTemplate(modelName: string): PromptTemplate {
  return PROMPT_TEMPLATES.general_assistant;
}

/**
 * @deprecated 已弃用 - 改用简化的系统，不再支持任务特定模板
 * 使用 getRecommendedTemplate 替代
 */
export function getTaskSpecificTemplate(task: 'file_management' | 'coding' | 'general', modelName: string): PromptTemplate {
  console.warn('getTaskSpecificTemplate is deprecated. Use getRecommendedTemplate instead.');
  return getRecommendedTemplate(modelName);
}

/**
 * 简化的系统提示词选择器
 * 仅根据模型类型选择对应的提示词，不进行复杂的任务类型判断
 */
export function getSimpleSystemPrompt(
  modelName: string, 
  userMemory?: string,
  todoPrompt?: string
): string {
  const template = getRecommendedTemplate(modelName);
  return template.getSystemPrompt(userMemory, todoPrompt);
}

/**
 * 获取所有可用的提示词模板
 */
export function getAllTemplates(): PromptTemplate[] {
  return Object.values(PROMPT_TEMPLATES);
}

/**
 * 根据提供者筛选模板（简化版本）
 */
export function getTemplatesForProvider(provider: AIProvider): PromptTemplate[] {
  if (provider === AIProvider.GEMINI) {
    return [PROMPT_TEMPLATES.general_assistant];
  }
  return [];
}
