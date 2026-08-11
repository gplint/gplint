import fs from 'node:fs';
import mockFs from 'mock-fs';
import sinon from 'sinon';

export const mochaHooks = {
	beforeAll: [
		function() {
			sinon.stub(fs, 'writeFileSync').callsFake((a, b) =>
				Object.keys(mockFs.getMockRoot()).length
					? (fs.writeFileSync as sinon.SinonStubbedMember<typeof fs.writeFileSync>).wrappedMethod(a, b)
					: sinon.fake()
			);
		}
	],
	afterEach: [
		function() {
			(fs.writeFileSync as sinon.SinonStubbedMember<typeof fs.writeFileSync>).resetHistory();
		}
	]
};
