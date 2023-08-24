import {expect} from 'chai';
import joyful from '../src/joyful.js';
import Joi from 'joi';

describe('@MomsFriendlyDevCo/Joyful', ()=> {

	it('joyful(data, checks)', ()=> {
		let chk;

		// Full wrapper
		chk = ()=> joyful({foo: 'Foo!'}, Joi.object({foo: Joi.string().required()}));
		expect(chk).to.not.throw();
		expect(chk()).to.equal(true);

		// POJO instead of Joi.object()
		chk = ()=> joyful({foo: 'Foo!'}, {foo: Joi.string().required()});
		expect(chk).to.not.throw();
		expect(chk()).to.equal(true);
	});

	it('joyful(joi => checks)', ()=> {
		let chk;

		// Use callback provided joi
		chk = ()=> joyful({foo: 'Foo!'}, joi => joi.object({foo: joi.string().required()}));
		expect(chk).to.not.throw();
		expect(chk()).to.equal(true);

		chk = ()=> joyful({}, joi => joi.object({foo: joi.string().required()}));
		expect(chk).to.throw();

		// POJO instead of Joi.object()
		chk = ()=> joyful({foo: 'Foo!'}, joi => ({foo: joi.string().required()}));
		expect(chk).to.not.throw();
		expect(chk()).to.equal(true);

		chk = ()=> joyful({}, joi => ({foo: joi.string().required()}));
		expect(chk).to.throw();
	});

});
