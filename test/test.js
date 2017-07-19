var chai = require('chai');
var should = chai.should();
chai.use(require('chai-string'));
var sbgnjs = require('../src/libsbgn');
var renderExt = require('../src/libsbgn-render');
var checkParams = require('../src/utilities').checkParams;
var xmldom = require('xmldom');
var pkg = require('..');
var annot = sbgnjs.annot;
var N3 = require('n3');
var xml2js = require('xml2js');
var util = require('util');


describe('package', function() {
	it('should expose code correctly', function() {
		pkg.should.have.ownProperty('Sbgn');
		pkg.should.have.ownProperty('render');
		pkg.render.should.have.ownProperty('ColorDefinition');
	});
});

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

function getXmlObj(string) {
	return new xmldom.DOMParser().parseFromString(string, "text/xml").documentElement;
};

describe('libsbgn', function() {
	describe('sbgn', function() {
		describe('parse from XML', function() {
			it('should parse empty', function() {
				var sbgn = sbgnjs.Sbgn.fromXML("<sbgn></sbgn>");
				sbgn.should.have.ownProperty('xmlns');
				should.equal(sbgn.xmlns, null);
				sbgn.should.have.ownProperty('map');
				should.equal(sbgn.map, null);
			});
			it('should parse xmlns', function() {
				var sbgn = sbgnjs.Sbgn.fromXML("<sbgn xmlns='a'></sbgn>");
				should.exist(sbgn.xmlns);
				sbgn.xmlns.should.equal('a');
			});
			it('should parse map', function() {
				var sbgn = sbgnjs.Sbgn.fromXML("<sbgn><map></map></sbgn>");
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
				sbgn.toXML().should.equal("<sbgn/>");
			});
			it('should write complete sbgn with empty map', function() {
				var sbgn = new sbgnjs.Sbgn({'xmlns': "a"});
				sbgn.setMap(new sbgnjs.Map());
				sbgn.toXML().should.equal('<sbgn xmlns="a"><map/></sbgn>');
			});
			it('edge case should consider xmlns of 0', function() {
				var sbgn = new sbgnjs.Sbgn({'xmlns': 0});
				sbgn.setMap(new sbgnjs.Map());
				sbgn.toXML().should.equal('<sbgn xmlns="0"><map/></sbgn>');
			});
		});
		describe('check features inherited from SBGNBase', function () {
			describe('extension', function() {
				it('should parse extension', function(){
					var sbgn = sbgnjs.Sbgn.fromXML("<sbgn><map></map><extension><renderInformation></renderInformation></extension></sbgn>");
					should.exist(sbgn.extension);
					sbgn.extension.should.be.a('object');
					sbgn.extension.should.be.instanceOf(sbgnjs.Extension);
					sbgn.extension.has('renderInformation').should.equal(true);
				});
				it('should write extension', function(){
					var sbgn = new sbgnjs.Sbgn();
					sbgn.setExtension(new sbgnjs.Extension());
					sbgn.extension.add(new renderExt.RenderInformation());
					sbgn.setMap(new sbgnjs.Map());
					sbgn.toXML().should.equal("<sbgn><extension>"+
								'<renderInformation xmlns="http://www.sbml.org/sbml/level3/version1/render/version1"/>'+
								"</extension><map/></sbgn>");
				});
			})
		})
	});

	describe('map', function() {
		describe('parse from XML', function() {
			it('should parse empty', function() {
				var map = sbgnjs.Map.fromXML("<map></map>");
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
				var map = sbgnjs.Map.fromXML("<map id='a'></map>");
				should.exist(map.id);
				map.id.should.equal('a');
			});
			it('should parse language', function() {
				var map = sbgnjs.Map.fromXML("<map language='a'></map>");
				should.exist(map.language);
				map.language.should.equal('a');
			});
			it('should parse extension', function() {
				var map = sbgnjs.Map.fromXML("<map><extension></extension></map>");
				should.exist(map.extension);
				map.extension.should.be.a('object');
				map.extension.should.be.instanceOf(sbgnjs.Extension);
			});
			it('parse 2 empty glyphs', function() {
				var map = sbgnjs.Map.fromXML("<map><glyph></glyph><glyph></glyph></map>");
				map.glyphs.should.have.length(2);
				should.exist(map.glyphs[0]);
				map.glyphs[0].should.be.instanceOf(sbgnjs.Glyph);
				should.exist(map.glyphs[1]);
				map.glyphs[1].should.be.instanceOf(sbgnjs.Glyph);
			});
			it('parse 2 empty arcs', function() {
				var map = sbgnjs.Map.fromXML("<map><arc></arc><arc></arc></map>");
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
				map.toXML().should.equal("<map/>");
			});
			it('should write complete map with empty stuff', function() {
				var map = new sbgnjs.Map({id: "id", language: "language"});
				map.setExtension(new sbgnjs.Extension());
				map.addGlyph(new sbgnjs.Glyph());
				map.addArc(new sbgnjs.Arc());
				map.toXML().should.equal('<map id="id" language="language"><extension/><glyph/><arc/></map>');
			});
		});

		describe('prefix management', function() {
			it('should allow prefixes', function() {
				var map = sbgnjs.Map.fromXML('<sbgn:map xmlns:sbgn="http://sbgn.org/libsbgn/0.2"></sbgn:map>');
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
				extension.list.should.have.ownProperty('b');
			});
		});
		describe('test extension functions', function() {
			it('add new unknown extension', function() {
				var extension = sbgnjs.Extension.fromXML(getXmlObj('<extension></extension>'));
				var extA = getXmlObj('<a></a>');
				extension.add(extA);
				extension.list.should.have.ownProperty('a');
				extension.list.a.should.equal(extA);
			});
			it('add new renderInformation extension', function() {
				var extension = sbgnjs.Extension.fromXML(getXmlObj('<extension></extension>'));
				var render = renderExt.RenderInformation.fromXML(getXmlObj('<renderInformation></renderInformation>'));
				extension.add(render);
				extension.list.should.have.ownProperty('renderInformation');
				extension.list.renderInformation.should.be.instanceOf(renderExt.RenderInformation);
				extension.list.renderInformation.should.equal(render);
			});
			it('add new renderInformation unparsed extension', function() {
				var extension = sbgnjs.Extension.fromXML(getXmlObj('<extension></extension>'));
				var renderXmlObj = getXmlObj('<renderInformation></renderInformation>');
				extension.add(renderXmlObj);
				extension.list.should.have.ownProperty('renderInformation');
				extension.list.renderInformation.should.be.instanceOf(renderExt.RenderInformation);
			});
			it('get extension', function() {
				var extension = sbgnjs.Extension.fromXML(getXmlObj('<extension><a></a><renderInformation></renderInformation></extension>'));
				should.exist(extension.get('a'));
				should.exist(extension.get('renderInformation'));
			});
			it('has extension', function() {
				var extension = sbgnjs.Extension.fromXML(getXmlObj('<extension><a></a><renderInformation></renderInformation></extension>'));
				extension.has('a').should.equal(true);
				extension.has('renderInformation').should.equal(true);
			});
		});
		describe('write to XML', function () {
			it('should write empty extension', function () {
				var extension = new sbgnjs.Extension();
				extension.toXML().should.equal("<extension/>");
			});
			it('should write multiple extensions', function () {
				var extension = new sbgnjs.Extension();
				extension.add(getXmlObj('<x></x>'));
				extension.add(getXmlObj('<c></c>'));
				extension.toXML().should.equal("<extension><x/><c/></extension>");
			});
			it('should write supported and unsupported extensions', function () {
				var extension = new sbgnjs.Extension();
				extension.add(getXmlObj('<x></x>'));
				extension.add(getXmlObj('<c></c>'));
				extension.add(getXmlObj('<renderInformation></renderInformation>', 'renderInformation'));
				extension.toXML().should.equal('<extension><x/><c/><renderInformation xmlns="'+renderExt.xmlns+'"/></extension>');
			});
			it('should overwrite extension if same tag provided twice', function () {
				var extension = new sbgnjs.Extension();
				extension.add(new xmldom.DOMParser().parseFromString('<x attr="test1"></x>', "text/xml").documentElement);
				extension.add(getXmlObj('<c></c>'));
				extension.add(new xmldom.DOMParser().parseFromString('<x attr="test2"></x>', "text/xml").documentElement);
				extension.toXML().should.equal('<extension><x attr="test2"/><c/></extension>');
			});
			it('should keep unsupported extensions as is', function () {
				var extension = new sbgnjs.Extension();
				extension.add(new xmldom.DOMParser().parseFromString('<x attr="test1"><nested><evenmorenested/></nested></x>', "text/xml").documentElement);
				extension.toXML().should.equal('<extension><x attr="test1"><nested><evenmorenested/></nested></x></extension>');
			});
			it('should write render extension', function() {
				var extension = new sbgnjs.Extension();
				extension.add(renderExt.RenderInformation.fromXML(getXmlObj('<renderInformation></renderInformation>')));
				extension.toXML().should.equal('<extension><renderInformation xmlns="'+renderExt.xmlns+'"/></extension>');
			});
		});
	});
	describe('label', function() {
		it('should parse empty', function() {
			var label = sbgnjs.Label.fromXML("<label/>");
			label.should.have.ownProperty('text');
			should.equal(label.text, null);
		});
		it('should parse complete', function() {
			var label = sbgnjs.Label.fromXML('<label text="some text"/>');
			should.exist(label.text);
			label.text.should.equal('some text');
		});
		it('should write empty', function() {
			var label = new sbgnjs.Label();
			label.toXML().should.equal('<label/>');
		});
		it('should write complete', function() {
			var label = new sbgnjs.Label({text: 'some text'});
			label.toXML().should.equal('<label text="some text"/>');
		});
		it('should read and write newline in attributes', function() {
			var label = new sbgnjs.Label({text: 'some \ntext'});
			label.toXML().should.equal('<label text="some \ntext"/>');
			var label2 = sbgnjs.Label.fromXML(label.toXML());
			label2.text.should.equal('some \ntext');
			label2.toXML().should.equal('<label text="some \ntext"/>');
		});
		it('should read and write UTF8 characters', function() {
			var label = new sbgnjs.Label({text: 'some têxt Ʃ ڝ ஹ.'});
			label.toXML().should.equal('<label text="some têxt Ʃ ڝ ஹ."/>');
			var label2 = sbgnjs.Label.fromXML(label.toXML());
			label2.text.should.equal('some têxt Ʃ ڝ ஹ.');
			label2.toXML().should.equal('<label text="some têxt Ʃ ڝ ஹ."/>');
		});
		it('should parse extension', function() {
			var label = sbgnjs.Label.fromXML("<label text='text'><extension/></label>");
			should.exist(label.text);
			label.text.should.equal('text');
			should.exist(label.extension);
			label.extension.should.be.a('object');
			label.extension.should.be.instanceOf(sbgnjs.Extension);
		});
		it('should write extension', function() {
			var label = new sbgnjs.Label({text: 'text', extension: new sbgnjs.Extension()});
			label.toXML().should.equal('<label text="text"><extension/></label>');
		});
	});
	describe('bbox', function() {
		it('should parse empty', function() {
			var bbox = sbgnjs.Bbox.fromXML("<bbox/>");
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
			var bbox = sbgnjs.Bbox.fromXML('<bbox x="1" y="2" w="3.1416" h="4"/>');
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
			bbox.toXML().should.equal('<bbox/>');
		});
		it('should write complete', function() {
			var bbox = new sbgnjs.Bbox({x: 1, y: 2, w: 3.1416, h: 4});
			bbox.toXML().should.equal('<bbox x="1" y="2" w="3.1416" h="4"/>');
		});
	});
	describe('state', function() {
		it('should parse empty', function() {
			var state = sbgnjs.StateType.fromXML("<state/>");
			state.should.have.ownProperty('value');
			state.should.have.ownProperty('variable');
			should.equal(state.value, null);
			should.equal(state.variable, null);
		});
		it('should parse complete', function() {
			var state = sbgnjs.StateType.fromXML('<state value="some value" variable="v"/>');
			should.exist(state.value);
			state.value.should.equal('some value');
			should.exist(state.variable);
			state.variable.should.equal('v');
		});
		it('should write empty', function() {
			var state = new sbgnjs.StateType();
			state.toXML().should.equal('<state/>');
		});
		it('should write complete', function() {
			var state = new sbgnjs.StateType({value: 'some value', variable: 'variable'});
			state.toXML().should.equal('<state value="some value" variable="variable"/>');
		});
	});
	describe('clone', function() {
		it('should parse empty', function() {
			var clone = sbgnjs.CloneType.fromXML("<clone/>");
			clone.should.have.ownProperty('label');
			should.equal(clone.label, null);
		});
		it('should parse complete', function() {
			var clone = sbgnjs.CloneType.fromXML('<clone label="some label"/>');
			should.exist(clone.label);
			clone.label.should.equal('some label');
		});
		it('should write empty', function() {
			var clone = new sbgnjs.CloneType();
			clone.toXML().should.equal('<clone/>');
		});
		it('should write complete', function() {
			var clone = new sbgnjs.CloneType({label: 'some label'});
			clone.toXML().should.equal('<clone label="some label"/>');
		});
	});
	describe('entity', function() {
		it('should parse empty', function() {
			var entity = sbgnjs.EntityType.fromXML(getXmlObj("<entity/>"));
			entity.should.have.ownProperty('name');
			should.equal(entity.name, null);
		});
		it('should parse complete', function() {
			var entity = sbgnjs.EntityType.fromXML(getXmlObj('<entity name="some name"/>'));
			should.exist(entity.name);
			entity.name.should.equal('some name');
		});
		it('should write empty', function() {
			var entity = new sbgnjs.EntityType();
			entity.toXML().should.equal('<entity/>');
		});
		it('should write complete', function() {
			var entity = new sbgnjs.EntityType({name: 'some name'});
			entity.toXML().should.equal('<entity name="some name"/>');
		});
	});
	describe('port', function() {
		it('should parse empty', function() {
			var port = sbgnjs.Port.fromXML("<port/>");
			port.should.have.ownProperty('id');
			should.equal(port.id, null);
			port.should.have.ownProperty('x');
			port.x.should.be.NaN;
			port.should.have.ownProperty('y');
			port.y.should.be.NaN;
		});
		it('should parse complete', function() {
			var port = sbgnjs.Port.fromXML('<port id="id" x="1.25" y="2"/>');
			should.exist(port.id);
			port.id.should.equal('id');
			should.exist(port.x);
			port.x.should.equal(1.25);
			should.exist(port.y);
			port.y.should.equal(2);
		});
		it('should write empty', function() {
			var port = new sbgnjs.Port();
			port.toXML().should.equal('<port/>');
		});
		it('should write complete', function() {
			var port = new sbgnjs.Port({id: 'id', x: 2, y: 3.1416});
			port.toXML().should.equal('<port id="id" x="2" y="3.1416"/>');
		});
	});
	describe('start type', function() {
		it('should parse empty', function() {
			var start = sbgnjs.StartType.fromXML("<start/>");
			start.should.have.ownProperty('x');
			start.x.should.be.NaN;
			start.should.have.ownProperty('y');
			start.y.should.be.NaN;
		});
		it('should parse complete', function() {
			var start = sbgnjs.StartType.fromXML('<start x="1" y="2"/>');
			should.exist(start.x);
			start.x.should.equal(1);
			should.exist(start.y);
			start.y.should.equal(2);
		});
		it('should write empty', function() {
			var start = new sbgnjs.StartType();
			start.toXML().should.equal('<start/>');
		});
		it('should write complete', function() {
			var start = new sbgnjs.StartType({x: 1, y: 2});
			start.toXML().should.equal('<start x="1" y="2"/>');
		});
	});
	describe('end type', function() {
		it('should parse empty', function() {
			var end = sbgnjs.EndType.fromXML("<end/>");
			end.should.have.ownProperty('x');
			end.x.should.be.NaN;
			end.should.have.ownProperty('y');
			end.y.should.be.NaN;
		});
		it('should parse complete', function() {
			var end = sbgnjs.EndType.fromXML('<end x="1" y="2"/>');
			should.exist(end.x);
			end.x.should.equal(1);
			should.exist(end.y);
			end.y.should.equal(2);
		});
		it('should write empty', function() {
			var end = new sbgnjs.EndType();
			end.toXML().should.equal('<end/>');
		});
		it('should write complete', function() {
			var end = new sbgnjs.EndType({x: 1, y: 2});
			end.toXML().should.equal('<end x="1" y="2"/>');
		});
	});
	describe('next type', function() {
		it('should parse empty', function() {
			var next = sbgnjs.NextType.fromXML("<next/>");
			next.should.have.ownProperty('x');
			next.x.should.be.NaN;
			next.should.have.ownProperty('y');
			next.y.should.be.NaN;
		});
		it('should parse complete', function() {
			var next = sbgnjs.NextType.fromXML('<next x="1" y="2"/>');
			should.exist(next.x);
			next.x.should.equal(1);
			should.exist(next.y);
			next.y.should.equal(2);
		});
		it('should write empty', function() {
			var next = new sbgnjs.NextType();
			next.toXML().should.equal('<next/>');
		});
		it('should write complete', function() {
			var next = new sbgnjs.NextType({x: 1, y: 2});
			next.toXML().should.equal('<next x="1" y="2"/>');
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
			it('should parse entity child', function() {
				var glyph = sbgnjs.Glyph.fromXML(getXmlObj("<glyph><entity name='test'/></glyph>"));
				should.exist(glyph.entity);
				glyph.entity.should.be.a('object');
				glyph.entity.should.be.instanceOf(sbgnjs.EntityType);
				glyph.entity.name.should.equal('test');
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
				glyph.toXML().should.equal("<glyph/>");
			});
			it('should write complete glyph', function() {
				var glyph = new sbgnjs.Glyph({id: "id", class_: "a_class", compartmentRef: "a_compartment_id"});
				glyph.setLabel(new sbgnjs.Label());
				glyph.setState(new sbgnjs.StateType());
				glyph.setBbox(new sbgnjs.Bbox());
				glyph.setClone(new sbgnjs.CloneType());
				glyph.setEntity(new sbgnjs.EntityType());
				glyph.addGlyphMember(new sbgnjs.Glyph());
				glyph.addPort(new sbgnjs.Port());
				glyph.toXML().should.equal('<glyph id="id" class="a_class" compartmentRef="a_compartment_id">'+
												"<label/>"+
												"<state/>"+
												"<bbox/>"+
												"<clone/>"+
												"<entity/>"+
												"<glyph/>"+
												"<port/>"+
											"</glyph>");
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
				arc.should.have.ownProperty('glyphs');
				arc.glyphs.should.have.length(0);
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
			it('should parse glyphs child', function() {
				var arc = sbgnjs.Arc.fromXML(getXmlObj("<arc><glyph></glyph></arc>"));
				should.exist(arc.glyphs);
				arc.glyphs.should.be.a('array');
				arc.glyphs.should.have.lengthOf(1);
				arc.glyphs[0].should.be.instanceOf(sbgnjs.Glyph);
			});
			it('should parse complete', function() {
				var arc = sbgnjs.Arc.fromXML(getXmlObj("<arc id='id' class='class' source='source' target='target'><start /><next /><next /><end /><glyph></glyph></arc>"));
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
				should.exist(arc.glyphs);
				arc.glyphs.should.be.a('array');
				arc.glyphs.should.have.lengthOf(1);
				arc.glyphs[0].should.be.instanceOf(sbgnjs.Glyph);
			});
		});
		describe('write to XML', function() {
			it('should write empty arc', function() {
				var arc = new sbgnjs.Arc();
				arc.toXML().should.equal("<arc/>");
			});
			it('should write complete arc', function() {
				var arc = new sbgnjs.Arc({id: "id", class_: "a_class", source: "source", target: "target"});
				arc.setStart(new sbgnjs.StartType());
				arc.setEnd(new sbgnjs.EndType());
				arc.addNext(new sbgnjs.NextType());
				arc.addNext(new sbgnjs.NextType());
				arc.addGlyph(new sbgnjs.Glyph());
				arc.toXML().should.equal('<arc id="id" class="a_class" source="source" target="target">'+
												"<glyph/>"+
												"<start/>"+
												"<next/>"+
												"<next/>"+
												"<end/>"+
											"</arc>");
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
					"<glyph id='cardi' class='cardinality' >\n"+
						"<label text='2' />\n"+
					"</glyph>\n"+
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
			should.exist(arc2.glyphs);
			arc2.glyphs.should.be.a('array');
			arc2.glyphs.should.have.lengthOf(1);
			arc2.glyphs[0].should.be.instanceOf(sbgnjs.Glyph);
			arc2.glyphs[0].id.should.equal('cardi');
			arc2.glyphs[0].class_.should.equal('cardinality');
			should.exist(arc2.glyphs[0].label);
			arc2.glyphs[0].label.should.be.instanceOf(sbgnjs.Label);
			arc2.glyphs[0].label.text.should.equal('2');
		});
		it('should parse prefix and namespace full test', function() {
			var sbgn = sbgnjs.Sbgn.fromXML(getXmlObj(
				'<?xml version="1.0" encoding="UTF-8"?><sbgn xmlns:sbgn="http://sbgn.org/libsbgn/0.2">\n'+
				    '<sbgn:map xmlns:sbgn="http://sbgn.org/libsbgn/0.2" language="process description">\n'+
				        '<sbgn:glyph xmlns:sbgn="http://sbgn.org/libsbgn/0.2" class="macromolecule" id="g1">\n'+
				            '<sbgn:label xmlns:sbgn="http://sbgn.org/libsbgn/0.2" text="LABEL"/>\n'+
				            '<sbgn:bbox xmlns:sbgn="http://sbgn.org/libsbgn/0.2" w="380." h="210." x="90." y="160."/>\n'+
				        '</sbgn:glyph>\n'+
				        '<sbgn:glyph xmlns:sbgn="http://sbgn.org/libsbgn/0.2" class="annotation" id="g2">\n'+
				            '<sbgn:label xmlns:sbgn="http://sbgn.org/libsbgn/0.2" text="INFO"/>\n'+
				            '<sbgn:callout xmlns:sbgn="http://sbgn.org/libsbgn/0.2" target="g1">\n'+
				                '<sbgn:point xmlns:sbgn="http://sbgn.org/libsbgn/0.2" x="160." y="200."/>\n'+
				            '</sbgn:callout>\n'+
				            '<sbgn:bbox xmlns:sbgn="http://sbgn.org/libsbgn/0.2" w="220." h="125." x="5." y="5."/>\n'+
				        '</sbgn:glyph>\n'+
				    '</sbgn:map>\n'+
				'</sbgn>\n'
			));
			should.exist(sbgn);
			sbgn.should.be.instanceOf(sbgnjs.Sbgn);
			should.exist(sbgn.xmlns);
			sbgn.xmlns.should.equal('http://sbgn.org/libsbgn/0.2');
			// map
			should.exist(sbgn.map);
			sbgn.map.should.be.instanceOf(sbgnjs.Map);
			sbgn.map.language.should.equal('process description');
			//sbgn.map.id.should.equal('mapID');
			sbgn.map.glyphs.should.have.lengthOf(2);
			// glyph 1
			var glyph1 = sbgn.map.glyphs[0];
			glyph1.id.should.equal('g1');
			glyph1.class_.should.equal('macromolecule');
			should.exist(glyph1.label);
			glyph1.label.should.be.instanceOf(sbgnjs.Label);
			glyph1.label.text.should.equal('LABEL');
			should.exist(glyph1.bbox);
			glyph1.bbox.should.be.instanceOf(sbgnjs.Bbox);
			glyph1.bbox.y.should.equal(160);
			glyph1.bbox.x.should.equal(90);
			glyph1.bbox.w.should.equal(380);
			glyph1.bbox.h.should.equal(210);
			// glyph 2
			var glyph2 = sbgn.map.glyphs[1];
			glyph2.id.should.equal('g2');
			glyph2.class_.should.equal('annotation');
			should.exist(glyph2.label);
			glyph2.label.should.be.instanceOf(sbgnjs.Label);
			glyph2.label.text.should.equal('INFO');
			should.exist(glyph2.bbox);
			glyph2.bbox.should.be.instanceOf(sbgnjs.Bbox);
			glyph2.bbox.y.should.equal(5);
			glyph2.bbox.x.should.equal(5);
			glyph2.bbox.w.should.equal(220);
			glyph2.bbox.h.should.equal(125);
			// MISSING CALLOUTS HERE TODO		
		});
	});
});

describe('libsbgn-render-ext', function() {
	describe('colorDefinition', function() {
		it('should parse empty', function() {
			var colordef = renderExt.ColorDefinition.fromXML(getXmlObj("<colorDefinition />"));
			colordef.should.have.ownProperty('id');
			should.equal(colordef.id, null);
			colordef.should.have.ownProperty('value');
			should.equal(colordef.value, null);
		});
		it('should parse complete', function() {
			var colordef = renderExt.ColorDefinition.fromXML(getXmlObj("<colorDefinition id='blue' value='#123456' />"));
			should.exist(colordef.id);
			colordef.id.should.equal('blue');
			should.exist(colordef.value);
			colordef.value.should.equal('#123456');
		});
		it('should write empty', function() {
			var colordef = new renderExt.ColorDefinition();
			colordef.toXML().should.equal('<colorDefinition/>');
		});
		it('should write complete', function() {
			var colordef = new renderExt.ColorDefinition({id: 'blue', value: '#123456'});
			colordef.toXML().should.equal('<colorDefinition id="blue" value="#123456"/>');
		});
	});

	describe('listOfColorDefinitions', function() {
		describe('parse from XML', function() {
			it('should parse empty', function() {
				var listof = renderExt.ListOfColorDefinitions.fromXML(getXmlObj("<listOfColorDefinitions></listOfColorDefinitions>"));
				listof.should.have.ownProperty('colorDefinitions');
				listof.colorDefinitions.should.be.a('array');
				listof.colorDefinitions.should.have.lengthOf(0);
			});
			it('should parse color', function() {
				var listof = renderExt.ListOfColorDefinitions.fromXML(getXmlObj("<listOfColorDefinitions><colorDefinition /><colorDefinition /></listOfColorDefinitions>"));
				listof.should.have.ownProperty('colorDefinitions');
				listof.colorDefinitions.should.be.a('array');
				listof.colorDefinitions.should.have.lengthOf(2);
				listof.colorDefinitions[0].should.be.instanceOf(renderExt.ColorDefinition);
				listof.colorDefinitions[1].should.be.instanceOf(renderExt.ColorDefinition);
			});
		});
		describe('write to XML', function() {
			it('should write empty listOfColorDefinitions', function() {
				var listof = new renderExt.ListOfColorDefinitions();
				listof.toXML().should.equal("<listOfColorDefinitions/>");
			});
			it('should write complete list with empty colorDefinitions', function() {
				var listof = new renderExt.ListOfColorDefinitions();
				listof.addColorDefinition(new renderExt.ColorDefinition());
				listof.addColorDefinition(new renderExt.ColorDefinition());
				listof.toXML().should.equal("<listOfColorDefinitions><colorDefinition/><colorDefinition/></listOfColorDefinitions>");
			});
		});
	});

	describe('renderGroup', function() {
		it('should parse empty', function() {
			var g = renderExt.RenderGroup.fromXML(getXmlObj("<g />"));
			g.should.have.ownProperty('id');
			should.equal(g.id, null);
			g.should.have.ownProperty('fontSize');
			should.equal(g.fontSize, null);
			g.should.have.ownProperty('fontFamily');
			should.equal(g.fontFamily, null);
			g.should.have.ownProperty('fontWeight');
			should.equal(g.fontWeight, null);
			g.should.have.ownProperty('fontStyle');
			should.equal(g.fontStyle, null);
			g.should.have.ownProperty('textAnchor');
			should.equal(g.textAnchor, null);
			g.should.have.ownProperty('vtextAnchor');
			should.equal(g.vtextAnchor, null);
			g.should.have.ownProperty('fill');
			should.equal(g.fill, null);
			g.should.have.ownProperty('stroke');
			should.equal(g.stroke, null);
			g.should.have.ownProperty('strokeWidth');
			should.equal(g.strokeWidth, null);
		});
		it('should parse complete', function() {
			var g = renderExt.RenderGroup.fromXML(getXmlObj("<g id='id' fontSize='12' fontFamily='Comic' fontWeight='not bold'"+
															" fontStyle='style' textAnchor='on top of the top' vtextAnchor='left'"+
															" fill='#123456' stroke='blue' strokeWidth='2' />"));
			should.exist(g.id);
			g.id.should.equal('id');
			should.exist(g.fontSize);
			g.fontSize.should.equal('12');
			should.exist(g.fontFamily);
			g.fontFamily.should.equal('Comic');
			should.exist(g.fontWeight);
			g.fontWeight.should.equal('not bold');
			should.exist(g.fontStyle);
			g.fontStyle.should.equal('style');
			should.exist(g.textAnchor);
			g.textAnchor.should.equal('on top of the top');
			should.exist(g.vtextAnchor);
			g.vtextAnchor.should.equal('left');
			should.exist(g.fill);
			g.fill.should.equal('#123456');
			should.exist(g.stroke);
			g.stroke.should.equal('blue');
			should.exist(g.strokeWidth);
			g.strokeWidth.should.equal('2');
		});
		it('should write empty', function() {
			var g = new renderExt.RenderGroup();
			g.toXML().should.equal('<g/>');
		});
		it('should write complete', function() {
			var g = new renderExt.RenderGroup({	id: 'id', fontSize: '12', fontFamily: 'Comic', fontWeight: 'not bold',
												fontStyle:'style', textAnchor: 'on top of the top', vtextAnchor: 'left', 
												fill: '#123456', stroke: 'blue', strokeWidth: '2'});
			g.toXML().should.equal(	'<g id="id" fontSize="12" fontFamily="Comic" fontWeight="not bold"'+
									' fontStyle="style" textAnchor="on top of the top" vtextAnchor="left"'+
									' stroke="blue" strokeWidth="2" fill="#123456"/>');
		});
	});

	describe('style', function() {
		describe('parse from XML', function() {
			it('should parse empty', function() {
				var style = renderExt.Style.fromXML(getXmlObj("<style></style>"));
				style.should.have.ownProperty('id');
				should.equal(style.id, null);
				style.should.have.ownProperty('name');
				should.equal(style.name, null);
				style.should.have.ownProperty('idList');
				should.equal(style.idList, null);
				style.should.have.ownProperty('renderGroup');
				should.equal(style.renderGroup, null);
			});
			it('should parse complete', function() {
				var style = renderExt.Style.fromXML(getXmlObj("<style id='id' name='myStyle' idList='a b c'><g /></style>"));
				should.exist(style.id);
				style.id.should.equal('id');
				should.exist(style.name);
				style.name.should.equal('myStyle');
				should.exist(style.idList);
				style.idList.should.equal('a b c');
				should.exist(style.renderGroup);
				style.renderGroup.should.be.a('object');
				style.renderGroup.should.be.instanceOf(renderExt.RenderGroup);
			});
		});
		describe('write to XML', function() {
			it('should write empty style', function() {
				var style = new renderExt.Style();
				style.toXML().should.equal("<style/>");
			});
			it('should write complete style with empty renderGroup', function() {
				var style = new renderExt.Style({id: 'id', name: 'myName', idList:'a b c'});
				style.setRenderGroup(new renderExt.RenderGroup());
				style.toXML().should.equal('<style id="id" name="myName" idList="a b c"><g/></style>');
			});
		});
		describe('test the utility function', function() {
			it('getIdListAsArray', function() {
				var style = new renderExt.Style({idList: 'a b c'});
				var array = style.getIdListAsArray();
				should.exist(array);
				array.should.be.a('array');
				array.should.deep.equal(['a', 'b', 'c']);
			});
			it('setIdListFromArray', function() {
				var style = new renderExt.Style();
				style.setIdListFromArray(['a', 'b', 'c']);
				should.exist(style.idList);
				style.idList.should.be.a('string');
				style.idList.should.equal('a b c');
			});
		});
	});

	describe('listOfStyles', function() {
		describe('parse from XML', function() {
			it('should parse empty', function() {
				var listof = renderExt.ListOfStyles.fromXML(getXmlObj("<listOfStyles></listOfStyles>"));
				listof.should.have.ownProperty('styles');
				listof.styles.should.be.a('array');
				listof.styles.should.have.lengthOf(0);
			});
			it('should parse style', function() {
				var listof = renderExt.ListOfStyles.fromXML(getXmlObj("<listOfStyles><style></style><style></style></listOfStyles>"));
				listof.should.have.ownProperty('styles');
				listof.styles.should.be.a('array');
				listof.styles.should.have.lengthOf(2);
				listof.styles[0].should.be.instanceOf(renderExt.Style);
				listof.styles[1].should.be.instanceOf(renderExt.Style);
			});
		});
		describe('write to XML', function() {
			it('should write empty listOfStyles', function() {
				var listof = new renderExt.ListOfStyles();
				listof.toXML().should.equal("<listOfStyles/>");
			});
			it('should write complete list with empty colorDefinitions', function() {
				var listof = new renderExt.ListOfStyles();
				listof.addStyle(new renderExt.Style());
				listof.addStyle(new renderExt.Style());
				listof.toXML().should.equal("<listOfStyles><style/><style/></listOfStyles>");
			});
		});
	});

	describe('renderInformation', function() {
		describe('parse from XML', function() {
			it('should parse empty', function() {
				var renderInformation = renderExt.RenderInformation.fromXML(getXmlObj("<renderInformation></renderInformation>"));
				renderInformation.should.have.ownProperty('id');
				should.equal(renderInformation.id, null);
				renderInformation.should.have.ownProperty('name');
				should.equal(renderInformation.name, null);
				renderInformation.should.have.ownProperty('programName');
				should.equal(renderInformation.programName, null);
				renderInformation.should.have.ownProperty('programVersion');
				should.equal(renderInformation.programVersion, null);
				renderInformation.should.have.ownProperty('backgroundColor');
				should.equal(renderInformation.backgroundColor, null);
				renderInformation.should.have.ownProperty('listOfColorDefinitions');
				should.equal(renderInformation.listOfColorDefinitions, null);
				renderInformation.should.have.ownProperty('listOfStyles');
				should.equal(renderInformation.listOfStyles, null);
			});
			it('should parse attributes', function() {
				var renderInfo = renderExt.RenderInformation.fromXML(getXmlObj(	"<renderInformation id='a' name='name' programName='prog' "+
																"programVersion='2.0.1a' backgroundColor='#FFFFFF'></renderInformation>"));
				should.exist(renderInfo.id);
				renderInfo.id.should.equal('a');
				should.exist(renderInfo.name);
				renderInfo.name.should.equal('name');
				should.exist(renderInfo.programName);
				renderInfo.programName.should.equal('prog');
				should.exist(renderInfo.programVersion);
				renderInfo.programVersion.should.equal('2.0.1a');
				should.exist(renderInfo.backgroundColor);
				renderInfo.backgroundColor.should.equal('#FFFFFF');
			});
			it('should parse children', function() {
				var renderInfo = renderExt.RenderInformation.fromXML(getXmlObj("<renderInformation>"+
													"<listOfColorDefinitions></listOfColorDefinitions>"+
													"<listOfStyles></listOfStyles></renderInformation>"));
				should.exist(renderInfo.listOfColorDefinitions);
				renderInfo.listOfColorDefinitions.should.be.a('object');
				renderInfo.listOfColorDefinitions.should.be.instanceOf(renderExt.ListOfColorDefinitions);
				should.exist(renderInfo.listOfStyles);
				renderInfo.listOfStyles.should.be.a('object');
				renderInfo.listOfStyles.should.be.instanceOf(renderExt.ListOfStyles);
			});
		});
		describe('write to XML', function() {
			it('should write empty renderInfo', function() {
				var renderInfo = new renderExt.RenderInformation();
				renderInfo.toXML().should.equal('<renderInformation xmlns="http://www.sbml.org/sbml/level3/version1/render/version1"/>');
			});
			it('should write complete renderInformation with empty children', function() {
				var renderInfo = new renderExt.RenderInformation({id: 'id', name: 'name', programName: 'prog',
																	programVersion: '0.0.0', backgroundColor: 'blue'});
				renderInfo.setListOfColorDefinitions(new renderExt.ListOfColorDefinitions());
				renderInfo.setListOfStyles(new renderExt.ListOfStyles());
				renderInfo.toXML().should.equal('<renderInformation xmlns="http://www.sbml.org/sbml/level3/version1/render/version1"'+
												' id="id" name="name" programName="prog" programVersion="0.0.0" backgroundColor="blue">'+
												"<listOfColorDefinitions/>"+
												"<listOfStyles/>"+
												"</renderInformation>");
			});
		});
	});
});

describe('usage examples', function() {
	function example1() {
		var libsbgnjs = sbgnjs; // require('libsbgn.js');

		var sbgn = new libsbgnjs.Sbgn({xmlns: 'http://sbgn.org/libsbgn/0.3'});

		var map = new libsbgnjs.Map({id: 'mymap', language: 'process description'});
		sbgn.setMap(map);

		var glyph1 = new libsbgnjs.Glyph({id: 'glyph1', class_: 'macromolecule'});
		glyph1.setLabel(new libsbgnjs.Label({text: 'entity A'}));
		glyph1.setBbox(new libsbgnjs.Bbox({x: 0, y: 0, w:10, h:10}));
		map.addGlyph(glyph1);

		var glyph2 = new libsbgnjs.Glyph({id: 'glyph2', class_: 'macromolecule'});
		glyph2.setLabel(new libsbgnjs.Label({text: 'entity B'}));
		glyph2.setBbox(new libsbgnjs.Bbox({x: 20, y: 0, w:10, h:10}));
		map.addGlyph(glyph2);

		var processGlyph = new libsbgnjs.Glyph({id: 'process1', class_: 'process'});
		processGlyph.setBbox(new libsbgnjs.Bbox({x: 10, y: 0, w:10, h:10}));
		map.addGlyph(processGlyph);

		var arc1 = new libsbgnjs.Arc({id:'arc1', class_:'consumption', source:'glyph1', target:'process1'});
		arc1.setStart(new libsbgnjs.StartType({x:0, y:0}));
		arc1.setEnd(new libsbgnjs.EndType({x:10, y:0}));
		map.addArc(arc1);

		var arc2 = new libsbgnjs.Arc({id:'arc2', class_:'production', source:'process1', target:'glyph2'});
		arc2.setStart(new libsbgnjs.StartType({x:10, y:0}));
		arc2.setEnd(new libsbgnjs.EndType({x:20, y:0}));
		map.addArc(arc2);

		var xmlString = sbgn.toXML();

		/*
		<sbgn xmlns="http://sbgn.org/libsbgn/0.3">
			<map id="mymap" language="process description">
				<glyph id="glyph1" class="macromolecule">
					<label text="entity A"/>
					<bbox x="0" y="0" w="10" h="10"/>
				</glyph>
				<glyph id="glyph2" class="macromolecule">
					<label text="entity B"/>
					<bbox x="20" y="0" w="10" h="10"/>
				</glyph>
				<glyph id="process1" class="process">
					<bbox x="10" y="0" w="10" h="10"/>
				</glyph>

				<arc id="arc1" class="consumption" source="glyph1" target="process1">
					<start x="0" y="0"/>
					<end x="10" y="0"/>
				</arc>
				<arc id="arc2" class="production" source="process1" target="glyph2">
					<start x="10" y="0"/>
					<end x="20" y="0"/>
				</arc>
			</map>
		</sbgn>
		*/
		return xmlString;
	}
});

describe('libsbgn-annotations-ext', function() {
	describe('utilities', function () {
		var simplest, empty, emptyDescription, emptyRelation, emptyBag, inline;
		var doubleDescription, doubleRelation;
		var testID = "http://local/anID000001";
		var testID2 = "http://local/anID000002";
		var testRelation = "http://biomodels.net/model-qualifiers/is";
		var testRelation2 = "http://biomodels.net/model-qualifiers/has";
		var testObject = "http://identifiers.org/biomodels.db/BIOMD0000000004";
		var testObject2 = "http://identifiers.org/biomodels.db/BIOMD0000000005";
		var header = 
					'<annotation>'+
					'<rdf:RDF '+
					'xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" '+
				    'xmlns:bqmodel="http://biomodels.net/model-qualifiers/">';
		var footer = '</rdf:RDF></annotation>';
		var headerRDF = '<rdf:RDF '+
					'xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" '+
				    'xmlns:bqmodel="http://biomodels.net/model-qualifiers/">';
		var footerRDF = '</rdf:RDF>';
		var simplestString =
					'<rdf:Description rdf:about="http://local/anID000001">'+
						'<bqmodel:is>'+
							'<rdf:Bag>'+
								'<rdf:li rdf:resource="http://identifiers.org/biomodels.db/BIOMD0000000004" />'+
							'</rdf:Bag>'+
						'</bqmodel:is>'+
					'</rdf:Description>';
		var emptyDescriptionString =
					'<rdf:Description rdf:about="http://local/anID000001">'+
					'</rdf:Description>';
		var emptyRelationString =
					'<rdf:Description rdf:about="http://local/anID000001">'+
					'<bqmodel:is>'+
					'</bqmodel:is>' +
					'</rdf:Description>';
		var emptyBagString =
					'<rdf:Description rdf:about="http://local/anID000001">'+
					'<bqmodel:is>'+
					'<rdf:Bag>'+
					'</rdf:Bag>'+
					'</bqmodel:is>'+
					'</rdf:Description>';
		var inlineString =
					'<rdf:Description rdf:about="http://local/anID000001">'+
						'<bqmodel:is rdf:resource="http://identifiers.org/biomodels.db/BIOMD0000000004" />'+
					'</rdf:Description>';
		var doubleDescriptionString = simplestString +
					'<rdf:Description rdf:about="http://local/anID000002">'+
						'<bqmodel:is>'+
							'<rdf:Bag>'+
								'<rdf:li rdf:resource="http://identifiers.org/biomodels.db/BIOMD0000000005" />'+
							'</rdf:Bag>'+
						'</bqmodel:is>'+
					'</rdf:Description>';
		var doubleRelationString =
					'<rdf:Description rdf:about="http://local/anID000001">'+
						'<bqmodel:is>'+
							'<rdf:Bag>'+
								'<rdf:li rdf:resource="http://identifiers.org/biomodels.db/BIOMD0000000004" />'+
							'</rdf:Bag>'+
						'</bqmodel:is>'+
						'<bqmodel:has>'+
							'<rdf:Bag>'+
								'<rdf:li rdf:resource="http://identifiers.org/biomodels.db/BIOMD0000000005" />'+
							'</rdf:Bag>'+
						'</bqmodel:has>'+
					'</rdf:Description>';


		beforeEach('build necessary RDF store from different test inputs', function() {
			simplest = annot.Annotation.fromXML(getXmlObj(header+simplestString+footer)).rdfElement;
			empty = annot.Annotation.fromXML(getXmlObj(header+footer)).rdfElement;
			emptyDescription = annot.Annotation.fromXML(getXmlObj(header+emptyDescriptionString+footer)).rdfElement;
			emptyRelation = annot.Annotation.fromXML(getXmlObj(header+emptyRelationString+footer)).rdfElement;
			emptyBag = annot.Annotation.fromXML(getXmlObj(header+emptyBagString+footer)).rdfElement;
			inline = annot.Annotation.fromXML(getXmlObj(header+inlineString+footer)).rdfElement;
			doubleDescription = annot.Annotation.fromXML(getXmlObj(header+doubleDescriptionString+footer)).rdfElement;
			doubleRelation = annot.Annotation.fromXML(getXmlObj(header+doubleRelationString+footer)).rdfElement;

		});

		it('should parse and write xml as is, ignore white space', function(){
			simplest.toXML().should.equalIgnoreSpaces(headerRDF+simplestString+footerRDF);
			empty.toXML().should.equalIgnoreSpaces('<rdf:RDF '+
					'xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" ></rdf:RDF>');
			emptyDescription.toXML().should.equalIgnoreSpaces('<rdf:RDF '+
					'xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" ></rdf:RDF>');
			emptyRelation.toXML().should.equalIgnoreSpaces(headerRDF+emptyRelationString+footerRDF);
			emptyBag.toXML().should.equalIgnoreSpaces(headerRDF+emptyBagString+footerRDF);
			inline.toXML().should.equalIgnoreSpaces(headerRDF+inlineString+footerRDF);
		});

		describe('getAllIds', function() {
			it('should return empty list if no ids', function() {
				empty.getAllIds().should.deep.equal([]);
				emptyDescription.getAllIds().should.deep.equal([]);
			});
			it('should return array of ids if elements are present', function() {
				simplest.getAllIds().should.deep.equal([testID]);
				emptyRelation.getAllIds().should.deep.equal([testID]);
				emptyBag.getAllIds().should.deep.equal([testID]);
				inline.getAllIds().should.deep.equal([testID]);
				var doubleRes = doubleDescription.getAllIds();
				doubleRes.should.include(testID);
				doubleRes.should.include(testID2);
			});
		});
		describe('getResourcesOfId', function() {
			it('should return empty list if no resources', function() {
				empty.getResourcesOfId(testID).should.deep.equal({});
				emptyDescription.getResourcesOfId(testID).should.deep.equal({});
			});
			it('should return a single property if only one relation', function() {
				var res = simplest.getResourcesOfId(testID);
				res.should.have.ownProperty(testRelation);
				res[testRelation].should.deep.equal([testObject]);
				//emptyDescription.getResourcesOfId(testID).should.deep.equal({});
			});
		});
	});


	/*it('test', function() {
		var annot = require('../src/libsbgn-annotations');
		// SIO has property !!  "http://semanticscience.org/resource/SIO_000223"
		// SIO name SIO_000116 + rdf:value
		var input1 = '<annotation><rdf:RDF '+
		'xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" '+
	    'xmlns:bqmodel="http://biomodels.net/model-qualifiers/" '+
	    'xmlns:bqbiol="http://biomodels.net/biology-qualifiers/" '+
	    'xmlns:sio="http://semanticscience.org/resource/"> '+
		'<rdf:Description rdf:about="http://local/anID000001">  '+
		'	<bqmodel:is> '+
		'		<rdf:Bag> '+
		'			<rdf:li rdf:resource="http://identifiers.org/biomodels.db/BIOMD0000000004" /> '+
		'		</rdf:Bag> '+
		'	</bqmodel:is> '+

'			<bqmodel:isDescribedBy> '+
'				<rdf:Bag> '+
'					<rdf:li rdf:resource="http://identifiers.org/pubmed/1833774" /> '+
'			</rdf:Bag> '+
'			</bqmodel:isDescribedBy> '+

'			<sio:SIO_000223> '+
	'			<rdf:Bag> '+
	'					<rdf:li sio:SIO_000116="data" rdf:value="42" /> '+
	'					<rdf:li sio:SIO_000116="data2" rdf:value="1.23" /> '+
'				</rdf:Bag> '+
'			</sio:SIO_000223> '+

'		</rdf:Description> '+
'	</rdf:RDF></annotation>';
		var input2 = '<annotation><rdf:RDF '+
		'xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" '+
	    'xmlns:bqmodel="http://biomodels.net/model-qualifiers/" '+
	    'xmlns:bqbiol="http://biomodels.net/biology-qualifiers/" '+
	    'xmlns:sio="http://semanticscience.org/resource/"> '+
		'<rdf:Description rdf:about="http://local/anID000002">  '+
		'	<bqmodel:is> '+
		'		<rdf:Bag> '+
		'			<rdf:li rdf:resource="http://identifiers.org/biomodels.db/BIOMD00000000115" /> '+
		'		</rdf:Bag> '+
		'			<rdf:li rdf:resource="http://identifiers.org/biomodels.db/BIOMD00000000115" /> '+
		'	</bqmodel:is> '+
		'<bqmodel:is rdf:resource="http://identifiers.org/biomodels.db/BIOMD00000000115" /> '+

'			<bqmodel:isDescribedBy> '+
'				<rdf:Bag> '+
'					<rdf:li rdf:resource="http://identifiers.org/pubmed/PUBMEDID" /> '+
'			</rdf:Bag> '+
'			</bqmodel:isDescribedBy> '+

'			<sio:SIO_000223> '+
	'			<rdf:Bag> '+
	'					<rdf:li sio:SIO_000116="myConstant" rdf:value="42" /> '+
	'					<rdf:li sio:SIO_000116="aProp" rdf:value="123.456" /> '+
'				</rdf:Bag> '+
'			</sio:SIO_000223> '+

'		</rdf:Description> '+
'	</rdf:RDF></annotation>';
		//console.log(input);
		var annotation = annot.Annotation.fromXML(getXmlObj(input1));
		var annotation2 = annot.Annotation.fromXML(getXmlObj(input2));
		var globalStore = new annot.GlobalRdfStore();
		globalStore.load([annotation, annotation2]);
		//console.log(annotation.toXML());
		var rdf = annotation.rdfElements[0];
		//console.log(rdf.toXML());
		
		//rdf.test();
		//globalStore.test();

	});*/
});

describe('xml2js test', function(){
	it('test1', function(){
		var string = "<?xml version='1.0' encoding='UTF-8' standalone='yes'?>\n"+
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
					"<glyph id='cardi' class='cardinality' >\n"+
						"<label text='2' />\n"+
					"</glyph>\n"+
				"</arc>\n"+
				"</map>\n"+
				"</sbgn>\n";

		var string2 =
				'<?xml version="1.0" encoding="UTF-8"?><sbgn xmlns:sbgn="http://sbgn.org/libsbgn/0.2">\n'+
				    '<sbgn:map xmlns:sbgn="http://sbgn.org/libsbgn/0.2" language="process description">\n'+
				        '<sbgn:glyph xmlns:sbgn="http://sbgn.org/libsbgn/0.2" class="macromolecule" id="g1">\n'+
				            '<sbgn:label xmlns:sbgn="http://sbgn.org/libsbgn/0.2" text="LABEL"/>\n'+
				            '<sbgn:bbox xmlns:sbgn="http://sbgn.org/libsbgn/0.2" w="380." h="210." x="90." y="160."/>\n'+
				        '</sbgn:glyph>\n'+
				        '<sbgn:glyph xmlns:sbgn="http://sbgn.org/libsbgn/0.2" class="annotation" id="g2">\n'+
				            '<sbgn:label xmlns:sbgn="http://sbgn.org/libsbgn/0.2" text="INFO"/>\n'+
				            '<sbgn:callout xmlns:sbgn="http://sbgn.org/libsbgn/0.2" target="g1">\n'+
				                '<sbgn:point xmlns:sbgn="http://sbgn.org/libsbgn/0.2" x="160." y="200."/>\n'+
				            '</sbgn:callout>\n'+
				            '<sbgn:bbox xmlns:sbgn="http://sbgn.org/libsbgn/0.2" w="220." h="125." x="5." y="5."/>\n'+
				        '</sbgn:glyph>\n'+
				    '</sbgn:map>\n'+
				'</sbgn>\n';
		var parser = new xml2js.Parser({
			tagNameProcessors: [xml2js.processors.stripPrefix],
			attrValueProcessors: [xml2js.processors.parseNumbers, xml2js.processors.parseBooleans]
		});
		parser.parseString(string2, function (err, result) {
	        console.log(util.inspect(result, false, null));
	        console.log('Done');
	    });

	    var obj = {sbgn: {$: {'sdmfkj': 'sdfh'}, 'truc1': [{}]} };

		var builder = new xml2js.Builder();
		var xml = builder.buildObject(obj);
		console.log(xml);
	});
});
