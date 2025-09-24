import {isPlainObject} from 'lodash-es';
import Joi from 'joi';

/**
* Validate incoming state against a schema, throwing if the schema is invalid
*
* @param {Object} state The incoming data object to validate
* @param {JoiObject|Object|Function} schema The schema to validate against, if a POJO it will be converted first. If this is a function it is called as `(Joi)` and expected to return a JoiObject or POJO
*
* @param {Object} [options] Additional options to mutate behaviour
* @param {Boolean} [options.populate=false] Return the populated object along with defaults rather than void
* @param {Boolean} [options.throw=true] Throw an error if validation fails, otherwise the return value will be the string contents that would throw
* @param {Boolean} [options.trim=true] Remove non-schema keys from the input before validating (or returning if `populate=true`)
*
* @returns {Boolean|Object} Boolean `true` if the schema validated otherwise a descriptive error string (which will be the contents of the throw if `options.throw=true`, if `options.populate` this returns the computed object merged with the state
*/
export default function joyful(state, schema, options) {
	let validationState = state;
	let settings = {
		populate: false,
		throw: true,
		trim: false,
		...options,
	};

	// Check we have a valid schema
	let validationSchema = compile(schema);

	if (settings.trim) {
		let allowKeys = new Set(
			validationSchema.$_terms.keys.map(i => i.key) // Silly method to extract keys as joi.describe() doesn't work outside a browser - https://github.com/hapijs/joi/issues/2385#issuecomment-2882517532
		);
		validationState = Object.fromEntries(
			Object.entries(validationState)
				.filter(([key]) => allowKeys.has(key))
		);
	}

	let result = validationSchema.validate(validationState);
	if (result.error) {
		let err = result.error.details.map(d => d.message).join(', ');
		if (settings.throw) throw new Error(err);
		return err;
	} else if (settings.populate) {
		return result.value;
	} else {
		return true;
	}
}


/**
* Accept a lazy schema type and compile it into a Joi.schema object
*
* @param {Function|Object|Array<Function|Object>} schema Lazy schema to compile
* @param {Object} [options] Additional options to mutate behaviour
* @param {Boolean} [options.wrapObjects=true] Wrap POJOs into Joi.object()
* @returns {JoiSchema} Output Joi schema
*/
export function compile(schema, options = {}) {
	let settings = {
		wrapObjects: true,
		validate: true,
		...options,
	};

	if (Array.isArray(schema)) {
		let schemasToMerge = schema // Resolve functions
			.filter(Boolean) // Ignore obvious blanks
			.map(s => typeof s == 'function' // Resolve functions
				? s.call(Joi, Joi)
				: s
			)

		if (settings.validate) {
			if (schemasToMerge.some(s => // eslint-disable-line unicorn/no-lonely-if
				!isPlainObject(s)
			)) throw new Error(`Only POJO member items allowed when providing an array of schemas to Joyful`);
		}

		let merged = Joi.object(
			Object.assign({}, ...schemasToMerge)
		);

		return merged;
	}


	return Joi.isSchema(schema) ? schema // Given schema - use entire schema
	: typeof schema == 'function' ? (()=> { // Run function + convert
		let cbSchema = schema(Joi);
		return Joi.isSchema(cbSchema) ? cbSchema : Joi.object(cbSchema);
	})()
	: Array.isArray(schema) ? Joi.object({
		...schema.map(s => compile(s)),
	})
	: settings.wrapObjects ? Joi.object(schema)
	: schema;
}


/**
* Wrapped version of Joyful which silently validate a state against a schema or throws if the state is invalid
* This is really just a utilty function of `joyful(state, schema, {throws: true})`
*
* @param {Object} state The incoming data object to validate
* @param {JoiObject|Object|Function} schema The schema to validate against, if a POJO it will be converted first. If this is a function it is called as `(Joi)` and expected to return a JoiObject or POJO
*
* @param {Object} [options] Additional options to mutate behaviour, see main `joyful` export for details
*
* @returns {void} Silently returns if validation passes, otherwise will throw
*/
export function validate(state, schema, options) {
	return joyful(state, schema, {
		throw: true,
		...options,
	});
}


/**
* Wrapped version of Joyful which will validate an options object, apply defaults and return the valid result
* If validation fails this function will throw
* This is really just a utilty function of `joyful(state, schema, {populate: true, trim: true, throws: true})`
*
* @param {Object} state The incoming data object to validate
* @param {JoiObject|Object|Function} schema The schema to validate against, if a POJO it will be converted first. If this is a function it is called as `(Joi)` and expected to return a JoiObject or POJO
*
* @param {Object} [options] Additional options to mutate behaviour, see main `joyful` export for details
*
* @returns {Object} The validated options object with defaults
*/
export function applyOptions(state, schema, options) {
	return joyful(state, schema, {
		populate: true,
		trim: true,
		throw: true,
		...options,
	});
}


export let joi;
