require('jsdom-global')();
var should = require('chai').should();
var sbgnjs = require('../libsbgn');

describe('libsbgn', function() {
  describe('sbgn', function() {
  	describe('parse from XML', function() {
  		function getXmlObj(string) {
  			return new window.DOMParser().parseFromString(string, "text/xml").querySelector('sbgn');
  		};
	    it('should parse empty', function() {
	    	var sbgn = sbgnjs.Sbgn.fromXML(getXmlObj("<sbgn></sbgn>"));
	    	should.not.exist(sbgn.xmlns);
	    	should.not.exist(sbgn.map);
	    });
	    it('should parse xmlns', function() {
	    	var sbgn = sbgnjs.Sbgn.fromXML(getXmlObj("<sbgn xmlns='a'></sbgn>"));
	    	should.exist(sbgn.xmlns);
	    	sbgn.xmlns.should.equal('a');
	    	should.not.exist(sbgn.map);
	    });
	    it('should parse map', function() {
	    	var sbgn = sbgnjs.Sbgn.fromXML(getXmlObj("<sbgn><map></map></sbgn>"));
	    	should.not.exist(sbgn.xmlns);
	    	should.exist(sbgn.map);
	    	sbgn.map.should.be.a('object');
	    });
	});
  });

  describe('map', function() {
  	describe('parse from XML', function() {
  		function getXmlObj(string) {
  			return new window.DOMParser().parseFromString(string, "text/xml").querySelector('map');
  		};
  	});
  });
});

