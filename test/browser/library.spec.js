/* global describe, it, expect */
/* global Scribe */

let lib;

describe('Given an instance of Scribe library', () => {
  before(() => {
    lib = new Scribe.Scribe();
  });
  describe('when I need the name', () => {
    it('should return the name', () => {
      expect(lib.name).to.be.equal('Cat');
    });
  });
});
