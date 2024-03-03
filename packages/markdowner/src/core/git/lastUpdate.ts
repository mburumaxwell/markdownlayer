// inspired by Docusaurus at:
// https://github.com/facebook/docusaurus/blob/4aef958a99bcd7e38886db0c3ba0517f5c1827e7/packages/docusaurus-plugin-content-docs/src/lastUpdate.ts

import { FileNotTrackedError, GitNotFoundError, getFileCommitDate } from './gitUtils';

/**
 * Represents the data for the last update.
 */
export interface LastUpdateData {
  /** Relevant commit date. */
  date: Date;
  /** Timestamp in **seconds**, as returned from git. */
  timestamp: number;
  /** The author's name, as returned from git. */
  author: string;
}

let showedGitRequirementError = false;
let showedFileNotTrackedError = false;

export async function getFileLastUpdate(filePath: string): Promise<LastUpdateData | null> {
  if (!filePath) {
    return null;
  }

  // Wrap in try/catch in case the shell commands fail
  // (e.g. project doesn't use Git, etc).
  try {
    const result = getFileCommitDate(filePath, {
      age: 'newest',
      includeAuthor: true,
    });
    return { date: result.date, timestamp: result.timestamp, author: result.author };
  } catch (err) {
    if (err instanceof GitNotFoundError) {
      if (!showedGitRequirementError) {
        console.warn('Sorry, the docs plugin last update options require Git.');
        showedGitRequirementError = true;
      }
    } else if (err instanceof FileNotTrackedError) {
      if (!showedFileNotTrackedError) {
        console.warn('Cannot infer the update date for some files, as they are not tracked by git.');
        showedFileNotTrackedError = true;
      }
    } else {
      console.warn(err);
    }
    return null;
  }
}
