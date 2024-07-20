import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export type MarkdownlayerCacheItem = {
  /**
   * Hash of the document (for simplicity, this is the last modified time of the file).
   * Used to invalidate the cache when the document changes.
   */
  hash: string;

  /** Type of definition */
  type: string;

  /** Actual document (in cache) */
  document: unknown;
};

export class MarkdownlayerCache {
  /**
   * Cache for unique values.
   * Key is the value that should be unique.
   * Value is the full document path
   */
  uniques: Record<string, string>;

  /** Cache of all documents. Key is the full document path. */
  items: Record<string, MarkdownlayerCacheItem>;

  /** File path for caching */
  #filePath: string | null;

  constructor(
    filePath: string | null,
    uniques: Record<string, string> = {},
    items: Record<string, MarkdownlayerCacheItem> = {},
  ) {
    this.#filePath = filePath;
    this.uniques = uniques;
    this.items = items;
  }

  /**
   * Reads the cache from the file if it provided.
   */
  async load(): Promise<void> {
    if (!this.#filePath) return;
    if (!existsSync(this.#filePath)) return;
    const data = await readFile(this.#filePath, 'utf8');
    const parsed = JSON.parse(data);
    this.uniques = parsed.uniques;
    this.items = parsed.items;
  }

  /**
   * Writes the cache to the file specified in the constructor.
   */
  async save(): Promise<void> {
    if (!this.#filePath) return;
    await mkdir(dirname(this.#filePath), { recursive: true });
    const data = JSON.stringify(this, null, 2);
    await writeFile(this.#filePath, data, { encoding: 'utf8' });
  }
}
