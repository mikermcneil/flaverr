describe('flaverr()', ()=>{

  describe('overriding an existing Error\'s `.code`', ()=>{
    it('should work with `flaverr({code: \'…\'},err)`');
    it('should work with `flaverr(\'…\',err)`');
  });

  describe('adding/overriding other miscellaneous properties of an existing Error', ()=>{
    it('should work');
  });

  describe('constructing a new Error', ()=>{
    it('should work');
    it('should get expected customizations');
    it('should have `.name === \'Error\'` by default');
  });

  describe('overriding an existing Error\'s `.name`', ()=>{
    it('should work');
    it('should also impact the `.stack`');
  });

  describe('overriding an existing Error\'s `.message`', ()=>{
    it('should work');
    it('should also impact the `.stack`');
  });

  describe('attempting to set an Error\'s `.stack`', ()=>{
    it('should fail');
  });

  describe('using `flaverr(…,…,caller)` to improve the stack trace', ()=>{
    it('should work');
    it('should properly modify stack trace');
  });

});
