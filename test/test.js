require('jsdom-global')();
var should = require('chai').should();
var sbgnjs = require('../libsbgn');
var renderExt = require('../libsbgn-render-ext');

describe('libsbgn', function() {
	function getSpecificXmlObj(string, name) {
		return new window.DOMParser().parseFromString(string, "text/xml").querySelector(name);
	};
	describe('sbgn', function() {
		describe('parse from XML', function() {
			function getXmlObj(string) {
				return new window.DOMParser().parseFromString(string, "text/xml").querySelector('sbgn');
			};
		    it('should parse empty', function() {
		    	var sbgn = sbgnjs.Sbgn.fromXML(getXmlObj("<sbgn></sbgn>"));
		    	sbgn.should.have.ownProperty('xmlns');
		    	should.equal(sbgn.xmlns, null);
		    	sbgn.should.have.ownProperty('map');
		    	should.equal(sbgn.map, null);
		    });
		    it('should parse xmlns', function() {
		    	var sbgn = sbgnjs.Sbgn.fromXML(getXmlObj("<sbgn xmlns='a'></sbgn>"));
		    	should.exist(sbgn.xmlns);
		    	sbgn.xmlns.should.equal('a');
		    });
		    it('should parse map', function() {
		    	var sbgn = sbgnjs.Sbgn.fromXML(getXmlObj("<sbgn><map></map></sbgn>"));
		    	should.exist(sbgn.map);
		    	sbgn.map.should.be.a('object');
		    	sbgn.map.should.be.instanceOf(sbgnjs.Map);
		    });
		});
		describe('write to XML', function() {
			it('should write empty sbgn', function() {
				var sbgn = new sbgnjs.Sbgn();
				sbgn.toXML().should.equal("<sbgn>\n</sbgn>\n");
			});
			it('should write complete sbgn with empty map', function() {
				var sbgn = new sbgnjs.Sbgn("a");
				sbgn.setMap(new sbgnjs.Map());
				sbgn.toXML().should.equal("<sbgn xmlns='a'>\n<map>\n</map>\n</sbgn>\n");
			});
		});
	});

	describe('map', function() {
		describe('parse from XML', function() {
			function getXmlObj(string) {
				return new window.DOMParser().parseFromString(string, "text/xml").querySelector('map');
			};
			it('should parse empty', function() {
		    	var map = sbgnjs.Map.fromXML(getXmlObj("<map></map>"));
		    	map.should.have.ownProperty('id');
		    	should.equal(map.id, null);
		    	map.should.have.ownProperty('language');
		    	should.equal(map.language, null);
		    	map.should.have.ownProperty('extension');
		    	should.equal(map.extension, null);
		    	map.should.have.ownProperty('glyphs');
		    	map.glyphs.should.have.length(0);
		    	map.should.have.ownProperty('arcs');
		    	map.arcs.should.have.length(0);
		    });
		    it('should parse id', function() {
		    	var map = sbgnjs.Map.fromXML(getXmlObj("<map id='a'></map>"));
		    	should.exist(map.id);
		    	map.id.should.equal('a');
		    });
		    it('should parse language', function() {
		    	var map = sbgnjs.Map.fromXML(getXmlObj("<map language='a'></map>"));
		    	should.exist(map.language);
		    	map.language.should.equal('a');
		    });
		    it('should parse extension', function() {
		    	var map = sbgnjs.Map.fromXML(getXmlObj("<map><extension></extension></map>"));
		    	should.exist(map.extension);
		    	map.extension.should.be.a('object');
		    	map.extension.should.be.instanceOf(sbgnjs.Extension);
		    });
		    it('parse 2 empty glyphs', function() {
		    	var map = sbgnjs.Map.fromXML(getXmlObj("<map><glyph></glyph><glyph></glyph></map>"));
		    	map.glyphs.should.have.length(2);
		    	should.exist(map.glyphs[0]);
		    	map.glyphs[0].should.be.instanceOf(sbgnjs.Glyph);
		    	should.exist(map.glyphs[1]);
		    	map.glyphs[1].should.be.instanceOf(sbgnjs.Glyph);
		    });
		    it('parse 2 empty arcs', function() {
		    	var map = sbgnjs.Map.fromXML(getXmlObj("<map><arc></arc><arc></arc></map>"));
		    	map.arcs.should.have.length(2);
		    	should.exist(map.arcs[0]);
		    	map.arcs[0].should.be.instanceOf(sbgnjs.Arc);
		    	should.exist(map.arcs[1]);
		    	map.arcs[1].should.be.instanceOf(sbgnjs.Arc);
		    });
		});
		describe('write to XML', function() {
			it('should write empty map', function() {
				var map = new sbgnjs.Map();
				map.toXML().should.equal("<map>\n</map>\n");
			});
			it('should write complete map with empty stuff', function() {
				var map = new sbgnjs.Map("id", "language");
				map.setExtension(new sbgnjs.Extension());
				map.addGlyph(new sbgnjs.Glyph());
				map.addArc(new sbgnjs.Arc());
				map.toXML().should.equal("<map id='id' language='language'>\n<extension>\n</extension>\n</map>\n");
			});
		});
	});
	describe('extension', function() {
		function getXmlObj(string) {
			return new window.DOMParser().parseFromString(string, "text/xml").querySelector('extension');
		};
		describe('parse from XML', function() {
			it('should parse empty', function () {
				var extension = sbgnjs.Extension.fromXML(getXmlObj('<extension></extension>'));
				extension.should.have.ownProperty('list');
				extension.list.should.be.a('object');
			});
			it('should parse 2 extensions', function() {
				var extension = sbgnjs.Extension.fromXML(getXmlObj('<extension><a></a><b></b></extension>'));
				extension.list.should.have.ownProperty('a');
				extension.list.should.have.ownProperty('b');
			});
		});
		describe('test extension functions', function() {
			it('add new extension', function() {
				var extension = sbgnjs.Extension.fromXML(getXmlObj('<extension></extension>'));
				var extA = getSpecificXmlObj('<a></a>', 'a');
				extension.add(extA);
				extension.list.should.have.ownProperty('a');
				extension.list.a.should.equal(extA);
			});
			it('get extension', function() {
				var extension = sbgnjs.Extension.fromXML(getXmlObj('<extension><a></a></extension>'));
				extension.get('a').tagName.should.equal('a');
				should.not.exist(extension.get('b'));
			});
			it('has extension', function() {
				var extension = sbgnjs.Extension.fromXML(getXmlObj('<extension><a></a></extension>'));
				extension.has('a').should.equal(true);
				extension.has('b').should.equal(false);
			});
		});
		describe('write to XML', function () {
			it('should write empty extension', function () {
				var extension = new sbgnjs.Extension();
				extension.toXML().should.equal("<extension>\n</extension>\n");
			});
			// cannot be tested, due to XMLSerializer (used for unknown extensions) not existing outside browsers
			/*it('should write multiple extensions', function () {
				var extension = new sbgnjs.Extension();
				extension.add(getSpecificXmlObj('<a></a>', 'a'));
				extension.toXML().should.equal("<extension>\n<a>\n</a>\n</extension>\n");
			});*/
			it('should write render extension', function() {
				var extension = new sbgnjs.Extension();
				extension.add(getSpecificXmlObj('<renderInformation></renderInformation>', 'renderInformation'));
				extension.toXML().should.equal("<extension>\n<renderInformation xmlns='"+renderExt.xmlns+"'>\n</renderInformation>\n</extension>\n");
			});
		});
	});
	describe('label', function() {
		function getXmlObj(string) {
			return new window.DOMParser().parseFromString(string, "text/xml").querySelector('label');
		};
		it('should parse empty', function() {
			var label = sbgnjs.Label.fromXML(getXmlObj("<label />"));
			label.should.have.ownProperty('text');
	    	should.equal(label.text, null);
		});
		it('should parse complete', function() {
			var label = sbgnjs.Label.fromXML(getXmlObj("<label text='some text' />"));
			should.exist(label.text);
			label.text.should.equal('some text');
		});
		it('should write empty', function() {
			var label = new sbgnjs.Label();
			label.toXML().should.equal('<label />\n');
		});
		it('should write complete', function() {
			var label = new sbgnjs.Label('some text');
			label.toXML().should.equal("<label text='some text' />\n");
		});
	});
	describe('bbox', function() {
		function getXmlObj(string) {
			return new window.DOMParser().parseFromString(string, "text/xml").querySelector('bbox');
		};
		it('should parse empty', function() {
			var bbox = sbgnjs.Bbox.fromXML(getXmlObj("<bbox />"));
			bbox.should.have.ownProperty('x');
	    	bbox.x.should.be.NaN;
	    	bbox.should.have.ownProperty('y');
	    	bbox.y.should.be.NaN;
	    	bbox.should.have.ownProperty('w');
	    	bbox.w.should.be.NaN;
	    	bbox.should.have.ownProperty('h');
	    	bbox.h.should.be.NaN;
		});
		it('should parse complete', function() {
			var bbox = sbgnjs.Bbox.fromXML(getXmlObj("<bbox x='1' y='2' w='3.1416' h='4' />"));
			should.exist(bbox.x);
			bbox.x.should.equal(1);
			should.exist(bbox.y);
			bbox.y.should.equal(2);
			should.exist(bbox.w);
			bbox.w.should.equal(3.1416);
			should.exist(bbox.h);
			bbox.h.should.equal(4);
		});
		it('should write empty', function() {
			var bbox = new sbgnjs.Bbox();
			bbox.toXML().should.equal('<bbox />\n');
		});
		it('should write complete', function() {
			var bbox = new sbgnjs.Bbox(1, 2, 3.1416, 4);
			bbox.toXML().should.equal("<bbox x='1' y='2' w='3.1416' h='4' />\n");
		});
	});
	describe('port', function() {
		function getXmlObj(string) {
			return new window.DOMParser().parseFromString(string, "text/xml").querySelector('port');
		};
		it('should parse empty', function() {
			var port = sbgnjs.Port.fromXML(getXmlObj("<port />"));
			port.should.have.ownProperty('id');
	    	should.equal(port.id, null);
			port.should.have.ownProperty('x');
	    	port.x.should.be.NaN;
	    	port.should.have.ownProperty('y');
	    	port.y.should.be.NaN;
		});
		it('should parse complete', function() {
			var port = sbgnjs.Port.fromXML(getXmlObj("<port id='id' x='1.25' y='2' />"));
			should.exist(port.id);
			port.id.should.equal('id');
			should.exist(port.x);
			port.x.should.equal(1.25);
			should.exist(port.y);
			port.y.should.equal(2);
		});
		it('should write empty', function() {
			var port = new sbgnjs.Port();
			port.toXML().should.equal('<port />\n');
		});
		it('should write complete', function() {
			var port = new sbgnjs.Port('id', 2, 3.1416);
			port.toXML().should.equal("<port id='id' x='2' y='3.1416' />\n");
		});
	});
	describe('bbox', function() {
		function getXmlObj(string) {
			return new window.DOMParser().parseFromString(string, "text/xml").querySelector('bbox');
		};
		it('should parse empty', function() {
			var bbox = sbgnjs.Bbox.fromXML(getXmlObj("<bbox />"));
			bbox.should.have.ownProperty('x');
	    	bbox.x.should.be.NaN;
	    	bbox.should.have.ownProperty('y');
	    	bbox.y.should.be.NaN;
	    	bbox.should.have.ownProperty('w');
	    	bbox.w.should.be.NaN;
	    	bbox.should.have.ownProperty('h');
	    	bbox.h.should.be.NaN;
		});
		it('should parse complete', function() {
			var bbox = sbgnjs.Bbox.fromXML(getXmlObj("<bbox x='1' y='2' w='3.1416' h='4' />"));
			should.exist(bbox.x);
			bbox.x.should.equal(1);
			should.exist(bbox.y);
			bbox.y.should.equal(2);
			should.exist(bbox.w);
			bbox.w.should.equal(3.1416);
			should.exist(bbox.h);
			bbox.h.should.equal(4);
		});
		it('should write empty', function() {
			var bbox = new sbgnjs.Bbox();
			bbox.toXML().should.equal('<bbox />\n');
		});
		it('should write complete', function() {
			var bbox = new sbgnjs.Bbox(1, 2, 3.1416, 4);
			bbox.toXML().should.equal("<bbox x='1' y='2' w='3.1416' h='4' />\n");
		});
	});
	describe('start type', function() {
		function getXmlObj(string) {
			return new window.DOMParser().parseFromString(string, "text/xml").querySelector('start');
		};
		it('should parse empty', function() {
			var start = sbgnjs.StartType.fromXML(getXmlObj("<start />"));
			start.should.have.ownProperty('x');
	    	start.x.should.be.NaN;
	    	start.should.have.ownProperty('y');
	    	start.y.should.be.NaN;
		});
		it('should parse complete', function() {
			var start = sbgnjs.Bbox.fromXML(getXmlObj("<start x='1' y='2' />"));
			should.exist(start.x);
			start.x.should.equal(1);
			should.exist(start.y);
			start.y.should.equal(2);
		});
		it('should write empty', function() {
			var start = new sbgnjs.StartType();
			start.toXML().should.equal('<start />\n');
		});
		it('should write complete', function() {
			var start = new sbgnjs.StartType(1, 2);
			start.toXML().should.equal("<start x='1' y='2' />\n");
		});
	});
	describe('end type', function() {
		function getXmlObj(string) {
			return new window.DOMParser().parseFromString(string, "text/xml").querySelector('end');
		};
		it('should parse empty', function() {
			var end = sbgnjs.EndType.fromXML(getXmlObj("<end />"));
			end.should.have.ownProperty('x');
	    	end.x.should.be.NaN;
	    	end.should.have.ownProperty('y');
	    	end.y.should.be.NaN;
		});
		it('should parse complete', function() {
			var end = sbgnjs.Bbox.fromXML(getXmlObj("<end x='1' y='2' />"));
			should.exist(end.x);
			end.x.should.equal(1);
			should.exist(end.y);
			end.y.should.equal(2);
		});
		it('should write empty', function() {
			var end = new sbgnjs.EndType();
			end.toXML().should.equal('<end />\n');
		});
		it('should write complete', function() {
			var end = new sbgnjs.EndType(1, 2);
			end.toXML().should.equal("<end x='1' y='2' />\n");
		});
	});
	describe('next type', function() {
		function getXmlObj(string) {
			return new window.DOMParser().parseFromString(string, "text/xml").querySelector('next');
		};
		it('should parse empty', function() {
			var next = sbgnjs.NextType.fromXML(getXmlObj("<next />"));
			next.should.have.ownProperty('x');
	    	next.x.should.be.NaN;
	    	next.should.have.ownProperty('y');
	    	next.y.should.be.NaN;
		});
		it('should parse complete', function() {
			var next = sbgnjs.Bbox.fromXML(getXmlObj("<next x='1' y='2' />"));
			should.exist(next.x);
			next.x.should.equal(1);
			should.exist(next.y);
			next.y.should.equal(2);
		});
		it('should write empty', function() {
			var next = new sbgnjs.NextType();
			next.toXML().should.equal('<next />\n');
		});
		it('should write complete', function() {
			var next = new sbgnjs.NextType(1, 2);
			next.toXML().should.equal("<next x='1' y='2' />\n");
		});
	});

	describe('glyph', function() {
		describe('parse from XML', function() {
			function getXmlObj(string) {
				return new window.DOMParser().parseFromString(string, "text/xml").querySelector('glyph');
			};
		    it('should parse empty', function() {
		    	var glyph = sbgnjs.Glyph.fromXML(getXmlObj("<glyph></glyph>"));
		    	glyph.should.have.ownProperty('id');
		    	should.equal(glyph.id, null);
		    	glyph.should.have.ownProperty('class_');
		    	should.equal(glyph.class_, null);
		    	glyph.should.have.ownProperty('compartmentRef');
		    	should.equal(glyph.compartmentRef, null);

		    	glyph.should.have.ownProperty('label');
		    	should.equal(glyph.label, null);
		    	glyph.should.have.ownProperty('bbox');
		    	should.equal(glyph.bbox, null);
		    	glyph.should.have.ownProperty('glyphMembers');
		    	glyph.glyphMembers.should.have.length(0);
		    	glyph.should.have.ownProperty('ports');
		    	glyph.ports.should.have.length(0);
		    });
		   	it('should parse attributes', function() {
		    	var glyph = sbgnjs.Glyph.fromXML(getXmlObj("<glyph id='id' class='class' compartmentRef='ref'></glyph>"));
		    	should.exist(glyph.id);
		    	glyph.id.should.equal('id');
		    	should.exist(glyph.class_);
		    	glyph.class_.should.equal('class');
		    	should.exist(glyph.compartmentRef);
		    	glyph.compartmentRef.should.equal('ref');
		    });
		    it('should parse label child', function() {
		    	var glyph = sbgnjs.Glyph.fromXML(getXmlObj("<glyph><label></label></glyph>"));
		    	should.exist(glyph.label);
		    	glyph.label.should.be.a('object');
		    	glyph.label.should.be.instanceOf(sbgnjs.Label);
		    });
		    it('should parse bbox child', function() {
		    	var glyph = sbgnjs.Glyph.fromXML(getXmlObj("<glyph><bbox></bbox></glyph>"));
		    	should.exist(glyph.bbox);
		    	glyph.bbox.should.be.a('object');
		    	glyph.bbox.should.be.instanceOf(sbgnjs.Bbox);
		    });
		    it('should parse nested glyph child', function() {
		    	var glyph = sbgnjs.Glyph.fromXML(getXmlObj("<glyph><glyph></glyph></glyph>"));
		    	should.exist(glyph.glyphMembers);
		    	glyph.glyphMembers.should.be.a('array');
		    	glyph.glyphMembers.should.have.lengthOf(1);
		    	glyph.glyphMembers[0].should.be.instanceOf(sbgnjs.Glyph);
		    });
		    it('should parse nested glyph child 2 levels', function() {
		    	var glyph = sbgnjs.Glyph.fromXML(getXmlObj("<glyph><glyph><glyph></glyph></glyph></glyph>"));
		    	should.exist(glyph.glyphMembers);
		    	glyph.glyphMembers.should.be.a('array');
		    	glyph.glyphMembers.should.have.lengthOf(1);
		    	glyph.glyphMembers[0].should.be.instanceOf(sbgnjs.Glyph);
		    	should.exist(glyph.glyphMembers[0].glyphMembers);
		    	glyph.glyphMembers[0].glyphMembers.should.be.a('array');
		    	glyph.glyphMembers[0].glyphMembers.should.have.lengthOf(1);
		    	glyph.glyphMembers[0].glyphMembers[0].should.be.instanceOf(sbgnjs.Glyph);
		    });
		    it('should parse port child', function() {
		    	var glyph = sbgnjs.Glyph.fromXML(getXmlObj("<glyph><port></port></glyph>"));
		    	should.exist(glyph.ports);
		    	glyph.ports.should.be.a('array');
		    	glyph.ports.should.have.lengthOf(1);
		    	glyph.ports[0].should.be.instanceOf(sbgnjs.Port);
		    });
		});
		/*describe('write to XML', function() {
			it('should write empty sbgn', function() {
				var sbgn = new sbgnjs.Sbgn();
				sbgn.toXML().should.equal("<sbgn>\n</sbgn>\n");
			});
			it('should write complete sbgn with empty map', function() {
				var sbgn = new sbgnjs.Sbgn("a");
				sbgn.setMap(new sbgnjs.Map());
				sbgn.toXML().should.equal("<sbgn xmlns='a'>\n<map>\n</map>\n</sbgn>\n");
			});
		});*/
	});
});

