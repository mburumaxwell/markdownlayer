import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import type { GitFileInfo } from '../types';
import { git } from './git';

vi.mock('node:child_process');
vi.mock('node:fs');

describe('git', () => {
  const defaultGitFileInfo: GitFileInfo = {
    date: new Date().toISOString(),
    timestamp: new Date().getTime(),
    author: 'unknown',
  };

  it('should return default value if git is not installed', async () => {
    vi.mocked(execSync).mockImplementation(() => {
      throw new Error('git not found');
    });

    const result = await git({ path: 'test/file.txt' }).safeParseAsync({});
    expect(result.success).toBe(false);
    expect(result.error!.issues[0].message).toBe('Failed to retrieve git history because git is not installed.');
  });

  it('should return default value if file does not exist', async () => {
    vi.mocked(execSync).mockReturnValue(Buffer.from('git version 2.30.0'));
    vi.mocked(existsSync).mockReturnValue(false);

    const result = await git({ path: 'test/file.txt' }).safeParseAsync({});
    expect(result.success).toBe(false);
    expect(result.error!.issues[0].message).toBe('Failed to retrieve git history because the file does not exist.');
  });

  it('should return default value if file is not tracked by git', async () => {
    vi.mocked(execSync).mockReturnValue(Buffer.from('git version 2.30.0'));
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(execSync).mockReturnValue(Buffer.from(''));

    const result = await git({ path: 'test/file.txt', default: defaultGitFileInfo }).safeParseAsync({});
    expect(result.success).toBe(true);
    expect(result.data).toEqual(defaultGitFileInfo);
  });
});
