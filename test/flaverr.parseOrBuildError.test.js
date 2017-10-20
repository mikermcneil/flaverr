describe('flaverr.parseOrBuildError()', ()=>{

  describe('given a normal Error instance', ()=>{
    it('should return the same Error instance');
  });

  describe('given a bluebird/promise error thing', ()=>{
    it('should return the internal, wrapped Error instance as expected');
  });

  describe('given a Stripe SDK error thing', ()=>{
    it('should return the internal, wrapped Error instance as expected');
  });

  describe('given a miscellaneous string', ()=>{
    it('should return an Error instance that uses that value as its message');
  });

  describe('given `\'\'` (empty string)', ()=>{
    it('should return an Error instance that uses a reasonable, pretty-printed string representation of that value as its message');
  });

  describe('given `null`', ()=>{
    it('should return an Error instance that uses a reasonable, pretty-printed string representation of that value as its message');
  });

  describe('given `undefined`', ()=>{
    it('should return an Error instance that uses a reasonable, pretty-printed string representation of that value as its message');
  });

  describe('given a miscellaneous number', ()=>{
    it('should return an Error instance that uses a reasonable, pretty-printed string representation of that value as its message');
  });

  describe('given Infinity', ()=>{
    it('should return an Error instance that uses a reasonable, pretty-printed string representation of that value as its message');
  });

  describe('given NaN', ()=>{
    it('should return an Error instance that uses a reasonable, pretty-printed string representation of that value as its message');
  });

  describe('given `0` (zero)', ()=>{
    it('should return an Error instance that uses a reasonable, pretty-printed string representation of that value as its message');
  });

  describe('given `false`', ()=>{
    it('should return an Error instance that uses a reasonable, pretty-printed string representation of that value as its message');
  });

  describe('given `true`', ()=>{
    it('should return an Error instance that uses a reasonable, pretty-printed string representation of that value as its message');
  });

  describe('given a dictionary', ()=>{
    it('should return an Error instance that uses a reasonable, pretty-printed string representation of that value as its message');
  });

  describe('given a array', ()=>{
    it('should return an Error instance that uses a reasonable, pretty-printed string representation of that value as its message');
  });

  describe('given a function', ()=>{
    it('should return an Error instance that uses a reasonable, pretty-printed string representation of that value as its message');
  });

  describe('given something truly evil (circular)', ()=>{
    it('should return an Error instance that uses a reasonable, pretty-printed string representation of that value as its message');
  });

  describe('given a Buffer', ()=>{
    it('should return an Error instance that uses a pretty-printed string representation of that value as its message');
  });

  describe('given a Stream', ()=>{
    it('should return an Error instance that uses a pretty-printed string representation of that value as its message');
  });

});
