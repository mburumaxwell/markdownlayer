import { camelCase } from 'change-case';
import { FSWatcher } from 'chokidar';
import fs from 'fs';
import GithubSlugger from 'github-slugger';
import { globby } from 'globby';
import matter from 'gray-matter';
import { pluralize } from 'inflection';
import path from 'path';
import readingTime from 'reading-time';
import type { PackageJson } from 'type-fest';

import type { BaseDoc, GenerationMode, TocItem } from '@/core/types';
import { version } from '../../../package.json';
import { getFileLastUpdate, type LastUpdateData } from '../git';
import type { DocumentDefinition, DocumentMeta, MarkdownlayerConfig, MarkdownlayerConfigPlugins } from '../types';
import { createWatcher, type ChokidarEventName } from '../watch';
import { bundle, type BundleProps } from './bundle';
import { getConfig } from './config-file';
import type { DataCache } from './data-cache';
import { getFormat } from './format';

type GeneratedCount = { cached: number; generated: number; total: number };

// NOTE Type assert statements for `.json` files are necessary from Node v16.14 onwards
const nodeVersionMajor = parseInt(process.versions.node.split('.')[0]);
const nodeVersionMinor = parseInt(process.versions.node.split('.')[1]);
const needsJsonAssertStatement = nodeVersionMajor > 16 || (nodeVersionMajor === 16 && nodeVersionMinor >= 14);
const assertStatement = needsJsonAssertStatement ? ` assert { type: 'json' }` : '';
const autogeneratedNote = `// NOTE This file is auto-generated on build.`;

let contentWatcher: FSWatcher | null;

export type GenerateOptions = {
  /**
   * Build mode.
   * Enables production optimizations or development hints.
   */
  mode: GenerationMode;

  /** Current working directory. */
  cwd?: string;
};

export async function generate(options: GenerateOptions) {
  const { mode, cwd = process.cwd() } = options;

  // close the watcher if it exists
  if (contentWatcher) {
    contentWatcher.close();
    contentWatcher = null;
  }

  // get the config (compiled from the config file)
  let outputFolder = path.join(cwd, '.markdownlayer');
  const { config, configHash } = await getConfig({ cwd, outputFolder });

  // generate the documents (initial)
  await generateInner({ mode, cwd, outputFolder, config, configHash });

  // watch for changes in the content folder (development mode only)
  if (mode === 'development') {
    contentWatcher = createWatcher(config.contentDirPath, async (eventName: ChokidarEventName, path: string) => {
      if (eventName === 'add') console.log(`File added: ${path}`);
      else if (eventName === 'change') console.log(`File changed: ${path}`);
      else if (eventName === 'unlink') console.log(`File deleted: ${path}`);
      else return;

      await generateInner({ mode, cwd, outputFolder, config, configHash });
    });
  }
}

type GenerateInnerOptions = Pick<GenerateOptions, 'mode'> & {
  cwd: string;
  outputFolder: string;
  config: MarkdownlayerConfig;
  configHash: string;
};
async function generateInner(options: GenerateInnerOptions) {
  const {
    mode,
    cwd,
    configHash,
    config: { caching = true, contentDirPath, definitions, mdAsMarkdoc = false, ...plugins },
  } = options;
  let outputFolder = options.outputFolder;

  // ensure there are no definitions with duplicate types
  const types = definitions.map((def) => def.type);
  const uniqueTypes = new Set(types);
  if (types.length !== uniqueTypes.size) {
    const duplicates = types.filter((type, index) => types.indexOf(type) !== index);
    throw new Error(`Duplicate definition types found: ${duplicates.join(', ')}`);
  }

  // ensure that all definitions have at least one pattern
  const definitionsWithNoPatterns = definitions.filter((def) => def.patterns.length === 0);
  if (definitionsWithNoPatterns.length > 0) {
    const types = definitionsWithNoPatterns.map((def) => def.type);
    throw new Error(`Definitions with no patterns found: ${types.join(', ')}`);
  }

  // load cache from file if it exists, otherwise create a new cache
  // changes in configuration options and plugins will invalidate the cache
  const cacheFilePath = path.join(outputFolder, `cache/v${version}/data-${configHash}.json`);
  let cache: DataCache = { items: {} };
  if (caching && fs.existsSync(cacheFilePath)) {
    cache = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
  }

  // write package.json
  fs.mkdirSync(outputFolder, { recursive: true });
  await writePackageJson({ outputFolder, configHash });

  // iterate over the definitions and generate the docs
  outputFolder = path.join(outputFolder, 'generated');
  const contentDir = path.join(cwd, contentDirPath);
  const counts: Record<string, GeneratedCount> = {};
  for (const def of definitions) {
    const generated = await generateDocuments({ ...def, mode, contentDir, outputFolder, mdAsMarkdoc, plugins, cache });
    counts[def.type] = generated;
  }

  // write cache to file
  cache.elapsed = Object.values(cache.items).reduce((acc, item) => acc + item.elapsed, 0);
  fs.mkdirSync(path.dirname(cacheFilePath), { recursive: true });
  fs.writeFileSync(cacheFilePath, JSON.stringify(cache, null, 2), { encoding: 'utf8' });

  // write files that would be imported by the application (index.ts, index.mjs, types.d.ts)
  await writeTypesFile({ outputFolder, documentTypeNames: types, mode });
  await writeIndexFile({ outputFolder, documentTypeNames: types, mode });

  // print some stats
  const { cached, total }: GeneratedCount = Object.values(counts).reduce((acc, count) => {
    acc.cached += count.cached;
    acc.generated += count.generated;
    acc.total += count.total;
    return acc;
  });
  console.log(`Generated ${total} documents (${cached} from cache) in .markdownlayer`);
}

type GenerateDocsOptions = DocumentDefinition & {
  mode: GenerationMode;
  contentDir: string;
  ignoreFiles?: string | readonly string[];
  outputFolder: string;
  mdAsMarkdoc: boolean;
  plugins: MarkdownlayerConfigPlugins;
  cache: DataCache;
};

async function generateDocuments(options: GenerateDocsOptions): Promise<GeneratedCount> {
  const {
    mode,
    type,
    format = 'detect',
    contentDir,
    patterns,
    validate,
    ignoreFiles,
    outputFolder,
    mdAsMarkdoc,
    plugins,
    cache,
  } = options;

  // find the files
  const files = await globby(patterns, { cwd: contentDir, ignoreFiles: ignoreFiles, gitignore: true });

  let cached = 0;
  let generated = 0;
  let docs: BaseDoc[] = [];
  let collectionChanged = false;

  fs.mkdirSync(path.join(outputFolder, type), { recursive: true });

  // parse the files and "compile" in a loop
  for (const file of files) {
    const sourceFilePath = path.join(contentDir, file);

    // if the file has not been modified, use the cached version
    const hash = fs.statSync(sourceFilePath).mtimeMs.toString();
    const cacheEntry = cache.items[file];
    const changed = !cacheEntry || cacheEntry.hash !== hash;
    if (!changed) {
      docs.push(cacheEntry.document);
      cached++;
      continue;
    }

    // at this point we know that the file has changed and we need to recompile
    // it also means that the collection has changed
    collectionChanged = true;

    const start = performance.now();

    const contents = fs.readFileSync(sourceFilePath, 'utf8');
    const { data: frontmatter } = matter(contents);

    // determine the document format
    let documentFormat = getFormat({ file, format });
    if (documentFormat === 'md' && mdAsMarkdoc) documentFormat = 'mdoc';

    const bundleOptions: BundleProps = {
      contents,
      entryPath: sourceFilePath,
      format: documentFormat,
      mode,
      plugins,
      frontmatter,
    };
    const { code, errors } = await bundle(bundleOptions);
    if (errors && errors.length) {
      console.error(errors);
      throw new Error('Failed to bundle file: ' + file);
    }

    const end = performance.now();
    const elapsed = end - start;

    const meta: DocumentMeta = {
      _id: file,
      _raw: {
        sourceFilePath: file,
        sourceFileName: path.basename(file),
        sourceFileDir: path.dirname(file),
        flattenedPath: getFlattenedPath(file),
        frontmatter: frontmatter,
      },

      format: documentFormat,
      body: { raw: contents, code: code },
    };

    //  only pull git info if in production mode
    let lastUpdate: LastUpdateData | null = null;
    if (mode === 'production') {
      lastUpdate = await getFileLastUpdate(path.join(contentDir, file));
    }

    const updated = frontmatter.updated ?? (lastUpdate?.date ?? new Date()).toISOString();
    const published = frontmatter.published ?? updated;
    const authors: string[] =
      frontmatter.authors ?? (options.authorFromGit && lastUpdate?.author ? [lastUpdate.author] : []);

    // generate table of contents if requested
    const toc = frontmatter.toc ?? options.toc ?? false ? generateToc(contents) : [];

    const document: BaseDoc = {
      ...meta,

      type: type,
      keywords: frontmatter.keywords,
      authors: authors,
      title: frontmatter.title,
      slug: frontmatter.slug ?? meta._raw.flattenedPath,
      published: published,
      updated: updated,
      readingTime: readingTime(contents),
      draft: frontmatter.draft ?? false,
      unlisted: frontmatter.unlisted ?? false,
      description: frontmatter.description,
      sidebarLabel: frontmatter.sidebar_label,
      paginationLabel: frontmatter.pagination_label,
      image: frontmatter.image,
      tableOfContents: toc,

      link: frontmatter.link,
      category: frontmatter.category,
    };

    // add the document to the list
    if (validate) validate(document);
    docs.push(document);

    // write json file
    const outputFilePath = path.join(outputFolder, type, `${idToFileName(document._id)}.json`);
    fs.writeFileSync(outputFilePath, JSON.stringify(document, null, 2), { encoding: 'utf8' });

    // update the cache
    cache.items[file] = { hash, type, document, elapsed };
    generated++;
  }

  // ensure that all documents have a unique slug
  const slugs = docs.map((doc) => doc.slug);
  const uniqueSlugs = new Set(slugs);
  if (slugs.length !== uniqueSlugs.size) {
    const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
    throw new Error(`Duplicate slugs found: ${duplicates.join(', ')}`);
  }

  // write the collection files if there are collection changes (or if there are no documents, to allow imports)
  if (collectionChanged || docs.length == 0) {
    // write the collection file
    let outputFilePath = path.join(outputFolder, type, '_index.json');
    fs.writeFileSync(outputFilePath, JSON.stringify(docs, null, 2), { encoding: 'utf8' });

    // write import file
    const dataVariableName = getDataVariableName(type);
    outputFilePath = path.join(outputFolder, type, '_index.mjs');
    let lines: string[] = [autogeneratedNote, ''];
    for (const doc of docs) {
      lines.push(`import ${makeVariableName(doc._id)} from './${idToFileName(doc._id)}.json'${assertStatement};`);
    }
    lines.push('');
    lines.push(`export const ${dataVariableName} = [${docs.map((doc) => `${makeVariableName(doc._id)}`).join(', ')}]`);
    lines.push('');
    fs.writeFileSync(outputFilePath, lines.join('\n'), { encoding: 'utf8' });
  }

  return { cached, generated, total: docs.length };
}

type WritePackageJsonFileOptions = { outputFolder: string; configHash: string };

async function writePackageJson({ outputFolder, configHash }: WritePackageJsonFileOptions) {
  const packageJson: PackageJson & { typesVersions: any } = {
    name: 'dot-markdownlayer',
    description: 'This package is auto-generated by markdownlayer.',
    version: `${version}-${configHash}`,
    private: true,
    exports: {
      './generated': {
        import: './generated/index.mjs',
      },
    },
    typesVersions: {
      '*': {
        generated: ['./generated'],
      },
    },
  };

  const filePath = path.join(outputFolder, 'package.json');
  fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2), { encoding: 'utf8' });
}

type WriteIndexFileOptions = { outputFolder: string; documentTypeNames: string[]; mode: GenerationMode };

async function writeTypesFile({ outputFolder, documentTypeNames }: WriteIndexFileOptions) {
  // write the index.d.ts file
  let lines: string[] = [autogeneratedNote, ''];
  lines.push(...[`import type { ImageData, BaseDoc } from 'markdownlayer/core';`, '']);
  lines.push(...[`export type { ImageData };`, '']);
  lines.push(...documentTypeNames.map((type) => `export type ${type} = BaseDoc & { type: '${type}' };`));
  lines.push(
    ...[
      '',
      `export type DocumentTypes = ${documentTypeNames.join(` | `)}`,
      `export type DocumentTypeNames = '${documentTypeNames.join(`' | '`)}'`,
      '',
    ],
  );
  let filePath = path.join(outputFolder, 'types.d.ts');
  fs.writeFileSync(filePath, lines.join('\n'), { encoding: 'utf8' });
}

async function writeIndexFile({ outputFolder, documentTypeNames, mode }: WriteIndexFileOptions) {
  // write the index.ts file
  let lines: string[] = [autogeneratedNote, ''];
  lines.push(...[`import { ${documentTypeNames.join(', ')}, DocumentTypes } from './types';`, '']);
  lines.push(...[`export * from './types';`, '']);
  lines.push(...documentTypeNames.map((type) => `export declare const ${getDataVariableName(type)}: ${type}[];`));
  lines.push('');
  lines.push(...[`export declare const allDocumentTypes: DocumentTypes[]`, '']);
  let filePath = path.join(outputFolder, 'index.ts');
  fs.writeFileSync(filePath, lines.join('\n'), { encoding: 'utf8' });

  // write the index.mjs file
  lines = [
    autogeneratedNote,
    '',
    '// NOTE During development imports are done from `.mjs` files to improve HMR speeds.',
    '// During (production) builds imports are done from `.json` files to improve build performance.',
    '',
  ];
  lines.push(
    ...documentTypeNames.map((type) => {
      const dataVariableName = getDataVariableName(type);
      return mode == 'development'
        ? `import { ${dataVariableName} } from './${type}/_index.mjs';`
        : `import ${dataVariableName} from './${type}/_index.json'${assertStatement};`;
    }),
  );
  lines.push(
    ...[
      '',
      `export { ${documentTypeNames.map((type) => getDataVariableName(type)).join(', ')} };`,
      '',
      `export const allDocuments = [...${documentTypeNames.map((type) => getDataVariableName(type)).join(', ...')}];`,
      '',
    ],
  );
  filePath = path.join(outputFolder, 'index.mjs');
  fs.writeFileSync(filePath, lines.join('\n'), { encoding: 'utf8' });
}

/**
 * Get flattened path from relative file path.
 * @param relativeFilePath
 * @returns string Flattened path.
 */
function getFlattenedPath(relativeFilePath: string): string {
  return (
    relativeFilePath
      // remove extension
      .split('.')
      .slice(0, -1)
      .join('.')
      // deal with root `index` file
      .replace(/^index$/, '')
      // remove tailing `/index`
      .replace(/\/index$/, '')
  );
}

// For some reason, generating toc using mdast-util-toc or even using docusaurus' own toc plugin generates entries from frontmatter.
// Most of the time it is the first entry but sometimes it is not. Removing it results in missing TOC at times.
// So we have to do it manually using regex. Hopefully this is a temporary solution and someone will fix this someday.
// Regex solution from https://yusuf.fyi/posts/contentlayer-table-of-contents

const slugger = new GithubSlugger();
const regXHeader = /\n(?<flag>#{1,6})\s+(?<content>.+)/g;

export function generateToc(contents: string): TocItem[] {
  return Array.from(contents.matchAll(regXHeader)).map(({ groups }) => {
    const { flag, content } = groups!;
    const id = slugger.slug(content);
    return {
      level: flag.length,
      value: content,
      id: id,
      url: `#${id}`,
    };
  });
}

const makeVariableName = (id: string) => camelCase(idToFileName(id).replace(/[^A-Z0-9\_]/gi, '/0'));
const getDataVariableName = (type: string): string => 'all' + uppercaseFirstChar(pluralize(type));
const idToFileName = (id: string): string => leftPadWithUnderscoreIfStartsWithNumber(id).replace(/\//g, '__');
const leftPadWithUnderscoreIfStartsWithNumber = (str: string): string => (/^[0-9]/.test(str) ? '_' + str : str);
const uppercaseFirstChar = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);