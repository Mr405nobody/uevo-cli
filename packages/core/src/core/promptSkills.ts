/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  getOperationalGuidelinesPrompt,
  getPrimaryWorkflowsPrompt,
  type WorkflowSkill,
} from './prompts.js';

export interface SkillRoutingResult {
  workflowSkills: WorkflowSkill[];
  includeOpsInteraction: boolean;
}

const workflowSePatterns: RegExp[] = [
  /\bbug\b/i,
  /\bfix\b/i,
  /\brefactor\b/i,
  /\btest\b/i,
  /\blint\b/i,
  /\btypecheck\b/i,
  /\bbuild\b/i,
  /\bcompile\b/i,
  /\boptimi[sz]e\b/i,
  /\berror\b/i,
  /\bexception\b/i,
  /\bstack\b/i,
  /\btrace\b/i,
  /\.(ts|tsx|js|jsx|py|go|rs|java|kt|swift|c|cc|cpp|cs)\b/i,
  /\bsrc\//i,
  /\bpackages\//i,
  /\btests?\//i,
  /代码/,
  /修复/,
  /重构/,
  /测试/,
  /构建/,
  /编译/,
  /报错/,
  /错误/,
  /异常/,
  /性能/,
];

const workflowNewAppPatterns: RegExp[] = [
  /\bnew app\b/i,
  /\bnew project\b/i,
  /\bfrom scratch\b/i,
  /\bscaffold\b/i,
  /\bbootstrap\b/i,
  /\bprototype\b/i,
  /\blanding page\b/i,
  /新项目/,
  /新应用/,
  /搭建/,
  /脚手架/,
  /原型/,
  /网站/,
];

const workflowToolDevPatterns: RegExp[] = [
  /\btool\b/i,
  /\bautomation\b/i,
  /\bscript\b/i,
  /\bworkflow\b/i,
  /\bpipeline\b/i,
  /\bcli\b/i,
  /工具/,
  /自动化/,
  /脚本/,
  /流水线/,
];

const interactionPatterns: RegExp[] = [
  /^\/help\b/i,
  /^\/bug\b/i,
  /帮助/,
  /反馈/,
];

function matchesAny(query: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(query));
}

export function routePromptSkills(query: string): SkillRoutingResult {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return { workflowSkills: [], includeOpsInteraction: false };
  }

  const workflowSkills: WorkflowSkill[] = [];
  if (matchesAny(normalizedQuery, workflowNewAppPatterns)) {
    workflowSkills.push('new_app');
  }
  if (matchesAny(normalizedQuery, workflowToolDevPatterns)) {
    workflowSkills.push('tool_dev');
  }
  if (matchesAny(normalizedQuery, workflowSePatterns)) {
    workflowSkills.push('software_engineering');
  }

  const includeOpsInteraction = matchesAny(normalizedQuery, interactionPatterns);

  return { workflowSkills, includeOpsInteraction };
}

export function buildSkillContext(options: {
  query: string;
  todoPrompt?: string;
}): string {
  const { query, todoPrompt } = options;
  const { workflowSkills, includeOpsInteraction } = routePromptSkills(query);
  const blocks: string[] = [];

  const workflowPrompt = getPrimaryWorkflowsPrompt(workflowSkills, true);
  if (workflowPrompt) blocks.push(workflowPrompt);

  if (includeOpsInteraction) {
    const interactionPrompt = getOperationalGuidelinesPrompt(
      ['interaction'],
      false,
    );
    if (interactionPrompt) blocks.push(interactionPrompt);
  }

  if (todoPrompt && todoPrompt.trim().length > 0) {
    blocks.push(todoPrompt.trim());
  }

  return blocks.join('\n\n');
}
