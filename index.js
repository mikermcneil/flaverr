/**
 * Module dependencies
 */

var util = require('util');
var _ = require('@sailshq/lodash');


/**
 * flaverr()
 *
 * Flavor an Error instance with the specified error code string or dictionary of customizations.
 *
 * Specifically, this modifies the provided Error instance either:
 * (A) by attaching a `code` property and setting it to the specified value (e.g. "E_USAGE"), or
 * (B) merging the specified dictionary of stuff into the Error
 *
 * If a `message` or `name` is provided, the Error instance's `stack` will be recalculated accordingly.
 * This can be used to consume an omen -- i.e. giving this Error instance's stack trace "hindsight",
 * and keeping it from getting "cliffed-out" on the wrong side of asynchronous callbacks.
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @required {String|Dictionary} codeOrCustomizations
 *           e.g. `"E_USAGE"`
 *                    -OR-
 *                `{ name: 'UsageError', code: 'E_UHOH', machineInstance: foo, errors: [], misc: 'etc' }`
 *
 * @required {Error?} err
 *           e.g. `new Error('Invalid usage: That is not where the quarter is supposed to go.')`
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @returns {Error}
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */

module.exports = function flaverr (codeOrCustomizations, err){

  if (!_.isUndefined(err) && !_.isError(err)) {
    throw new Error('Consistency violation: Unexpected usage of `flaverr()`.  If specified, expected 2nd argument to be an Error instance (but instead got `'+util.inspect(err, {depth: null})+'`)');
  }


  if (_.isString(codeOrCustomizations)) {
    if (err) {
      err.code = codeOrCustomizations;
    }
    else {
      err = new Error('Code: '+codeOrCustomizations);
      err.name = 'AnonymousError';
    }
  }
  else if (_.isObject(codeOrCustomizations) && !_.isArray(codeOrCustomizations) && !_.isFunction(codeOrCustomizations)) {
    if (codeOrCustomizations.stack) { throw new Error('Consistency violation: Unexpected usage of `flaverr()`.  Customizations (dictionary provided as 1st arg) are not allowed to contain a `stack`.'); }

    if (!err){
      if (_.isUndefined(codeOrCustomizations.name)) {
        codeOrCustomizations.name = 'AnonymousError';
      }
      if (_.isUndefined(codeOrCustomizations.message)) {
        codeOrCustomizations.message = util.inspect(codeOrCustomizations, {depth: 5});
      }
      err = new Error(codeOrCustomizations.message);
    }
    else {

      if (codeOrCustomizations.name || codeOrCustomizations.message) {

        if (_.isUndefined(codeOrCustomizations.name)) {
          codeOrCustomizations.name = err.name;
        }
        if (_.isUndefined(codeOrCustomizations.message)) {
          codeOrCustomizations.message = err.message;
        }
        var numCharsToShift = err.name.length + 2 + err.message.length;
        err.stack = codeOrCustomizations.name + ': '+ codeOrCustomizations.message + err.stack.slice(numCharsToShift);
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        // FUTURE: Explore a fancier strategy like this (maybe):
        // ```
        // if (omen && omen._traceReference && Error.captureStackTrace) {
        //   var omen2 = new Error(message);
        //   Error.captureStackTrace(omen2, omen._traceReference);
        //   omen2.name = name;
        //   return omen;
        // }
        // ```
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      }//>-

      _.extend(err, codeOrCustomizations);
    }
  }
  else {
    throw new Error('Consistency violation: Unexpected usage of `flaverr()`.  Expected 1st argument to be either a string error code or a dictionary of customizations (but instead got `'+util.inspect(codeOrCustomizations, {depth: null})+'`)');
  }

  return err;
};
