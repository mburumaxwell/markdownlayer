import { sep } from 'node:path';
import { name } from '../package.json';

type LogType = 'debug' | 'info' | 'warn' | 'error';
export type LogLevel = LogType | 'silent';

const identifier = `[${name.toUpperCase()}]`;

const colors: Record<LogType, number> = { debug: 36, info: 32, warn: 33, error: 31 };
const logLevels: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3, silent: 4 };

let minLevel = logLevels.info;

const set = (level: LogLevel): void => {
  minLevel = logLevels[level];
};

/**
 * replace cwd with '.' and replace backslash with slash to make output more readable
 * @param msg message
 * @returns flattened message
 */
const flatten = (msg: unknown): unknown => {
  if (typeof msg !== 'string') return msg;
  return msg.replaceAll(process.cwd() + sep, '').replace(/\\/g, '/');
};

const print = (type: LogType, msg: unknown, begin?: number): void => {
  if (minLevel > logLevels[type]) return;
  const time = begin ? `in ${(performance.now() - begin).toFixed(2)}ms` : '';
  const method = type === 'debug' ? 'log' : type;
  console[method](`\x1B[${colors[type]}m${identifier}\x1B[0m`, flatten(msg), time);
};

const debug = (msg: unknown, begin?: number): void => print('debug', msg, begin);
const info = (msg: unknown, begin?: number): void => print('info', msg, begin);
const warn = (msg: unknown, begin?: number): void => print('warn', msg, begin);
const error = (msg: unknown, begin?: number): void => print('error', msg, begin);

export const logger = { log: debug, info, warn, error, set };
