import childProcess, {ExecFileException} from 'node:child_process';
import {expect} from 'chai';

describe('cli', () => {
	// TODO Skip as fails with MacOS and Node v18 y v20
	it.skip('run successfully', function() {
		try {
			childProcess.execFileSync('node', [
				'../bin/gplint.js',
				'.',
				'--format', 'json'
			], {
				cwd: './test-data-wip',
				encoding: 'utf-8',
				maxBuffer: 10 * 1024 * 1024
			});
			expect.fail('Expected exit code to be non-zero');
		} catch (error) {
			expect(JSON.parse((error as ExecFileException).stdout)).to.have.lengthOf(23);
			expect((error as ExecFileException).stderr).to.be.empty;
		}
	});
});
