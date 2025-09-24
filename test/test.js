import {expect} from 'chai';
import joyful, {applyOptions, validate} from '../src/joyful.js';
import Joi from 'joi';

describe('@MomsFriendlyDevCo/Joyful', ()=> {

	it('joyful(state:Object, checks:Object|Function)', ()=> {
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


	it('joyful(state:Object, joi => checks:Object)', ()=> {
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


	it('joyful(state:Object, Array<Object|Function<Object>>)', ()=> {
		let chk;

		// Use callback provided joi
		chk = ()=> joyful(
			{foo: 'Foo!'},
			[
				joi => ({foo: joi.string().required()}),
				joi => ({bar: joi.number()}),
			],
		);
		expect(chk).to.not.throw();
		expect(chk()).to.equal(true);

		chk = ()=> joyful({}, joi => [{}, {foo: joi.string.required()}]);
		expect(chk).to.throw();

		// POJO instead of Joi.object()
		chk = ()=> joyful({foo: 'Foo!'}, [{}, joi => ({foo: joi.string().required()})]);
		expect(chk).to.not.throw();
		expect(chk()).to.equal(true);

		chk = ()=> joyful({}, [{}, joi => ({foo: joi.string().required()}), {}]);
		expect(chk).to.throw();
	});


	it('validate(state:Object, checks:Object) - positive validation', ()=> {
		validate({str: 'Hello'}, joi => ({str: joi.string()}));
		validate({num: 123}, joi => ({num: joi.number().min(0).max(1000)}));
	});


	it('validate(state:Object, checks:Object) - invalid validation', ()=> {
		expect(()=> {
			validate({str: 123}, joi => ({str: joi.string()}));
		}).to.throw;

		expect(()=> {
			validate({num: '123'}, joi => ({num: joi.number().min(0).max(1000)}));
		});

		expect(()=> {
			validate({num: 100_000}, joi => ({num: joi.number().min(0).max(1000)}));
		});
	});


	it('applyOptions(state:Object, checks:Object) - populate function operands', ()=> {
		let schema = joi => ({
			str: joi.string().required(),
			num: joi.number().default(123),
			boolFalse: joi.boolean().default(false).optional(),
			boolTrue: joi.boolean().default(true).optional(),
		});

		expect(()=> {
			applyOptions({str: 'hello'}, schema);
		}).to.not.throw;

		let settings = applyOptions({
			str: 'hello',
			unknownStr: 'Nope!',
			unknownNum: 1234,
		}, schema);
		expect(settings).to.be.a('object');
		expect(settings).to.be.deep.equal({
			str: 'hello',
			num: 123,
			boolFalse: false,
			boolTrue: true,
		});

	});

});
