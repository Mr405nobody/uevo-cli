/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIProvider } from './aiProvider.js';

// 重新导出AIProvider以便其他模块使用
export { AIProvider };

/**
 * 模型名称到提供商的映射（仅保留 Gemini）
 */
export const MODEL_PROVIDER_MAPPING: Record<string, AIProvider> = {
  'gemini-1.5-pro': AIProvider.GEMINI,
  'gemini-1.5-flash': AIProvider.GEMINI,
  'gemini-1.5-pro-002': AIProvider.GEMINI,
  'gemini-1.5-flash-002': AIProvider.GEMINI,
  'gemini-2.0-flash-exp': AIProvider.GEMINI,
  'gemini-2.5-pro': AIProvider.GEMINI,
  'gemini-pro': AIProvider.GEMINI,
  'gemini-pro-vision': AIProvider.GEMINI,
};

/**
 * 根据模型名称获取对应的AI提供商
 * @param modelName 模型名称
 * @returns AI提供商，如果未找到映射则返回GEMINI作为默认值
 */
export function getProviderForModel(_modelName: string): AIProvider {
  return AIProvider.GEMINI;
}

/**
 * 获取指定提供商的环境变量名称
 * @param provider AI提供商
 * @returns 环境变量名称
 */
export function getEnvVarForProvider(provider: AIProvider): string {
  if (provider !== AIProvider.GEMINI) {
    return 'GEMINI_API_KEY';
  }
  return 'GEMINI_API_KEY';
}

/**
 * 检查指定提供商的API密钥是否已配置
 * @param provider AI提供商
 * @returns 是否已配置API密钥
 */
export function isProviderConfigured(provider: AIProvider): boolean {
  if (provider !== AIProvider.GEMINI) {
    return false;
  }
  return !!process.env.GEMINI_API_KEY;
}

/**
 * 获取模型的推荐配置信息
 * @param modelName 模型名称
 * @returns 配置信息对象
 */
export function getModelInfo(modelName: string): {
  provider: AIProvider;
  envVar: string;
  isConfigured: boolean;
  providerName: string;
} {
  const provider = getProviderForModel(modelName);
  const envVar = getEnvVarForProvider(provider);
  const isConfigured = isProviderConfigured(provider);

  return {
    provider,
    envVar,
    isConfigured,
    providerName: 'Google Gemini',
  };
}
