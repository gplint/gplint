import {expect} from 'chai';
import sinon from 'sinon';

import * as logger from '../src/logger.js';

describe('logger', () => {
	beforeEach(() => {
		sinon.stub(console, 'error');
		sinon.stub(console, 'warn');
	});

	afterEach(() => {
		(console.error as sinon.SinonSpiedMember<typeof console.error>).restore(); // eslint-disable-line no-console
		(console.warn as sinon.SinonSpiedMember<typeof console.warn>).restore(); // eslint-disable-line no-console
	});

	it('logs a bold red error message to the console', () => {
		logger.boldError('Critical failure');
		// eslint-disable-next-line no-console
		expect((console.error as sinon.SinonSpiedMember<typeof console.error>).getCall(0).args).to.be.deep.equal(['\x1b[31m\x1b[1mCritical failure\x1b[0m']);
	});

	it('logs a red error message to the console', () => {
		logger.error('An error occurred');
		// eslint-disable-next-line no-console
		expect((console.error as sinon.SinonSpiedMember<typeof console.error>).getCall(0).args).to.be.deep.equal(['\x1b[31mAn error occurred\x1b[0m']);
	});

	it('logs a yellow warning message to the console', () => {
		logger.warn('This is a warning');
		// eslint-disable-next-line no-console
		expect((console.warn as sinon.SinonSpiedMember<typeof console.warn>).getCall(0).args).to.be.deep.equal(['\x1b[93mThis is a warning\x1b[0m']);
	});
});
