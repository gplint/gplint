import * as os from 'node:os';

/**
 * Normalizes the end-of-line characters in a string to the operating system's default EOL sequence.
 *
 * @param {string} str - The input string containing end-of-line characters to be normalized.
 * @return {string} A new string with all end-of-line characters replaced by the operating system's default EOL sequence.
 */
export function stringEOLNormalize(str: string): string {
	const eol = str.includes('\r\n') ? '\r\n' : '\n';

	return str.replaceAll(eol, os.EOL);
}
