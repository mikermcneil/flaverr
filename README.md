# flaverr

Flavor an Error instance with the specified error code string or dictionary of customizations.


## Installation &nbsp; [![NPM version](https://badge.fury.io/js/flaverr.svg)](http://badge.fury.io/js/flaverr)

```bash
$ npm install flaverr --save --save-exact
```


## Usage

- If you provide a string as the first argument, that string will be set as the Error's `code`.
- If you provide a dictionary as the first argument, that dictionary's keys will get folded into the Error as properties.


#### Attach an error code

```javascript
const flaverr = require('flaverr');

var err = flaverr('notFound', new Error('Could not find user with the specified id.'));
// => assert(err.code === 'notFound' && err.message === 'Could not find user with the specified id.')
// => assert(err.constructor.name === 'Error')
```

#### Attach arbitrary properties

```javascript
const flaverr = require('flaverr');

var err = flaverr({
  code: 'notFound',
  output: { foo: 'bar' }
}, new Error('Could not find user with the specified id.'));
// => assert(err.code === 'notFound' && err.message === 'Could not find user with the specified id.')
// => assert(err.constructor.name === 'Error')
```


## A few examples of common use cases

#### Tagging an error with a code before sending it through an asynchronous callback

```javascript
if (err) { return done(err); }
if (!user) {
  return done(flaverr('notFound', new Error('Could not find a user with that id (`'+req.param('id')+'`).')));
}
```


#### In a `try` statement

```javascript
try {
  _.each(paths, function (thisPath) {
    var isDirectory = fs.statFileSync(path.resolve(thisPath)).isDirectory();
    if (!isDirectory) {
      throw flaverr('notADirectory', new Error('One of the provided paths (`'+path.resolve(thisPath)+'`) points to something other than a directory.'));
    }
  });
} catch (e) {
  switch (e.code) {
    case 'ENOENT': return exits.notFound();
    case 'notADirectory': return exits.invalidPath(e);
    default: return exits.error(e);
  }
}
```

#### In an asynchronous loop

```javascript
async.eachSeries(userRecords, function (user, next) {

  if (user.pets.length === 0) {
    return next(flaverr('noPets', new Error('User (`'+user.id+'`) has no pets yet!')));
  }

  if (!user.hobby) {
    return next(flaverr('noHobby', new Error('Consistency violation: User (`'+user.id+'`) has no hobby!')));
  }

  async.each(user.pets, function (pet, next){
    Pet.update().where({ id: pet.id })
    .set({ likelyHobby: user.hobby })
    .exec(next);
  }, function (err){
    if (err) { return next(err); }
    if (err.code === 'E_UNIQUE') { return next(flaverr('nonUniquePetHobby', err)); }
    return next();
  });

}, function afterwards(err) {
  if (err) {
    switch (err.code) {
      case 'noPets': return res.send(409, err.message);
      case 'noHobby': return res.serverError(err);
      case 'nonUniquePetHobby': return res.send(409, 'A pet already exists with that hobby.');
      default: return res.serverError(err);
    }
  }//--•

  return res.ok();
});
```


## Advanced

So, `flaverr()` can be used for more than just flavoring Error instances.

Some of this stuff is pretty low-level, and intended to be used in building higher level libraries (not necessarily from app-level Node.js or browser JavaScript code).

But in the interest of completeness, here's what you can do:


#### flaverr(…, …, caller)

If an optional third argument is passed in, it is understood as the caller-- i.e. the function where you called `flaverr()`.  If provided, this function will be used to improve the stack trace of the provided error.

**This is particularly useful for customizing a stack trace; e.g. for building better omens.**  _By "omen", I mean an Error instance instantiated at an earlier time, so that when you use it at a later time, it has the right stack trace, and hasn't been "cliffed out" at an EventEmitter, setTimeout, setImmediate, etc._

> Note: This is not a particularly speedy operation in JavaScript!  For most usages, it won't matter at all.  But for very hot code paths, or use cases that are highly sensitive to performance, you should consider avoiding this feature-- at least some of the time.
>
> For example, in parts of [Waterline ORM](http://waterlinejs.org) and the [machine runner](http://node-machine.org), this argument is omitted when running in a production environment:
> ```js
> var omen;
> if (process.env.NODE_ENV==='production') {
>   omen = flaverr()
> }
> else {
>   omen = flaverr(new Error(), theCurrentFunction);
> }
>
> //…
>
> return done(flaverr({}, omen));
> ```

In the example above, the stack trace of our omen will be snipped based on the instruction where this was invoked (i.e. whatever called "theCurrentFunction").



#### flaverr.getBareTrace()

Return the bare stack trace string of an Error, with the identifying preamble (`.name` + colon + space + `.message`) trimmed off, leaving only the info about stack frames.

**This is particularly useful for warning messages, and situations where you might want an error to contain more than one trace.**


```js
var err = new Error('Some error');

flaverr.getBareTrace(err);
//=>
//'    at repl:1:28\n    at ContextifyScript.Script.runInThisContext (vm.js:44:33)\n    at REPLServer.defaultEval (repl.js:239:29)\n    at bound (domain.js:301:14)\n    at REPLServer.runBound [as eval] (domain.js:314:12)\n    at REPLServer.onLine (repl.js:433:10)\n    at emitOne (events.js:120:20)\n    at REPLServer.emit (events.js:210:7)\n    at REPLServer.Interface._onLine (readline.js:278:10)\n    at REPLServer.Interface._line (readline.js:625:8)'
```

If nothing is passed in, a new Error will be instantiated on the fly and its stack will be used:

```js
flaverr.getBareTrace();
//=>
//'    at repl:1:28\n    at ContextifyScript.Script.runInThisContext (vm.js:44:33)\n    at REPLServer.defaultEval (repl.js:239:29)\n    at bound (domain.js:301:14)\n    at REPLServer.runBound [as eval] (domain.js:314:12)\n    at REPLServer.onLine (repl.js:433:10)\n    at emitOne (events.js:120:20)\n    at REPLServer.emit (events.js:210:7)\n    at REPLServer.Interface._onLine (readline.js:278:10)\n    at REPLServer.Interface._line (readline.js:625:8)'
```


Here is a more real-world example lifted straight out of [parley](https://npmjs.com/package/parley):

```javascript
// Implementorland spinlock
if (self._hasFinishedExecuting) {
  console.warn(
    '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -\n'+
    'WARNING: Something seems to be wrong with this function.\n'+
    'It is trying to signal that it has finished AGAIN, after\n'+
    'already resolving/rejecting once.\n'+
    '(silently ignoring this...)\n'+
    '\n'+
    'To assist you in hunting this down, here is a stack trace:\n'+
    '```\n'+
    flaverr.getBareTrace(self._omen)+'\n'+
    '```\n'+
    '\n'+
    ' [?] For more help, visit https://sailsjs.com/support\n'+
    '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -'
  );
  return;
}
```


## License

MIT &copy; 2016, 2017 Mike McNeil

