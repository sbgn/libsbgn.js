/**
 * The API contains two other submodules: {@link libsbgn.render} and {@link libsbgn.annot}
 * @module libsbgn
 * @namespace libsbgn
*/

var renderExt = require('./libsbgn-render');
var annotExt = require('./libsbgn-annotations');
var checkParams = require('./utilities').checkParams;
var getFirstLevelByName = require('./utilities').getFirstLevelByName;
var xmldom = require('xmldom');

var ns = {};

ns.xmlns = "http://sbgn.org/libsbgn/0.3";

// ------- SBGNBase -------
/**
 * Parent class for several sbgn elements. Used to provide extension element.
 * End users don't need to interact with it. It can be safely ignored.
 * @class
 * @param {Object} params
 * @param {Extension=} params.extension
 */
var SBGNBase = function (params) {
	var params = checkParams(params, ['extension']);
	this.extension 	= params.extension;
};

/**
 * Allows inheriting objects to get an extension element.
 * @param {Extension} extension
 */
SBGNBase.prototype.setExtension = function (extension) {
	this.extension = extension;
};

/**
 * @param {Element} xmlObj the xml object being built from 'this'
 */
SBGNBase.prototype.baseToXmlObj = function (xmlObj) {
	if(this.extension != null) {
		xmlObj.appendChild(this.extension.buildXmlObj());
	}
};

/**
 * parse things specific to SBGNBase type
 * @param {Element} xmlObj the xml object being parsed
 */
SBGNBase.prototype.baseFromXML = function (xmlObj) {
	// children
	var extensionXML = getFirstLevelByName(xmlObj, 'extension')[0];
	if (extensionXML != null) {
		var extension = ns.Extension.fromXML(extensionXML);
		this.setExtension(extension);
	}
};
ns.SBGNBase = SBGNBase;
// ------- END SBGNBase -------

// ------- SBGN -------
/**
 * Represents the <code>&lt;sbgn&gt;</code> element.
 * @class
 * @extends SBGNBase
 * @param {Object} params
 * @param {string=} params.xmlns
 * @param {Map=} params.map
 */
var Sbgn = function (params) {
	ns.SBGNBase.call(this, params);
	var params = checkParams(params, ['xmlns', 'map']);
	this.xmlns 	= params.xmlns;
	this.map 	= params.map;

	this.allowedChildren = ['map'];
};

Sbgn.prototype = Object.create(ns.SBGNBase.prototype);
Sbgn.prototype.constructor = Sbgn;

/**
 * @param {Map} map
 */
Sbgn.prototype.setMap = function (map) {
	this.map = map;
};

/**
 * @return {Element}
 */
Sbgn.prototype.buildXmlObj = function () {
	var sbgn = new xmldom.DOMImplementation().createDocument().createElement('sbgn');
	// attributes
	if(this.xmlns != null) {
		sbgn.setAttribute('xmlns', this.xmlns);
	}
	if(this.language != null) {
		sbgn.setAttribute('language', this.language);
	}
	// children
	this.baseToXmlObj(sbgn);
	if (this.map != null) {
		sbgn.appendChild(this.map.buildXmlObj());
	}
	return sbgn;
};

/**
 * @return {string}
 */
Sbgn.prototype.toXML = function () {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @param {Element} xmlObj
 * @return {Sbgn}
 */
Sbgn.fromXML = function (xmlObj) {
	if (xmlObj.tagName != 'sbgn') {
		throw new Error("Bad XML provided, expected tagName sbgn, got: " + xmlObj.tagName);
	}
	var sbgn = new ns.Sbgn();
	sbgn.xmlns = xmlObj.getAttribute('xmlns') || null;

	// getting attribute with 'xmlns' doesn't work if some namespace is defined like 'xmlns:sbgn'
	// so if there is some attribute there, and we didn't find the xmlns directly, we need to into it
	if(!sbgn.xmlns && xmlObj.attributes.length > 0) {
		// sbgn is not supposed to have any other attribute than an xmlns, so we assume the first attr is the xmlns
		var attr = xmlObj.attributes[0];
		if(attr.prefix == 'xmlns') {
			sbgn.xmlns = attr.value;
			sbgn.namespacePrefix = attr.localName;
		}
		else {
			throw new Error("Couldn't find xmlns definition in sbgn element");
		}
	}

	// get children
	var mapXML = xmlObj.getElementsByTagNameNS('*', 'map')[0];
	if (mapXML != null) {
		var map = ns.Map.fromXML(mapXML);
		sbgn.setMap(map);
	}
	sbgn.baseFromXML(xmlObj); // call to parent class
	return sbgn;
};
ns.Sbgn = Sbgn;
// ------- END SBGN -------

// ------- MAP -------
/**
 * Represents the <code>&lt;map&gt;</code> element.
 * @class
 * @extends SBGNBase
 * @param {Object} params
 * @param {string=} params.id
 * @param {string=} params.language
 * @param {Glyph[]=} params.glyphs
 * @param {Arc[]=} params.arcs
 */
var Map = function (params) {
	ns.SBGNBase.call(this, params);
	var params = checkParams(params, ['id', 'language', 'glyphs', 'arcs']);
	this.id 		= params.id;
	this.language 	= params.language;
	this.glyphs 	= params.glyphs || [];
	this.arcs 		= params.arcs || [];

	this.allowedChildren = ['glyphs', 'arcs'];
};

Map.prototype = Object.create(ns.SBGNBase.prototype);
Map.prototype.constructor = Map;

/**
 * @param {Glyph} glyph
 */
Map.prototype.addGlyph = function (glyph) {
	this.glyphs.push(glyph);
};

/**
 * @param {Arc} arc
 */
Map.prototype.addArc = function (arc) {
	this.arcs.push(arc);
};

/**
 * @return {Element}
 */
Map.prototype.buildXmlObj = function () {
	var map = new xmldom.DOMImplementation().createDocument().createElement('map');
	// attributes
	if(this.id != null) {
		map.setAttribute('id', this.id);
	}
	if(this.language != null) {
		map.setAttribute('language', this.language);
	}
	// children
	this.baseToXmlObj(map);
	for(var i=0; i < this.glyphs.length; i++) {
		map.appendChild(this.glyphs[i].buildXmlObj());
	}
	for(var i=0; i < this.arcs.length; i++) {
		map.appendChild(this.arcs[i].buildXmlObj());
	}
	return map;
};

/**
 * @return {string}
 */
Map.prototype.toXML = function () {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @param {Element} xmlObj
 * @return {Map}
 */
Map.fromXML = function (xmlObj) {
	if (xmlObj.localName != 'map') {
		throw new Error("Bad XML provided, expected localName map, got: " + xmlObj.localName);
	}
	var map = new Map();
	map.id = xmlObj.getAttribute('id') || null;
	map.language = xmlObj.getAttribute('language') || null;

	// need to be careful here, as there can be glyph in arcs
	//var glyphsXML = xmlObj.querySelectorAll('map > glyph');
	var glyphsXML = getFirstLevelByName(xmlObj, "glyph");
	for (var i=0; i < glyphsXML.length; i++) {
		var glyph = ns.Glyph.fromXML(glyphsXML[i]);
		map.addGlyph(glyph);
	}
	var arcsXML = xmlObj.getElementsByTagNameNS('*','arc') || null;
	for (var i=0; i < arcsXML.length; i++) {
		var arc = ns.Arc.fromXML(arcsXML[i]);
		map.addArc(arc);
	}

	map.baseFromXML(xmlObj);
	return map;
};
ns.Map = Map;
// ------- END MAP -------

// ------- EXTENSIONS -------
/**
  * Represents the <code>&lt;extension&gt;</code> element.
 * @class
 */
var Extension = function () {
	// consider first order children, add them with their tagname as property of this object
	// store xmlObject if no supported parsing (unrecognized extensions)
	// else store instance of the extension
	this.list = {};
};

/**
 * @param {Element|render.RenderInformation} extension
 */
Extension.prototype.add = function (extension) {
	if (extension instanceof renderExt.RenderInformation) {
		this.list['renderInformation'] = extension;
	}
	else if (extension instanceof annotExt.Annotation) {
		this.list['annotation'] = extension;
	}
	else if (extension.nodeType == '1') { // Node.ELEMENT_NODE == 1
		// case where renderInformation is passed unparsed
		if (extension.localName == 'renderInformation') {
			var renderInformation = renderExt.RenderInformation.fromXML(extension);
			this.list['renderInformation'] = renderInformation;
		}
		else if (extension.localName == 'annotation') {
			var annotation = annotExt.Annotation.fromXML(extension);
			this.list['annotation'] = renderInformation;
		}
		else {
			this.list[extension.localName] = extension;
		}
	}
};

/**
 * @param {string} extensionName
 * @return {boolean}
 */
Extension.prototype.has = function (extensionName) {
	return this.list.hasOwnProperty(extensionName);
};

/**
 * @param {string} extensionName
 * @return {Element|render.RenderInformation}
 */
Extension.prototype.get = function (extensionName) {
	if (this.has(extensionName)) {
		return this.list[extensionName];
	}
	else {
		return null;
	}
};

/**
 * @return {Element}
 */
Extension.prototype.buildXmlObj = function () {
	var extension = new xmldom.DOMImplementation().createDocument().createElement('extension');
	for (var extInstance in this.list) {
		if (extInstance == "renderInformation" || extInstance == "annotation") {
			extension.appendChild(this.get(extInstance).buildXmlObj());
		}
		else {
			// weird hack needed here
			// xmldom doesn't serialize extension correctly if the extension has more than one unsupported extension
			// we need to serialize and unserialize it when appending it here
			var serializeExt = new xmldom.XMLSerializer().serializeToString(this.get(extInstance));
			var unserializeExt = new xmldom.DOMParser().parseFromString(serializeExt); // fresh new dom element
			extension.appendChild(unserializeExt);
		}
	}
	return extension;
};

/**
 * @return {string}
 */
Extension.prototype.toXML = function () {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @param {Element} xmlObj
 * @return {Extension}
 */
Extension.fromXML = function (xmlObj) {
	if (xmlObj.localName != 'extension') {
		throw new Error("Bad XML provided, expected localName extension, got: " + xmlObj.localName);
	}
	var extension = new Extension();
	var children = xmlObj.childNodes;
	for (var i=0; i < children.length; i++) {
		if(!children[i].localName) { // if tagname is here, real element found
			continue;
		}
		var extXmlObj = children[i];
		var extName = extXmlObj.localName;
		//extension.add(extInstance);
		if (extName == 'renderInformation') {
			var renderInformation = renderExt.RenderInformation.fromXML(extXmlObj);
			extension.add(renderInformation);
		}
		else if (extName == 'annotation') {
			var annotation = annotExt.Annotation.fromXML(extXmlObj);
			extension.add(annotation);
		}
		else { // unsupported extension, we still store the data as is
			extension.add(extXmlObj);
		}
	}
	return extension;
};
ns.Extension = Extension;
// ------- END EXTENSIONS -------

// ------- GLYPH -------
/**
 * Represents the <code>&lt;glyph&gt;</code> element.
 * @class Glyph
 * @extends SBGNBase
 * @param {Object} params
 * @param {string=} params.id
 * @param {string=} params.class_
 * @param {string=} params.compartmentRef
 * @param {Label=} params.label
 * @param {Bbox=} params.bbox
 * @param {StateType=} params.state
 * @param {CloneType=} params.clone
 * @param {Glyph[]=} params.glyphMembers
 * @param {Port[]=} params.ports
 */
var Glyph = function (params) {
	ns.SBGNBase.call(this, params);
	var params = checkParams(params, ['id', 'class_', 'compartmentRef', 'label', 'bbox', 'glyphMembers', 'ports', 'state', 'clone']);
	this.id 			= params.id;
	this.class_ 		= params.class_;
	this.compartmentRef = params.compartmentRef;

	// children
	this.label 			= params.label;
	this.state 			= params.state;
	this.bbox 			= params.bbox;
	this.clone 			= params.clone;
	this.glyphMembers 	= params.glyphMembers || []; // case of complex, can have arbitrary list of nested glyphs
	this.ports 			= params.ports || [];

	this.allowedChildren = ['label', 'state', 'bbox', 'clone', 'glyphMembers', 'ports'];
};

Glyph.prototype = Object.create(ns.SBGNBase.prototype);
Glyph.prototype.constructor = Glyph;

/**
 * @param {Label} label
 */
Glyph.prototype.setLabel = function (label) {
	this.label = label;
};

/**
 * @param {StateType} state
 */
Glyph.prototype.setState = function (state) {
	this.state = state;
};

/**
 * @param {Bbox} bbox
 */
Glyph.prototype.setBbox = function (bbox) {
	this.bbox = bbox;
};

/**
 * @param {CloneType} clone
 */
Glyph.prototype.setClone = function (clone) {
	this.clone = clone;
};

/**
 * @param {Glyph} glyphMember
 */
Glyph.prototype.addGlyphMember = function (glyphMember) {
	this.glyphMembers.push(glyphMember);
};

/**
 * @param {Port} port
 */
Glyph.prototype.addPort = function (port) {
	this.ports.push(port);
};

/**
 * @return {Element}
 */
Glyph.prototype.buildXmlObj = function () {
	var glyph = new xmldom.DOMImplementation().createDocument().createElement('glyph');
	// attributes
	if(this.id != null) {
		glyph.setAttribute('id', this.id);
	}
	if(this.class_ != null) {
		glyph.setAttribute('class', this.class_);
	}
	if(this.compartmentRef != null) {
		glyph.setAttribute('compartmentRef', this.compartmentRef);
	}
	// children
	if(this.label != null) {
		glyph.appendChild(this.label.buildXmlObj());
	}
	if(this.state != null) {
		glyph.appendChild(this.state.buildXmlObj());
	}
	if(this.bbox != null) {
		glyph.appendChild(this.bbox.buildXmlObj());
	}
	if(this.clone != null) {
		glyph.appendChild(this.clone.buildXmlObj());
	}
	for(var i=0; i < this.glyphMembers.length; i++) {
		glyph.appendChild(this.glyphMembers[i].buildXmlObj());
	}
	for(var i=0; i < this.ports.length; i++) {
		glyph.appendChild(this.ports[i].buildXmlObj());
	}
	this.baseToXmlObj(glyph);
	return glyph;
};

/**
 * @return {string}
 */
Glyph.prototype.toXML = function () {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @param {Element} xmlObj
 * @return {Glyph}
 */
Glyph.fromXML = function (xmlObj) {
	if (xmlObj.localName != 'glyph') {
		throw new Error("Bad XML provided, expected localName glyph, got: " + xmlObj.localName);
	}
	var glyph = new Glyph();
	glyph.id 				= xmlObj.getAttribute('id') || null;
	glyph.class_ 			= xmlObj.getAttribute('class') || null;
	glyph.compartmentRef 	= xmlObj.getAttribute('compartmentRef') || null;

	var labelXML = xmlObj.getElementsByTagNameNS('*', 'label')[0];
	if (labelXML != null) {
		var label = ns.Label.fromXML(labelXML);
		glyph.setLabel(label);
	}
	var stateXML = xmlObj.getElementsByTagNameNS('*', 'state')[0];
	if (stateXML != null) {
		var state = ns.StateType.fromXML(stateXML);
		glyph.setState(state);
	}
	var bboxXML = xmlObj.getElementsByTagNameNS('*', 'bbox')[0];
	if (bboxXML != null) {
		var bbox = ns.Bbox.fromXML(bboxXML);
		glyph.setBbox(bbox);
	}
	var cloneXMl = xmlObj.getElementsByTagNameNS('*', 'clone')[0];
	if (cloneXMl != null) {
		var clone = ns.CloneType.fromXML(cloneXMl);
		glyph.setClone(clone);
	}
	// need special care because of recursion of nested glyph nodes
	// take only first level glyphs
	var children = xmlObj.childNodes;
	for (var j=0; j < children.length; j++) { // loop through all first level children
		var child = children[j];
		if (child.localName && child.localName == "glyph") { // here we only want the glyh children
			var glyphMember = Glyph.fromXML(child); // recursive call on nested glyph
			glyph.addGlyphMember(glyphMember);
		}
	}
	var portsXML = xmlObj.getElementsByTagNameNS('*', 'port');
	for (var i=0; i < portsXML.length; i++) {
		var port = ns.Port.fromXML(portsXML[i]);
		glyph.addPort(port);
	}
	glyph.baseFromXML(xmlObj);
	return glyph;
};
ns.Glyph = Glyph;
// ------- END GLYPH -------

// ------- LABEL -------
/**
 * Represents the <code>&lt;label&gt;</code> element.
 * @class Label
 * @extends SBGNBase
 * @param {Object} params
 * @param {string=} params.text
 */
var Label = function (params) {
	ns.SBGNBase.call(this, params);
	var params = checkParams(params, ['text']);
	this.text = params.text;

	this.allowedChildren = [];
};

Label.prototype = Object.create(ns.SBGNBase.prototype);
Label.prototype.constructor = ns.Label;

/**
 * @return {Element}
 */
Label.prototype.buildXmlObj = function () {
	var label = new xmldom.DOMImplementation().createDocument().createElement('label');
	if(this.text != null) {
		label.setAttribute('text', this.text);
	}
	this.baseToXmlObj(label);
	return label;
};

/**
 * @return {string}
 */
Label.prototype.toXML = function () {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @param {Element} xmlObj
 * @return {Label}
 */
Label.fromXML = function (xmlObj) {
	if (xmlObj.localName != 'label') {
		throw new Error("Bad XML provided, expected localName label, got: " + xmlObj.localName);
	}
	var label = new ns.Label();
	label.text = xmlObj.getAttribute('text') || null;
	label.baseFromXML(xmlObj);
	return label;
};
ns.Label = Label;
// ------- END LABEL -------

// ------- BBOX -------
/**
 * Represents the <code>&lt;bbox&gt;</code> element.
 * @class Bbox
 * @extends SBGNBase
 * @param {Object} params
 * @param {string|number=} params.x
 * @param {string|number=} params.y
 * @param {string|number=} params.w
 * @param {string|number=} params.h
 */
var Bbox = function (params) {
	ns.SBGNBase.call(this, params);
	var params = checkParams(params, ['x', 'y', 'w', 'h']);
	this.x = parseFloat(params.x);
	this.y = parseFloat(params.y);
	this.w = parseFloat(params.w);
	this.h = parseFloat(params.h);

	this.allowedChildren = [];
};

Bbox.prototype = Object.create(ns.SBGNBase.prototype);
Bbox.prototype.constructor = ns.Bbox;

/**
 * @return {Element}
 */
Bbox.prototype.buildXmlObj = function () {
	var bbox = new xmldom.DOMImplementation().createDocument().createElement('bbox');
	if(!isNaN(this.x)) {
		bbox.setAttribute('x', this.x);
	}
	if(!isNaN(this.y)) {
		bbox.setAttribute('y', this.y);
	}
	if(!isNaN(this.w)) {
		bbox.setAttribute('w', this.w);
	}
	if(!isNaN(this.h)) {
		bbox.setAttribute('h', this.h);
	}
	this.baseToXmlObj(bbox);
	return bbox;
}

/**
 * @return {string}
 */
Bbox.prototype.toXML = function () {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @param {Element} xmlObj
 * @return {Bbox}
 */
Bbox.fromXML = function (xmlObj) {
	if (xmlObj.localName != 'bbox') {
		throw new Error("Bad XML provided, expected localName bbox, got: " + xmlObj.localName);
	}
	var bbox = new ns.Bbox();
	bbox.x = parseFloat(xmlObj.getAttribute('x'));
	bbox.y = parseFloat(xmlObj.getAttribute('y'));
	bbox.w = parseFloat(xmlObj.getAttribute('w'));
	bbox.h = parseFloat(xmlObj.getAttribute('h'));
	bbox.baseFromXML(xmlObj);
	return bbox;
};
ns.Bbox = Bbox;
// ------- END BBOX -------

// ------- STATE -------
/**
 * Represents the <code>&lt;state&gt;</code> element.
 * @class StateType
 * @param {Object} params
 * @param {string=} params.value
 * @param {string=} params.variable
 */
var StateType = function (params) {
	var params = checkParams(params, ['value', 'variable']);
	this.value = params.value;
	this.variable = params.variable;
};

/**
 * @return {Element}
 */
StateType.prototype.buildXmlObj = function () {
	var state = new xmldom.DOMImplementation().createDocument().createElement('state');
	if(this.value != null) {
		state.setAttribute('value', this.value);
	}
	if(this.variable != null) {
		state.setAttribute('variable', this.variable);
	}
	return state;
};

/**
 * @return {string}
 */
StateType.prototype.toXML = function () {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @param {Element} xmlObj
 * @return {StateType}
 */
StateType.fromXML = function (xmlObj) {
	if (xmlObj.localName != 'state') {
		throw new Error("Bad XML provided, expected localName state, got: " + xmlObj.localName);
	}
	var state = new ns.StateType();
	state.value = xmlObj.getAttribute('value') || null;
	state.variable = xmlObj.getAttribute('variable') || null;
	return state;
};
ns.StateType = StateType;
// ------- END STATE -------

// ------- CLONE -------
/**
 * Represents the <code>&lt;clone&gt;</code> element.
 * @class CloneType
 * @param {Object} params
 * @param {string=} params.label
 */
var CloneType = function (params) {
	var params = checkParams(params, ['label']);
	this.label = params.label;
};

/**
 * @return {Element}
 */
CloneType.prototype.buildXmlObj = function () {
	var clone = new xmldom.DOMImplementation().createDocument().createElement('clone');
	if(this.label != null) {
		clone.setAttribute('label', this.label);
	}
	return clone;
};

/**
 * @return {string}
 */
CloneType.prototype.toXML = function () {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @param {Element} xmlObj
 * @return {CloneType}
 */
CloneType.fromXML = function (xmlObj) {
	if (xmlObj.localName != 'clone') {
		throw new Error("Bad XML provided, expected localName clone, got: " + xmlObj.localName);
	}
	var clone = new ns.CloneType();
	clone.label = xmlObj.getAttribute('label') || null;
	return clone;
};
ns.CloneType = CloneType;
// ------- END CLONE -------

// ------- PORT -------
/**
 * Represents the <code>&lt;port&gt;</code> element.
 * @class Port
 * @param {Object} params
 * @param {string=} params.id
 * @param {string|number=} params.x
 * @param {string|number=} params.y
 */
var Port = function (params) {
	ns.SBGNBase.call(this, params);
	var params = checkParams(params, ['id', 'x', 'y']);
	this.id = params.id;
	this.x 	= parseFloat(params.x);
	this.y 	= parseFloat(params.y);

	this.allowedChildren = [];
};

Port.prototype = Object.create(ns.SBGNBase.prototype);
Port.prototype.constructor = ns.Port;

/**
 * @return {Element}
 */
Port.prototype.buildXmlObj = function () {
	var port = new xmldom.DOMImplementation().createDocument().createElement('port');
	if(this.id != null) {
		port.setAttribute('id', this.id);
	}
	if(!isNaN(this.x)) {
		port.setAttribute('x', this.x);
	}
	if(!isNaN(this.y)) {
		port.setAttribute('y', this.y);
	}
	this.baseToXmlObj(port);
	return port;
};

/**
 * @return {string}
 */
Port.prototype.toXML = function () {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @param {Element} xmlObj
 * @return {Port}
 */
Port.fromXML = function (xmlObj) {
	if (xmlObj.localName != 'port') {
		throw new Error("Bad XML provided, expected localName port, got: " + xmlObj.localName);
	}
	var port = new ns.Port();
	port.x 	= parseFloat(xmlObj.getAttribute('x'));
	port.y 	= parseFloat(xmlObj.getAttribute('y'));
	port.id = xmlObj.getAttribute('id') || null;
	port.baseFromXML(xmlObj);
	return port;
};
ns.Port = Port;
// ------- END PORT -------

// ------- ARC -------
/**
 * Represents the <code>&lt;arc&gt;</code> element.
 * @class Arc
 * @param {Object} params
 * @param {string=} params.id
 * @param {string=} params.class_
 * @param {string=} params.source
 * @param {string=} params.target
 * @param {StartType=} params.start
 * @param {EndType=} params.end
 * @param {NextType=} params.nexts
 * @param {Glyph[]=} params.glyphs The arc's cardinality. Possibility to have more than one glyph is left open.
 */
var Arc = function (params) {
	ns.SBGNBase.call(this, params);
	var params = checkParams(params, ['id', 'class_', 'source', 'target', 'start', 'end', 'nexts', 'glyphs']);
	this.id 	= params.id;
	this.class_ = params.class_;
	this.source = params.source;
	this.target = params.target;

	this.start 	= params.start;
	this.end 	= params.end;
	this.nexts 	= params.nexts || [];
	this.glyphs = params.glyphs || [];

	this.allowedChildren = ['start', 'nexts', 'end', 'glyphs'];
};

Arc.prototype = Object.create(ns.SBGNBase.prototype);
Arc.prototype.constructor = ns.Arc;

/**
 * @param {StartType} start
 */
Arc.prototype.setStart = function (start) {
	this.start = start;
};

/**
 * @param {EndType} end
 */
Arc.prototype.setEnd = function (end) {
	this.end = end;
};

/**
 * @param {NextType} next
 */
Arc.prototype.addNext = function (next) {
	this.nexts.push(next);
};

/**
 * @param {Glyph} glyph
 */
Arc.prototype.addGlyph = function (glyph) {
	this.glyphs.push(glyph);
};

/**
 * @return {Element}
 */
Arc.prototype.buildXmlObj = function () {
	var arc = new xmldom.DOMImplementation().createDocument().createElement('arc');
	// attributes
	if(this.id != null) {
		arc.setAttribute('id', this.id);
	}
	if(this.class_ != null) {
		arc.setAttribute('class', this.class_);
	}
	if(this.source != null) {
		arc.setAttribute('source', this.source);
	}
	if(this.target != null) {
		arc.setAttribute('target', this.target);
	}
	// children
	for(var i=0; i < this.glyphs.length; i++) {
		arc.appendChild(this.glyphs[i].buildXmlObj());
	}
	if(this.start != null) {
		arc.appendChild(this.start.buildXmlObj());
	}
	for(var i=0; i < this.nexts.length; i++) {
		arc.appendChild(this.nexts[i].buildXmlObj());
	}
	if(this.end != null) {
		arc.appendChild(this.end.buildXmlObj());
	}
	this.baseToXmlObj(arc);
	return arc;
};

/**
 * @return {string}
 */
Arc.prototype.toXML = function () {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @param {Element} xmlObj
 * @return {Arc}
 */
Arc.fromXML = function (xmlObj) {
	if (xmlObj.localName != 'arc') {
		throw new Error("Bad XML provided, expected localName arc, got: " + xmlObj.localName);
	}
	var arc = new ns.Arc();
	arc.id 		= xmlObj.getAttribute('id') || null;
	arc.class_ 	= xmlObj.getAttribute('class') || null;
	arc.source 	= xmlObj.getAttribute('source') || null;
	arc.target 	= xmlObj.getAttribute('target') || null;

	var startXML = xmlObj.getElementsByTagNameNS('*', 'start')[0];
	if (startXML != null) {
		var start = ns.StartType.fromXML(startXML);
		arc.setStart(start);
	}
	var nextXML = xmlObj.getElementsByTagNameNS('*', 'next');
	for (var i=0; i < nextXML.length; i++) {
		var next = ns.NextType.fromXML(nextXML[i]);
		arc.addNext(next);
	}
	var endXML = xmlObj.getElementsByTagNameNS('*', 'end')[0];
	if (endXML != null) {
		var end = ns.EndType.fromXML(endXML);
		arc.setEnd(end);
	}
	var glyphsXML = xmlObj.getElementsByTagNameNS('*', 'glyph');
	for (var i=0; i < glyphsXML.length; i++) {
		var glyph = ns.Glyph.fromXML(glyphsXML[i]);
		arc.addGlyph(glyph);
	}

	arc.baseFromXML(xmlObj);
	return arc;
};
ns.Arc = Arc;
// ------- END ARC -------

// ------- STARTTYPE -------
/**
 * Represents the <code>&lt;start&gt;</code> element.
 * @class StartType
 * @param {Object} params
 * @param {string|number=} params.x
 * @param {string|number=} params.y
 */
var StartType = function (params) {
	var params = checkParams(params, ['x', 'y']);
	this.x = parseFloat(params.x);
	this.y = parseFloat(params.y);
};

/**
 * @return {Element}
 */
StartType.prototype.buildXmlObj = function () {
	var start = new xmldom.DOMImplementation().createDocument().createElement('start');
	if(!isNaN(this.x)) {
		start.setAttribute('x', this.x);
	}
	if(!isNaN(this.y)) {
		start.setAttribute('y', this.y);
	}
	return start;
};

/**
 * @return {string}
 */
StartType.prototype.toXML = function () {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @param {Element} xmlObj
 * @return {StartType}
 */
StartType.fromXML = function (xmlObj) {
	if (xmlObj.localName != 'start') {
		throw new Error("Bad XML provided, expected localName start, got: " + xmlObj.localName);
	}
	var start = new ns.StartType();
	start.x = parseFloat(xmlObj.getAttribute('x'));
	start.y = parseFloat(xmlObj.getAttribute('y'));
	return start;
};
ns.StartType = StartType;
// ------- END STARTTYPE -------

// ------- ENDTYPE -------
/**
 * Represents the <code>&lt;end&gt;</code> element.
 * @class EndType
 * @param {Object} params
 * @param {string|number=} params.x
 * @param {string|number=} params.y
 */
var EndType = function (params) {
	var params = checkParams(params, ['x', 'y']);
	this.x = parseFloat(params.x);
	this.y = parseFloat(params.y);
};

/**
 * @return {Element}
 */
EndType.prototype.buildXmlObj = function () {
	var end = new xmldom.DOMImplementation().createDocument().createElement('end');
	if(!isNaN(this.x)) {
		end.setAttribute('x', this.x);
	}
	if(!isNaN(this.y)) {
		end.setAttribute('y', this.y);
	}
	return end;
};

/**
 * @return {string}
 */
EndType.prototype.toXML = function () {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @param {Element} xmlObj
 * @return {EndType}
 */
EndType.fromXML = function (xmlObj) {
	if (xmlObj.localName != 'end') {
		throw new Error("Bad XML provided, expected localName end, got: " + xmlObj.localName);
	}
	var end = new ns.EndType();
	end.x = parseFloat(xmlObj.getAttribute('x'));
	end.y = parseFloat(xmlObj.getAttribute('y'));
	return end;
};
ns.EndType = EndType;
// ------- END ENDTYPE -------

// ------- NEXTTYPE -------
/**
 * Represents the <code>&lt;next&gt;</code> element.
 * @class NextType
 * @param {Object} params
 * @param {string|number=} params.x
 * @param {string|number=} params.y
 */
var NextType = function (params) {
	var params = checkParams(params, ['x', 'y']);
	this.x = parseFloat(params.x);
	this.y = parseFloat(params.y);
};

/**
 * @return {Element}
 */
NextType.prototype.buildXmlObj = function () {
	var next = new xmldom.DOMImplementation().createDocument().createElement('next');
	if(!isNaN(this.x)) {
		next.setAttribute('x', this.x);
	}
	if(!isNaN(this.y)) {
		next.setAttribute('y', this.y);
	}
	return next;
};

/**
 * @return {string}
 */
NextType.prototype.toXML = function () {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @param {Element} xmlObj
 * @return {NextType}
 */
NextType.fromXML = function (xmlObj) {
	if (xmlObj.localName != 'next') {
		throw new Error("Bad XML provided, expected localName next, got: " + xmlObj.localName);
	}
	var next = new ns.NextType();
	next.x = parseFloat(xmlObj.getAttribute('x'));
	next.y = parseFloat(xmlObj.getAttribute('y'));
	return next;
};
ns.NextType = NextType;
// ------- END NEXTTYPE -------

ns.render = renderExt;
ns.annot = annotExt;
module.exports = ns;