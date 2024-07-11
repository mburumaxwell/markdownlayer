import { execSync, type ExecException } from 'node:child_process';
import { existsSync } from 'node:fs';
import { basename, dirname } from 'node:path';

/**
 * Represents the data for the last update.
 */
export interface GitFileLastUpdateResult {
  /** Relevant commit date. */
  date: Date;
  /** The author's name, as returned from git. */
  author: string;
}

export interface GitFileLastUpdateOptions {
  /**
   * `"oldest"` is the commit that added the file, following renames;
   * `"newest"` is the last commit that edited the file.
   *
   * @default 'newest'
   */
  age?: 'oldest' | 'newest';
}

let showedGitRequirementError = false;
let showedFileNotTrackedError = false;

/**
 * Fetches the git history of a file and returns a relevant commit date.
 * It gets the commit date instead of author date so that amended commits
 * can have their dates updated.
 *
 * @param filePath - Absolute path to the file.
 * @param options - Options for the last update.
 */
export async function getGitFileLastUpdate(
  filePath: string,
  { age = 'newest' }: GitFileLastUpdateOptions = {},
): Promise<GitFileLastUpdateResult | null> {
  // check if git is installed
  try {
    execSync('git --version', { stdio: 'ignore' });
  } catch (error) {
    if (!showedGitRequirementError) {
      // console.warn(`Failed to retrieve git history for "${filePath}" because git is not installed.`);
      console.warn('Sorry, last update options for markdownlayer require Git.');
      showedGitRequirementError = true;
    }
    return null;
  }

  // check if the file exists
  if (!existsSync(filePath)) {
    console.warn(`Failed to retrieve git history for "${filePath}" because the file does not exist.`);
    return null;
  }

  const args = [`--format=%ct,%an`, '--max-count=1', age === 'oldest' && '--follow --diff-filter=A']
    .filter(Boolean)
    .join(' ');

  let result: Buffer;
  try {
    result = execSync(`git log ${args} -- "${basename(filePath)}"`, {
      // Setting cwd is important, see: https://github.com/facebook/docusaurus/pull/5048
      cwd: dirname(filePath),
      stdio: 'pipe', // To capture stdout and stderr
    });
  } catch (error) {
    const err = error as ExecException;
    console.warn(`Failed to retrieve the git history for file "${filePath}" with exit code ${err.code}: ${err.stderr}`);
    return null;
  }

  const output = result.toString().trim();
  if (!output) {
    if (!showedFileNotTrackedError) {
      // console.warn(`Failed to retrieve the git history for file "${filePath}" because the file is not tracked by git.`);
      console.warn('Cannot infer the update date for some files, as they are not tracked by git.');
      showedFileNotTrackedError = true;
    }
    return null;
  }

  const match = output.match(/^(?<timestamp>\d+),(?<author>.+)$/);
  if (!match) {
    console.warn(`Failed to retrieve the git history for file "${filePath}" with unexpected output: ${output}`);
    return null;
  }

  const timestamp = Number(match.groups!.timestamp);
  const date = new Date(timestamp * 1000);

  return { date, author: match.groups!.author! };
}
