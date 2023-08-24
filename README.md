@MomsFriendlyDevCo/Joyful
=========================
Tiny wrapper around [Joi](https://joi.dev/api) to provide easy validation + errors.

Why?

* *Simple terse format* - No need to wrap outer objects in `Joi.object()`, POJOs and simple structures are converted for you
* *Verbose Joi imports* - By using a callback you can avoid needing to import Joi as a library in your outer library, just import it for the validation construction and let it fall out of scope
* *Meaningful errors* - Joi, while wonderful, doesn't make extracting errors easy, this library combines validation errors together and makes them readable as one string, readable by a human
* *Throw by default* - Validation failures throw (configurable) by default without needing to examine the result and pick apart if an error occurred


This library exposes a simple function `joyful(data, schema, options)` which accepts:

* _data_ - The input data to validate
* _schema_ - A `Joi.Object()`, A [POJO](https://www.wikiwand.com/en/Plain_Old_Java_Object) or a function which can return either
* _options_ - Additional options to change the functions behaviour

Options are:

| Option  | Type      | Default | Description                                                                                                 |
|---------|-----------|---------|-------------------------------------------------------------------------------------------------------------|
| `throw` | `Boolean` | `true`  | Throw an error if validation fails, otherwise the return value will be the string contents that would throw |


Examples
--------

### Terse syntax
If given a callback, `joyful()` will call that function with `(Joi)` as the only argument, avoiding the need to `import Joi` into your outer application

```javascript
import joyful from '@momsfriendlydevco/joyful';

joyful(
    {foo: 'Foo!'},
    joi => ({foo: joi.string().required()}}),
); //= true

joyful(
    {},
    joi => ({foo: joi.string().required()}}),
); //~ will throw a meaningful error
```

### Verbose syntax
Or if you prefer the exactness of using Joi, use it as a regular validator.

```javascript
import joyful from '@momsfriendlydevco/joyful';
import Joi from 'joi';

// Full verbose syntax to validate an object
joyful(
    {foo: 'Foo!'},
    Joi.Object({foo: Joi.string().required()}),
); //= true

// Shorter - pass a POJO instead of the wrapping `Joi.object()`
joyful(
    {foo: 'Foo!'},
    {foo: Joi.string().required()},
); //= true
```
