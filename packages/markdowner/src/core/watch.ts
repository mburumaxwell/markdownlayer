import chokidar, { FSWatcher } from 'chokidar';

export type WatcherPaths = string | ReadonlyArray<string>;
export type ChokidarEventName = 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir';
export type WatcherCallback = (eventName: ChokidarEventName, path: string) => void;

export function createWatcher(paths: WatcherPaths, callback: WatcherCallback): FSWatcher {
  return chokidar.watch(paths, { ignoreInitial: true }).on('all', callback);
}
