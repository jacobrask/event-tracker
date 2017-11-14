/* global describe, it, before */

import 'jsdom-global/register';
import chai from 'chai';
import {Scribe} from '../lib/library.js';

chai.expect();

const expect = chai.expect;

let lib;

describe('Given an instance of Scribe library', () => {
  before(() => {
    lib = new Scribe();
  });
  describe('when I need the name', () => {
    it('should return the name', () => {
      expect(lib.name).to.be.equal('Cat');
    });
  });
});

