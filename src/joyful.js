import {isPlainObject} from 'lodash-es';
import Joi from 'joi';

/**
* Validate incoming state against a schema, throwing if the schema is invalid
*
* @param {Object} state The incoming data object to validate
* @param {JoiObject|Object|Function} The schema to validate against, if a POJO it will be converted first. If this is a function it is called as `(Joi)` and expected to return a JoiObject or POJO
*
* @param {Object} [options] Additional options to mutate behaviour
* @param {Boolean} [options.throw=true] Throw an error if validation fails, otherwise the return value will be the string contents that would throw
*
* @returns {Boolean} Boolean `true` if the schema validated otherwise a descriptive error string (which will be the contents of the throw if `options.throw=true`
*/
export default function joyful(state, schema, options) {
	let settings = {
		throw: true,
		...options,
	};

	// Check we have a valid schema
	let validationSchema = compile(schema);

	let result = validationSchema.validate(state);
	if (result.error) {
		let err = result.error.details.map(d => d.message).join(', ');
		if (settings.throw) throw new Error(err);
		return err;
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

export let joi;
