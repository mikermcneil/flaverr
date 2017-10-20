describe('flaverr.parseError()', ()=>{

  describe('given a normal Error instance', ()=>{
    it('should return the same Error instance');
  });

  describe('given a bluebird/promise error thing', ()=>{
    it('should return the internal, wrapped Error instance as expected');
  });

  describe('given a Stripe SDK error thing', ()=>{
    it('should return the internal, wrapped Error instance as expected');
  });

});
