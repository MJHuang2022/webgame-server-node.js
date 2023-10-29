const _  = require('lodash');
class ParamValidation {
  constructor(params, schemaCollation) {
    this.schema = null;
    this.params = params;
    params.forEach((param) => {
      const curSchema = schemaCollation[param];
      if (!curSchema) {
        throw new Error(`The shcema ${param} doesn't exist.`);
      }

      if (!this.schema) {
        this.schema = curSchema;
      } else {
        this.schema = this.schema.concat(curSchema);
      }
    });
  }

  validate(props) {
    if (!this.schema) {
      throw new Error(`The schema is null.`);
    }

    const isValid = this.schema.validate(props);
    if (!isValid) {
      return {isValid, params: null};
    }

    const params = _.pick(props, this.params);
    return {isValid, params};
  }
}

module.exports = ParamValidation;