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
 * Besides improving the quality of your everyday errors and allowing for exception-based switching,
 * you can also use flaverr to build an _omen_, an Error instance defined ahead of time in order to
 * grab a stack trace. (used for providing a better experience when viewing the stack trace of errors
 * that come from one or more asynchronous ticks down the line; e.g. uniqueness errors.)
 *
 * > The "omen" approach is inspired by the implementation originally devised for Waterline:
 * > https://github.com/balderdashy/waterline/blob/6b1f65e77697c36561a0edd06dff537307986cb7/lib/waterline/utils/query/build-omen.js
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @required {String|Dictionary} codeOrCustomizations
 *           e.g. `"E_USAGE"`
 *                    -OR-
 *                `{ name: 'UsageError', code: 'E_UHOH', machineInstance: foo, errors: [], misc: 'etc' }`
 *
 * @optional {Error?} err
 *           If omitted, a new Error will be instantiated instead.
 *           e.g. `new Error('Invalid usage: That is not where the quarter is supposed to go.')`
 *
 * @optional {Function?} caller
 *        An optional function to use for context (useful for building omens)
 *        The stack trace of the omen will be snipped based on the instruction where
 *        this "caller" function was invoked.
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @returns {Error}
 *          An Error instance.
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */

module.exports = function flaverr (codeOrCustomizations, err, caller){

  if (err !== undefined && !_.isError(err)) {
    throw new Error('Unexpected usage of `flaverr()`.  If specified, expected 2nd argument to be an Error instance (but instead got `'+util.inspect(err, {depth: null})+'`)');
  }

  if (caller !== undefined && typeof caller !== 'function') {
    throw new Error('Unexpected usage of `flaverr()`.  If specified, expected 3rd argument should be a function that will be used as a stack trace context (but instead got `'+util.inspect(caller, {depth: null})+'`)');
  }


  if (_.isString(codeOrCustomizations)) {
    if (err) {
      err.code = codeOrCustomizations;
    } else {
      err = new Error('Code: '+codeOrCustomizations);
      err.name = 'AnonymousError';
    }
  }
  else if (_.isObject(codeOrCustomizations) && !_.isArray(codeOrCustomizations) && typeof codeOrCustomizations !== 'function') {
    if (codeOrCustomizations.stack) { throw new Error('Unexpected usage of `flaverr()`.  Customizations (dictionary provided as 1st arg) are not allowed to contain a `stack`.  Instead, use `newErr = flaverr({ name: original.name, message: original.message }, omen)`'); }
    // if (codeOrCustomizations.stack) { throw new Error('Unexpected usage of `flaverr()`.  Customizations (dictionary provided as 1st arg) are not allowed to contain a `stack`.  Instead, use `flaverr.traceFrom(omen, err)`'); }

    if (!err){
      if (codeOrCustomizations.name === undefined) {
        codeOrCustomizations.name = 'AnonymousError';
      }
      if (codeOrCustomizations.message === undefined) {
        codeOrCustomizations.message = util.inspect(codeOrCustomizations, {depth: 5});
      }

      err = new Error(codeOrCustomizations.message);
    } else {

      if (codeOrCustomizations.name || codeOrCustomizations.message) {

        if (codeOrCustomizations.name === undefined) {
          codeOrCustomizations.name = err.name;
        }
        if (codeOrCustomizations.message === undefined) {
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
      }//ﬁ

    }//ﬁ

    // Always merge in the customizations, whether this is an existing error or a new one.
    _.extend(err, codeOrCustomizations);

  }
  else {
    throw new Error('Unexpected usage of `flaverr()`.  Expected 1st argument to be either a string error code or a dictionary of customizations (but instead got `'+util.inspect(codeOrCustomizations, {depth: null})+'`)');
  }


  // If a `caller` reference was provided, then use it to adjust the stack trace.
  // (Note that we silently skip this step if the `Error.captureStackTrace` is missing
  // on the currently-running platform)
  if (caller && Error.captureStackTrace) {
    Error.captureStackTrace(err, caller);
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // FUTURE: maybe do something fancier here, or where this is called, to keep track of the omen so
    // that it can support both sorts of usages (Deferred and explicit callback.)
    //
    // This way, it could do an even better job of reporting exactly where the error came from in
    // userland code as the very first entry in the stack trace.  e.g.
    // ```
    // Error.captureStackTrace(omen, Deferred.prototype.exec);
    // // ^^ but would need to pass through the original omen or something
    // ```
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  }//ﬁ

  return err;
};//ƒ



/**
 * flaverr.getBareTrace()
 *
 * Return the bare stack trace of an Error, with the identifying `name`/colon/space/`message`
 * preamble trimmed off, leaving only the info about stack frames.
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Note:
 * While this function may have other uses, it was designed as a simple way of including
 * a stack trace in console warning messages.
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *
 * @param  {Error?} err   [If unspecified, a new Error will be instantiated on the fly and its stack will be used.]
 * @return {String}
 */

module.exports.getBareTrace = function (err){
  if (err === undefined){ err = new Error(); }
  if (!_.isError(err)){ throw new Error('Unexpected usage of `getBareTrace()`.  If an argument is supplied, it must be an Error instance.  Instead, got: '+util.inspect(err, {depth: 5})); }

  var bareTrace = err.stack;
  var numCharsToShift = err.name.length + 2 + err.message.length;
  bareTrace = bareTrace.slice(numCharsToShift);
  bareTrace = bareTrace.replace(/^[\n]+/g,'');
  return bareTrace;
};




// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// FUTURE: Additionally, this additional layer of wrapping could take care of improving
// stack traces, even in the case where an Error comes up from inside the implementation.
// If done carefully, this can be done in a way that protects characteristics of the
// internal Error (e.g. its "code", etc.), while also providing a better stack trace.
//
// For example, something like this:
// ```
// /**
//  * flaverr.traceFrom()
//  *
//  * Return a modified version of the specified error.
//  *
//  */
// module.exports.traceFrom = function (omen, err) {
//   var relevantPropNames = _.difference(
//     _.union(
//       ['name', 'message'],
//       Object.getOwnPropertyNames(err)
//     ),
//     ['stack']
//   );
//   var errTemplate = _.pick(err, relevantPropNames);
//   errTemplate.raw = err;//<< could override stuff-- that's ok (see below).
//   var _mainFlaverrFn = module.exports;
//   var newError = _mainFlaverrFn(errTemplate, omen);
//   return newError;
// };
// ```
// > Note that, above, we also kept the original error (and thus _its_ trace) and
// > attached that as a separate property.  If the original error already has "raw",
// > that's ok.  This is one thing that it makes sense for us to mutate-- and any
// > attempt to do otherwise would probably be more confusing (you can imagine a `while`
// > loop where we add underscores in front of the string "raw" ad infinitum, and then
// > eventually, when there are no conflicts, use that as a keyname.  But again, that
// > ends up being more confusing from a userland perspective.)
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Why not `flaverr.try()`?
//
// Turns out it'd be a bit of a mess.
//
// More history / background:
// https://gist.github.com/mikermcneil/c1bc2d57f5bedae810295e5ed8c5f935
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


