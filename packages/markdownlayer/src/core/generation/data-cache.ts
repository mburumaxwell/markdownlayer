import type { BaseDoc } from '../types';

export type DataCacheEntry = {
  /**
   * Hash of the document (for simplicity, this is the last modified time of the file).
   * Used to invalidate the cache when the document changes.
   */
  hash: string;

  /** Type of definition */
  type: string;

  /** Time in milliseconds elapsed when compiling/transforming the file into the document */
  elapsed: number;

  /** Actual document (in cache) */
  document: BaseDoc;
};

export type DataCache = {
  /**
   * Cache of all documents.
   * Key is the document path relative to `contentDirPath`.
   */
  items: Record<string, DataCacheEntry>;

  /**
   * Total time elapsed for all documents in milliseconds.
   */
  elapsed?: number;
};
