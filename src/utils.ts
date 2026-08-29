import path from 'node:path';

export function safePathJoin(...paths: string[]) {
	const fullPath = path.join(...paths);

	return path.sep === path.posix.sep ? fullPath : fullPath.replaceAll(path.sep, path.posix.sep);
}
