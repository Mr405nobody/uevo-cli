/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { getOauthClient } from './oauth2.js';
import { getCachedGoogleAccount } from '../utils/user_account.js';
import { OAuth2Client } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';
import http from 'http';
import open from 'open';
import crypto from 'crypto';
import * as os from 'os';
import { AuthType } from '../core/contentGenerator.js';
import { Config } from '../config/config.js';
import readline from 'node:readline';

vi.mock('os', async (importOriginal) => {
  const os = await importOriginal<typeof import('os')>();
  return {
    ...os,
    homedir: vi.fn(),
  };
});

vi.mock('google-auth-library');
vi.mock('http');
vi.mock('open');
vi.mock('crypto');
vi.mock('node:readline');
vi.mock('../utils/browser.js', () => ({
  shouldAttemptBrowserLaunch: () => true,
}));

const mockConfig = {
  getNoBrowser: () => false,
  getProxy: () => 'http://test.proxy.com:8080',
  isBrowserLaunchSuppressed: () => false,
} as unknown as Config;

// Mock fetch globally
global.fetch = vi.fn();

describe('oauth2', () => {
  let tempHomeDir: string;

  beforeEach(() => {
    tempHomeDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'uevo-cli-test-home-'),
    );
    (os.homedir as Mock).mockReturnValue(tempHomeDir);
  });
  afterEach(() => {
    fs.rmSync(tempHomeDir, { recursive: true, force: true });
    vi.clearAllMocks();
  });

  it('should perform a web login', async () => {
    const mockAuthUrl = 'https://example.com/auth';
    const mockCode = 'test-code';
    const mockState = 'test-state';
    const mockTokens = {
      access_token: 'test-access-token',
      refresh_token: 'test-refresh-token',
    };

    const mockGenerateAuthUrl = vi.fn().mockReturnValue(mockAuthUrl);
    const mockGetToken = vi.fn().mockResolvedValue({ tokens: mockTokens });
    const mockSetCredentials = vi.fn();
    const mockGetAccessToken = vi
      .fn()
      .mockResolvedValue({ token: 'mock-access-token' });
    const mockOAuth2Client = {
      generateAuthUrl: mockGenerateAuthUrl,
      getToken: mockGetToken,
      setCredentials: mockSetCredentials,
      getAccessToken: mockGetAccessToken,
      credentials: mockTokens,
      on: vi.fn(),
    } as unknown as OAuth2Client;
    (OAuth2Client as unknown as Mock).mockImplementation(
      () => mockOAuth2Client,
    );

    vi.spyOn(crypto, 'randomBytes').mockReturnValue(mockState as never);
    (open as Mock).mockImplementation(async () => ({ on: vi.fn() }) as never);

    // Mock the UserInfo API response
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: vi
        .fn()
        .mockResolvedValue({ email: 'test-google-account@gmail.com' }),
    } as unknown as Response);

    let requestCallback!: http.RequestListener<
      typeof http.IncomingMessage,
      typeof http.ServerResponse
    >;

    let serverListeningCallback: (value: unknown) => void;
    const serverListeningPromise = new Promise(
      (resolve) => (serverListeningCallback = resolve),
    );

    let capturedPort = 0;
    const mockHttpServer = {
      listen: vi.fn((port: number, _host: string, callback?: () => void) => {
        capturedPort = port;
        if (callback) {
          callback();
        }
        serverListeningCallback(undefined);
      }),
      close: vi.fn((callback?: () => void) => {
        if (callback) {
          callback();
        }
      }),
      on: vi.fn(),
      address: () => ({ port: capturedPort }),
    };
    (http.createServer as Mock).mockImplementation((cb) => {
      requestCallback = cb as http.RequestListener<
        typeof http.IncomingMessage,
        typeof http.ServerResponse
      >;
      return mockHttpServer as unknown as http.Server;
    });

    const clientPromise = getOauthClient(
      AuthType.LOGIN_WITH_GOOGLE,
      mockConfig,
    );

    // wait for server to start listening.
    await serverListeningPromise;

    const mockReq = {
      url: `/oauth2callback?code=${mockCode}&state=${mockState}`,
    } as http.IncomingMessage;
    const mockRes = {
      writeHead: vi.fn(),
      end: vi.fn(),
    } as unknown as http.ServerResponse;

    await requestCallback(mockReq, mockRes);

    const client = await clientPromise;
    expect(client).toBe(mockOAuth2Client);

    expect(open).toHaveBeenCalledWith(mockAuthUrl);
    expect(mockGetToken).toHaveBeenCalledWith({
      code: mockCode,
      redirect_uri: `http://localhost:${capturedPort}/oauth2callback`,
    });
    expect(mockSetCredentials).toHaveBeenCalledWith(mockTokens);

    // Verify Google Account was cached
    const googleAccountPath = path.join(
      tempHomeDir,
      '.gemini',
      'google_accounts.json',
    );
    expect(fs.existsSync(googleAccountPath)).toBe(true);
    const cachedGoogleAccount = fs.readFileSync(googleAccountPath, 'utf-8');
    expect(JSON.parse(cachedGoogleAccount)).toEqual({
      active: 'test-google-account@gmail.com',
      old: [],
    });

    // Verify the getCachedGoogleAccount function works
    expect(getCachedGoogleAccount()).toBe('test-google-account@gmail.com');
  });

  it('should perform login with user code', async () => {
    const mockConfigWithNoBrowser = {
      getNoBrowser: () => true,
      getProxy: () => 'http://test.proxy.com:8080',
      isBrowserLaunchSuppressed: () => true,
    } as unknown as Config;

    const mockCodeVerifier = {
      codeChallenge: 'test-challenge',
      codeVerifier: 'test-verifier',
    };
    const mockAuthUrl = 'https://example.com/auth-user-code';
    const mockCode = 'test-user-code';
    const mockTokens = {
      access_token: 'test-access-token-user-code',
      refresh_token: 'test-refresh-token-user-code',
    };

    const mockGenerateAuthUrl = vi.fn().mockReturnValue(mockAuthUrl);
    const mockGetToken = vi.fn().mockResolvedValue({ tokens: mockTokens });
    const mockSetCredentials = vi.fn();
    const mockGenerateCodeVerifierAsync = vi
      .fn()
      .mockResolvedValue(mockCodeVerifier);

    const mockOAuth2Client = {
      generateAuthUrl: mockGenerateAuthUrl,
      getToken: mockGetToken,
      setCredentials: mockSetCredentials,
      generateCodeVerifierAsync: mockGenerateCodeVerifierAsync,
      on: vi.fn(),
    } as unknown as OAuth2Client;
    (OAuth2Client as unknown as Mock).mockImplementation(
      () => mockOAuth2Client,
    );

    const mockReadline = {
      question: vi.fn((_query, callback) => callback(mockCode)),
      close: vi.fn(),
    };
    (readline.createInterface as Mock).mockReturnValue(mockReadline);

    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const client = await getOauthClient(
      AuthType.LOGIN_WITH_GOOGLE,
      mockConfigWithNoBrowser,
    );

    expect(client).toBe(mockOAuth2Client);

    // Verify the auth flow
    expect(mockGenerateCodeVerifierAsync).toHaveBeenCalled();
    expect(mockGenerateAuthUrl).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining(mockAuthUrl),
    );
    expect(mockReadline.question).toHaveBeenCalledWith(
      'Enter the authorization code: ',
      expect.any(Function),
    );
    expect(mockGetToken).toHaveBeenCalledWith({
      code: mockCode,
      codeVerifier: mockCodeVerifier.codeVerifier,
      redirect_uri: 'https://codeassist.google.com/authcode',
    });
    expect(mockSetCredentials).toHaveBeenCalledWith(mockTokens);

    consoleLogSpy.mockRestore();
  });

});
