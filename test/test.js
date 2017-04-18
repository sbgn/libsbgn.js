require('jsdom-global')();
var should = require('chai').should();
var sbgnjs = require('../libsbgn');
var renderExt = require('../libsbgn-render-ext');
var checkParams = require('../utilities').checkParams;

describe('utilities', function() {
	describe('checkParams', function() {
		it('should return empty object if undefined or null', function() {
			checkParams(undefined, []).should.deep.equal({});
			checkParams(null, []).should.deep.equal({});
		});
		it('should populate object with given args if undefined or null', function() {
			checkParams(undefined, ['a', 'b']).should.deep.equal({'a': null, 'b': null});
			checkParams(null, ['a', 'b']).should.deep.equal({'a': null, 'b': null});
		});
		it('should throw error if param is not an object and not undefined or null', function() {
			var test1 = function(){checkParams('', [])};
			var test2 = function(){checkParams(0, [])};
			var test3 = function(){checkParams({}, [])};
			test1.should.throw(Error);
			test2.should.throw(Error);
			test3.should.not.throw(Error);
		});
		it('should give back params as they are passed', function() {
			checkParams({
				'a': 1,
				'b': 'test',
				'c': null,
				'd': NaN},
				['a', 'b', 'c', 'd']).should.deep.equal({
					'a': 1,
					'b': 'test',
					'c': null,
					'd': NaN,
				});
		});
	});
});

describe('libsbgn', function() {
	function getSpecificXmlObj(string, name) {
		return new window.DOMParser().parseFromString(string, "text/xml").querySelector(name);
	};
	function getXmlObj(string) {
		return new window.DOMParser().parseFromString(string, "text/xml").documentElement;
	};

	describe('sbgn', function() {
		describe('parse from XML', function() {
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
				should.equal(sbgn.xmlns, null);
				should.equal(sbgn.map, null);
				sbgn.toXML().should.equal("<sbgn>\n</sbgn>\n");
			});
			it('should write complete sbgn with empty map', function() {
				var sbgn = new sbgnjs.Sbgn({'xmlns': "a"});
				sbgn.setMap(new sbgnjs.Map());
				sbgn.toXML().should.equal("<sbgn xmlns='a'>\n<map>\n</map>\n</sbgn>\n");
			});
			it('edge case should consider xmlns of 0', function() {
				var sbgn = new sbgnjs.Sbgn({'xmlns': 0});
				sbgn.setMap(new sbgnjs.Map());
				sbgn.toXML().should.equal("<sbgn xmlns='0'>\n<map>\n</map>\n</sbgn>\n");
			});
		});
	});

	describe('map', function() {
		describe('parse from XML', function() {
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
				var map = new sbgnjs.Map({id: "id", language: "language"});
				map.setExtension(new sbgnjs.Extension());
				map.addGlyph(new sbgnjs.Glyph());
				map.addArc(new sbgnjs.Arc());
				map.toXML().should.equal("<map id='id' language='language'>\n<extension>\n</extension>\n<glyph>\n</glyph>\n<arc>\n</arc>\n</map>\n");
			});
		});
	});
	describe('extension', function() {
		describe('parse from XML', function() {
			it('should parse empty', function () {
				var extension = sbgnjs.Extension.fromXML(getXmlObj('<extension></extension>'));
				extension.should.have.ownProperty('list');
				extension.list.should.be.a('object');
			});
			it('should parse 2 extensions', function() {
				var extension = sbgnjs.Extension.fromXML(getXmlObj('<extension><renderInformation></renderInformation><b></b></extension>'));
				extension.list.should.have.ownProperty('renderInformation');
				extension.unsupportedList.should.have.ownProperty('b');
			});
		});
		describe('test extension functions', function() {
			it('add new unknown extension', function() {
				var extension = sbgnjs.Extension.fromXML(getXmlObj('<extension></extension>'));
				var extA = getSpecificXmlObj('<a></a>', 'a');
				extension.add(extA);
				extension.list.should.not.have.ownProperty('a');
				extension.unsupportedList.should.have.ownProperty('a');
				extension.unsupportedList.a.should.equal(extA);
			});
			it('add new renderInformation extension', function() {
				var extension = sbgnjs.Extension.fromXML(getXmlObj('<extension></extension>'));
				var render = renderExt.RenderInformation.fromXML(getSpecificXmlObj('<renderInformation></renderInformation>', 'renderInformation'));
				extension.add(render);
				extension.list.should.have.ownProperty('renderInformation');
				extension.list.renderInformation.should.be.instanceOf(renderExt.RenderInformation);
				extension.list.renderInformation.should.equal(render);
			});
			it('add new renderInformation unparsed extension', function() {
				var extension = sbgnjs.Extension.fromXML(getXmlObj('<extension></extension>'));
				var renderXmlObj = getSpecificXmlObj('<renderInformation></renderInformation>', 'renderInformation');
				extension.add(renderXmlObj);
				extension.list.should.have.ownProperty('renderInformation');
				extension.list.renderInformation.should.be.instanceOf(renderExt.RenderInformation);
			});
			it('get extension', function() {
				var extension = sbgnjs.Extension.fromXML(getXmlObj('<extension><a></a><renderInformation></renderInformation></extension>'));
				should.not.exist(extension.get('a'));
				should.exist(extension.get('renderInformation'));
			});
			it('has extension', function() {
				var extension = sbgnjs.Extension.fromXML(getXmlObj('<extension><a></a><renderInformation></renderInformation></extension>'));
				extension.has('a').should.equal(false);
				extension.has('renderInformation').should.equal(true);
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
				extension.add(renderExt.RenderInformation.fromXML(getSpecificXmlObj('<renderInformation></renderInformation>', 'renderInformation')));
				extension.toXML().should.equal("<extension>\n<renderInformation xmlns='"+renderExt.xmlns+"'>\n</renderInformation>\n</extension>\n");
			});
		});
	});
	describe('label', function() {
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
			var label = new sbgnjs.Label({text: 'some text'});
			label.toXML().should.equal("<label text='some text' />\n");
		});
	});
	describe('bbox', function() {
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
			var bbox = new sbgnjs.Bbox({x: 1, y: 2, w: 3.1416, h: 4});
			bbox.toXML().should.equal("<bbox x='1' y='2' w='3.1416' h='4' />\n");
		});
	});
	describe('state', function() {
		it('should parse empty', function() {
			var state = sbgnjs.StateType.fromXML(getXmlObj("<state />"));
			state.should.have.ownProperty('value');
			state.should.have.ownProperty('variable');
			should.equal(state.value, null);
			should.equal(state.variable, null);
		});
		it('should parse complete', function() {
			var state = sbgnjs.StateType.fromXML(getXmlObj("<state value='some value' variable='v'/>"));
			should.exist(state.value);
			state.value.should.equal('some value');
			should.exist(state.variable);
			state.variable.should.equal('v');
		});
		it('should write empty', function() {
			var state = new sbgnjs.StateType();
			state.toXML().should.equal('<state />\n');
		});
		it('should write complete', function() {
			var state = new sbgnjs.StateType({value: 'some value', variable: 'variable'});
			state.toXML().should.equal("<state value='some value' variable='variable' />\n");
		});
	});
	describe('clone', function() {
		it('should parse empty', function() {
			var clone = sbgnjs.CloneType.fromXML(getXmlObj("<clone />"));
			clone.should.have.ownProperty('label');
			should.equal(clone.label, null);
		});
		it('should parse complete', function() {
			var clone = sbgnjs.CloneType.fromXML(getXmlObj("<clone label='some label' />"));
			should.exist(clone.label);
			clone.label.should.equal('some label');
		});
		it('should write empty', function() {
			var clone = new sbgnjs.CloneType();
			clone.toXML().should.equal('<clone />\n');
		});
		it('should write complete', function() {
			var clone = new sbgnjs.CloneType({label: 'some label'});
			clone.toXML().should.equal("<clone label='some label' />\n");
		});
	});
	describe('port', function() {
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
			var port = new sbgnjs.Port({id: 'id', x: 2, y: 3.1416});
			port.toXML().should.equal("<port id='id' x='2' y='3.1416' />\n");
		});
	});
	describe('start type', function() {
		it('should parse empty', function() {
			var start = sbgnjs.StartType.fromXML(getXmlObj("<start />"));
			start.should.have.ownProperty('x');
			start.x.should.be.NaN;
			start.should.have.ownProperty('y');
			start.y.should.be.NaN;
		});
		it('should parse complete', function() {
			var start = sbgnjs.StartType.fromXML(getXmlObj("<start x='1' y='2' />"));
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
			var start = new sbgnjs.StartType({x: 1, y: 2});
			start.toXML().should.equal("<start x='1' y='2' />\n");
		});
	});
	describe('end type', function() {
		it('should parse empty', function() {
			var end = sbgnjs.EndType.fromXML(getXmlObj("<end />"));
			end.should.have.ownProperty('x');
			end.x.should.be.NaN;
			end.should.have.ownProperty('y');
			end.y.should.be.NaN;
		});
		it('should parse complete', function() {
			var end = sbgnjs.EndType.fromXML(getXmlObj("<end x='1' y='2' />"));
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
			var end = new sbgnjs.EndType({x: 1, y: 2});
			end.toXML().should.equal("<end x='1' y='2' />\n");
		});
	});
	describe('next type', function() {
		it('should parse empty', function() {
			var next = sbgnjs.NextType.fromXML(getXmlObj("<next />"));
			next.should.have.ownProperty('x');
			next.x.should.be.NaN;
			next.should.have.ownProperty('y');
			next.y.should.be.NaN;
		});
		it('should parse complete', function() {
			var next = sbgnjs.NextType.fromXML(getXmlObj("<next x='1' y='2' />"));
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
			var next = new sbgnjs.NextType({x: 1, y: 2});
			next.toXML().should.equal("<next x='1' y='2' />\n");
		});
	});

	describe('glyph', function() {
		describe('parse from XML', function() {
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
				glyph.should.have.ownProperty('clone');
				should.equal(glyph.clone, null);
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
			it('should parse state child', function() {
				var glyph = sbgnjs.Glyph.fromXML(getXmlObj("<glyph><state /></glyph>"));
				should.exist(glyph.state);
				glyph.state.should.be.a('object');
				glyph.state.should.be.instanceOf(sbgnjs.StateType);
			});
			it('should parse bbox child', function() {
				var glyph = sbgnjs.Glyph.fromXML(getXmlObj("<glyph><bbox></bbox></glyph>"));
				should.exist(glyph.bbox);
				glyph.bbox.should.be.a('object');
				glyph.bbox.should.be.instanceOf(sbgnjs.Bbox);
			});
			it('should parse clone child', function() {
				var glyph = sbgnjs.Glyph.fromXML(getXmlObj("<glyph><clone /></glyph>"));
				should.exist(glyph.clone);
				glyph.clone.should.be.a('object');
				glyph.clone.should.be.instanceOf(sbgnjs.CloneType);
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
		describe('write to XML', function() {
			it('should write empty glyph', function() {
				var glyph = new sbgnjs.Glyph();
				glyph.toXML().should.equal("<glyph>\n</glyph>\n");
			});
			it('should write complete glyph', function() {
				var glyph = new sbgnjs.Glyph({id: "id", class_: "a_class", compartmentRef: "a_compartment_id"});
				glyph.setLabel(new sbgnjs.Label());
				glyph.setState(new sbgnjs.StateType());
				glyph.setBbox(new sbgnjs.Bbox());
				glyph.setClone(new sbgnjs.CloneType());
				glyph.addGlyphMember(new sbgnjs.Glyph());
				glyph.addPort(new sbgnjs.Port());
				glyph.toXML().should.equal("<glyph id='id' class='a_class' compartmentRef='a_compartment_id'>\n"+
												"<label />\n"+
												"<state />\n"+
												"<bbox />\n"+
												"<clone />\n"+
												"<glyph>\n</glyph>\n"+
												"<port />\n"+
											"</glyph>\n");
			});
		});
	});

	describe('arc', function() {
		describe('parse from XML', function() {
			it('should parse empty', function() {
				var arc = sbgnjs.Arc.fromXML(getXmlObj("<arc></arc>"));
				arc.should.have.ownProperty('id');
				should.equal(arc.id, null);
				arc.should.have.ownProperty('class_');
				should.equal(arc.class_, null);
				arc.should.have.ownProperty('source');
				should.equal(arc.source, null);
				arc.should.have.ownProperty('target');
				should.equal(arc.target, null);

				arc.should.have.ownProperty('start');
				should.equal(arc.start, null);
				arc.should.have.ownProperty('end');
				should.equal(arc.end, null);
				arc.should.have.ownProperty('nexts');
				arc.nexts.should.have.length(0);
			});
			it('should parse attributes', function() {
				var arc = sbgnjs.Arc.fromXML(getXmlObj("<arc id='id' class='class' source='source' target='target'></arc>"));
				should.exist(arc.id);
				arc.id.should.equal('id');
				should.exist(arc.class_);
				arc.class_.should.equal('class');
				should.exist(arc.source);
				arc.source.should.equal('source');
				should.exist(arc.target);
				arc.target.should.equal('target');
			});
			it('should parse start child', function() {
				var arc = sbgnjs.Arc.fromXML(getXmlObj("<arc><start /></arc>"));
				should.exist(arc.start);
				arc.start.should.be.a('object');
				arc.start.should.be.instanceOf(sbgnjs.StartType);
			});
			it('should parse end child', function() {
				var arc = sbgnjs.Arc.fromXML(getXmlObj("<arc><end /></arc>"));
				should.exist(arc.end);
				arc.end.should.be.a('object');
				arc.end.should.be.instanceOf(sbgnjs.EndType);
			});
			it('should parse next child', function() {
				var arc = sbgnjs.Arc.fromXML(getXmlObj("<arc><next /></arc>"));
				should.exist(arc.nexts);
				arc.nexts.should.be.a('array');
				arc.nexts.should.have.lengthOf(1);
				arc.nexts[0].should.be.instanceOf(sbgnjs.NextType);
			});
			it('should parse complete', function() {
				var arc = sbgnjs.Arc.fromXML(getXmlObj("<arc id='id' class='class' source='source' target='target'><start /><next /><next /><end /></arc>"));
				should.exist(arc.id);
				arc.id.should.equal('id');
				should.exist(arc.class_);
				arc.class_.should.equal('class');
				should.exist(arc.source);
				arc.source.should.equal('source');
				should.exist(arc.target);
				arc.target.should.equal('target');
				should.exist(arc.start);
				arc.start.should.be.a('object');
				arc.start.should.be.instanceOf(sbgnjs.StartType);
				should.exist(arc.nexts);
				arc.nexts.should.be.a('array');
				arc.nexts.should.have.lengthOf(2);
				arc.nexts[0].should.be.instanceOf(sbgnjs.NextType);
				arc.nexts[1].should.be.instanceOf(sbgnjs.NextType);
				should.exist(arc.end);
				arc.end.should.be.a('object');
				arc.end.should.be.instanceOf(sbgnjs.EndType);
			});
		});
		describe('write to XML', function() {
			it('should write empty arc', function() {
				var arc = new sbgnjs.Arc();
				arc.toXML().should.equal("<arc>\n</arc>\n");
			});
			it('should write complete arc', function() {
				var arc = new sbgnjs.Arc({id: "id", class_: "a_class", source: "source", target: "target"});
				arc.setStart(new sbgnjs.StartType());
				arc.setEnd(new sbgnjs.EndType());
				arc.addNext(new sbgnjs.NextType());
				arc.addNext(new sbgnjs.NextType());
				arc.toXML().should.equal("<arc id='id' class='a_class' source='source' target='target'>\n"+
												"<start />\n"+
												"<next />\n"+
												"<next />\n"+
												"<end />\n"+
											"</arc>\n");
			});
		});
	});
	describe('complete tests', function() {
		it('should parse full test', function() {
			var sbgn = sbgnjs.Sbgn.fromXML(getXmlObj(
				"<?xml version='1.0' encoding='UTF-8' standalone='yes'?>\n"+
				"<sbgn xmlns='http://sbgn.org/libsbgn/0.3'>\n"+
				"<map language='process description' id='mapID'>\n"+
				"<extension>\n"+
					"<renderInformation id='renderInformation' programName='sbgnviz' programVersion='3.1.0' backgroundColor='#ffffff' xmlns='http://www.sbml.org/sbml/level3/version1/render/version1'>\n"+
					"</renderInformation>\n"+
				"</extension>\n"+

				"<glyph id='_82f19e9e-6aa2-42b3-8b5e-8cee17197085' class='compartment'  >\n"+
					"<label text='synaptic button' />\n"+
					"<bbox y='236.9443994213774' x='163.55225216049354' w='263.29323174695764' h='297.15583352545445' />\n"+
				"</glyph>\n"+
				"<glyph id='_66737d5c-5193-43a2-baa6-094aa1c21654' class='macromolecule' compartmentRef='_82f19e9e-6aa2-42b3-8b5e-8cee17197085' >\n"+
					"<label text='CHT1' />\n"+
					"<state value='val' variable='var' />\n"+
					"<bbox y='497.47523294683185' x='300.32877164779546' w='70' h='35' />\n"+
					"<clone label='clone label' />\n"+
				"</glyph>\n"+

				"<arc id='id' class='production' source='source' target='target'>\n"+
					"<start y='353' x='208.35'/>\n"+
					"<next y='1' x='2.35'/>\n"+
					"<next y='3' x='4.35'/>\n"+
					"<end y='5' x='6.35'/>\n"+
				"</arc>\n"+
				"<arc id='id2' class='consumption' source='source2' target='target2'>\n"+
					"<start y='9' x='8'/>\n"+
					"<end y='3' x='2'/>\n"+
				"</arc>\n"+
				"</map>\n"+
				"</sbgn>\n"
			));

			should.exist(sbgn);
			sbgn.should.be.instanceOf(sbgnjs.Sbgn);
			sbgn.xmlns.should.equal('http://sbgn.org/libsbgn/0.3');
			// map
			should.exist(sbgn.map);
			sbgn.map.should.be.instanceOf(sbgnjs.Map);
			sbgn.map.language.should.equal('process description');
			sbgn.map.id.should.equal('mapID');
			// extension
			should.exist(sbgn.map.extension);
			sbgn.map.extension.should.be.instanceOf(sbgnjs.Extension);
			sbgn.map.extension.list.should.have.ownProperty('renderInformation');
			sbgn.map.extension.list.renderInformation.should.be.instanceOf(renderExt.RenderInformation);
			// glyphs
			sbgn.map.glyphs.should.have.lengthOf(2);
			// glyph 1
			var glyph1 = sbgn.map.glyphs[0];
			glyph1.id.should.equal('_82f19e9e-6aa2-42b3-8b5e-8cee17197085');
			glyph1.class_.should.equal('compartment');
			should.exist(glyph1.label);
			glyph1.label.should.be.instanceOf(sbgnjs.Label);
			glyph1.label.text.should.equal('synaptic button');
			should.exist(glyph1.bbox);
			glyph1.bbox.should.be.instanceOf(sbgnjs.Bbox);
			glyph1.bbox.y.should.equal(236.9443994213774);
			glyph1.bbox.x.should.equal(163.55225216049354);
			glyph1.bbox.w.should.equal(263.29323174695764);
			glyph1.bbox.h.should.equal(297.15583352545445);
			// glyph 2
			var glyph2 = sbgn.map.glyphs[1];
			glyph2.id.should.equal('_66737d5c-5193-43a2-baa6-094aa1c21654');
			glyph2.class_.should.equal('macromolecule');
			should.exist(glyph2.label);
			glyph2.label.should.be.instanceOf(sbgnjs.Label);
			glyph2.label.text.should.equal('CHT1');
			should.exist(glyph2.state);
			glyph2.state.should.be.instanceOf(sbgnjs.StateType);
			glyph2.state.value.should.equal('val');
			glyph2.state.variable.should.equal('var');
			should.exist(glyph2.bbox);
			glyph2.bbox.should.be.instanceOf(sbgnjs.Bbox);
			glyph2.bbox.y.should.equal(497.47523294683185);
			glyph2.bbox.x.should.equal(300.32877164779546);
			glyph2.bbox.w.should.equal(70);
			glyph2.bbox.h.should.equal(35);
			should.exist(glyph2.clone);
			glyph2.clone.should.be.instanceOf(sbgnjs.CloneType);
			glyph2.clone.label.should.equal('clone label');
			// arcs
			sbgn.map.arcs.should.have.lengthOf(2);
			// arc1
			var arc1 = sbgn.map.arcs[0];
			arc1.id.should.equal('id');
			arc1.class_.should.equal('production');
			arc1.source.should.equal('source');
			arc1.target.should.equal('target');
			should.exist(arc1.start);
			arc1.start.should.be.instanceOf(sbgnjs.StartType);
			arc1.start.x.should.equal(208.35);
			arc1.start.y.should.equal(353);
			should.exist(arc1.end);
			arc1.end.should.be.instanceOf(sbgnjs.EndType);
			arc1.end.x.should.equal(6.35);
			arc1.end.y.should.equal(5);
			arc1.nexts.should.have.lengthOf(2);
			arc1.nexts[0].should.be.instanceOf(sbgnjs.NextType);
			arc1.nexts[0].x.should.equal(2.35);
			arc1.nexts[0].y.should.equal(1);
			arc1.nexts[1].should.be.instanceOf(sbgnjs.NextType);
			arc1.nexts[1].x.should.equal(4.35);
			arc1.nexts[1].y.should.equal(3);
			// arc2
			var arc2 = sbgn.map.arcs[1];
			arc2.id.should.equal('id2');
			arc2.class_.should.equal('consumption');
			arc2.source.should.equal('source2');
			arc2.target.should.equal('target2');
			should.exist(arc2.start);
			arc2.start.should.be.instanceOf(sbgnjs.StartType);
			arc2.start.x.should.equal(8);
			arc2.start.y.should.equal(9);
			should.exist(arc2.end);
			arc2.end.should.be.instanceOf(sbgnjs.EndType);
			arc2.end.x.should.equal(2);
			arc2.end.y.should.equal(3);
			arc2.nexts.should.have.lengthOf(0);
		});
	});
});

describe('libsbgn-render-ext', function() {
	describe('colorDefinition', function() {
		
	});
});

