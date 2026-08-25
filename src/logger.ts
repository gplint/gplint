export function boldError(msg: string): void {
	console.error(`\x1b[31m\x1b[1m${msg}\x1b[0m`); // eslint-disable-line no-console
}

export function error(msg: string): void {
	console.error(`\x1b[31m${msg}\x1b[0m`); // eslint-disable-line no-console
}

export function warn(msg: string): void {
	console.warn(`\x1b[93m${msg}\x1b[0m`); // eslint-disable-line no-console
}
