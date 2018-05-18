/* global describe, it, expect */
/* global EventTracker */

let lib;

describe('Given an instance of EventTracker library', () => {
  before(() => {
    lib = new EventTracker.EventTracker();
  });
  describe('when initialized', () => {
    it('should have a empty outbox', () => {
      expect(lib.outbox.length).to.be.equal(0);
    });
  });
});
