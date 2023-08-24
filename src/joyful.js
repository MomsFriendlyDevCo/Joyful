import Joi from 'joi';

/**
* Validate incoming data against a schema, throwing if the schema is invalid
*
* @param {Object} data The incoming data object to validate
* @param {JoiObject|Object|Function} The schema to validate against, if a POJO it will be converted first. If this is a function it is called as `(Joi)` and expected to return a JoiObject or POJO
*
* @param {Object} [options] Additional options to mutate behaviour
* @param {Boolean} [options.throw=true] Throw an error if validation fails, otherwise the return value will be the string contents that would throw
*
* @returns {Boolean} Boolean `true` if the schema validated otherwise a descriptive error string (which will be the contents of the throw if `options.throw=true`
*/
export default function joyful(data, schema, options) {
	let settings = {
		throw: true,
		...options,
	};

	// Check we have a valid schema
	let validationSchema = Joi.isSchema(schema) ? schema
		: typeof schema == 'function' ? (()=> { // Run function + convert
			let cbSchema = schema(Joi);
			return Joi.isSchema(cbSchema) ? cbSchema : Joi.object(cbSchema);
		})()
		: Joi.object(schema);

	let result = validationSchema.validate(data);
	if (result.error) {
		let err = result.error.details.map(d => d.message).join(', ');
		if (settings.throw) throw new Error(err);
		return err;
	} else {
		return true;
	}
}
