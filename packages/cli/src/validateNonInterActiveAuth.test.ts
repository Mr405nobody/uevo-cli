/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateNonInteractiveAuth,
  NonInteractiveConfig,
} from './validateNonInterActiveAuth.js';
import { AuthType } from '@uevo/uevo-cli-core';

describe('validateNonInterActiveAuth', () => {
  let originalEnvGeminiApiKey: string | undefined;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let processExitSpy: ReturnType<typeof vi.spyOn>;
  let refreshAuthMock: jest.MockedFunction<
    (authType: AuthType) => Promise<unknown>
  >;

  beforeEach(() => {
    originalEnvGeminiApiKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    processExitSpy = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit(${code}) called`);
    });
    refreshAuthMock = vi.fn().mockResolvedValue('refreshed');
  });

  afterEach(() => {
    if (originalEnvGeminiApiKey !== undefined) {
      process.env.GEMINI_API_KEY = originalEnvGeminiApiKey;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
    vi.restoreAllMocks();
  });

  it('exits if no auth type is configured or env vars set', async () => {
    const nonInteractiveConfig: NonInteractiveConfig = {
      refreshAuth: refreshAuthMock,
    };
    try {
      await validateNonInteractiveAuth(undefined, nonInteractiveConfig);
      expect.fail('Should have exited');
    } catch (e) {
      expect((e as Error).message).toContain('process.exit(1) called');
    }
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Please set an Auth method'),
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('uses USE_GEMINI if GEMINI_API_KEY is set', async () => {
    process.env.GEMINI_API_KEY = 'fake-key';
    const nonInteractiveConfig: NonInteractiveConfig = {
      refreshAuth: refreshAuthMock,
    };
    await validateNonInteractiveAuth(undefined, nonInteractiveConfig);
    expect(refreshAuthMock).toHaveBeenCalledWith(AuthType.USE_GEMINI);
  });

  it('uses configuredAuthType if provided', async () => {
    // Set required env var for USE_GEMINI
    process.env.GEMINI_API_KEY = 'fake-key';
    const nonInteractiveConfig: NonInteractiveConfig = {
      refreshAuth: refreshAuthMock,
    };
    await validateNonInteractiveAuth(AuthType.USE_GEMINI, nonInteractiveConfig);
    expect(refreshAuthMock).toHaveBeenCalledWith(AuthType.USE_GEMINI);
  });

  it('exits if validateAuthMethod returns error', async () => {
    // Mock validateAuthMethod to return error
    const mod = await import('./config/auth.js');
    vi.spyOn(mod, 'validateAuthMethod').mockReturnValue('Auth error!');
    const nonInteractiveConfig: NonInteractiveConfig = {
      refreshAuth: refreshAuthMock,
    };
    try {
      await validateNonInteractiveAuth(
        AuthType.USE_GEMINI,
        nonInteractiveConfig,
      );
      expect.fail('Should have exited');
    } catch (e) {
      expect((e as Error).message).toContain('process.exit(1) called');
    }
    expect(consoleErrorSpy).toHaveBeenCalledWith('Auth error!');
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
