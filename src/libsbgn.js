var renderExt = require('./libsbgn-render');
//var annotExt = require('./libsbgn-annotations');
var checkParams = require('./utilities').checkParams;
var getFirstLevelGlyphs = require('./utilities').getFirstLevelGlyphs;
var xmldom = require('xmldom');

var ns = {};

ns.xmlns = "http://sbgn.org/libsbgn/0.3";

// ------- SBGNBase -------
/**
 * Parent class for several sbgn elements. Used to provide extension element.
 * End users don't need to interact with it. It can be safely ignored.
 * @class
 * @name SBGNBase
 * @param {Object} params
 * @param {Extension=} params.extension
 */
ns.SBGNBase = function (params) {
	var params = checkParams(params, ['extension']);
	this.extension 	= params.extension;
};

/**
 * Allows inheriting objects to get an extension element.
 * @memberof SBGNBase.prototype
 * @param {Extension} extension
 */
ns.SBGNBase.prototype.setExtension = function (extension) {
	this.extension = extension;
};

/**
 * @memberof SBGNBase.prototype
 * @param {Element} xmlObj the xml object being built from 'this'
 */
ns.SBGNBase.prototype.baseToXmlObj = function (xmlObj) {
	if(this.extension != null) {
		xmlObj.appendChild(this.extension.buildXmlObj());
	}
};

/**
 * parse things specific to SBGNBase type
 * @memberof SBGNBase.prototype
 * @param {Element} xmlObj the xml object being parsed
 */
ns.SBGNBase.prototype.baseFromXML = function (xmlObj) {
	// children
	var extensionXML = xmlObj.getElementsByTagName('extension')[0];
	if (extensionXML != null) {
		var extension = ns.Extension.fromXML(extensionXML);
		this.setExtension(extension);
	}
};
// ------- END SBGNBase -------

// ------- SBGN -------
/**
 * Represents the <code>&lt;sbgn&gt;</code> element.
 * @class
 * @name Sbgn
 * @extends SBGNBase
 * @param {Object} params
 * @param {string=} params.xmlns
 * @param {Map=} params.map
 */
ns.Sbgn = function (params) {
	ns.SBGNBase.call(this, params);
	var params = checkParams(params, ['xmlns', 'map']);
	this.xmlns 	= params.xmlns;
	this.map 	= params.map;

	this.allowedChildren = ['map'];
	this.tagName = 'sbgn';
};

ns.Sbgn.prototype = Object.create(ns.SBGNBase.prototype);
ns.Sbgn.prototype.constructor = ns.Sbgn;

/**
 * @memberof Sbgn.prototype
 * @param {Map} map
 */
ns.Sbgn.prototype.setMap = function (map) {
	this.map = map;
};

/**
 * @memberof Sbgn.prototype
 * @return {Element}
 */
ns.Sbgn.prototype.buildXmlObj = function () {
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
 * @memberof Sbgn.prototype
 * @return {string}
 */
ns.Sbgn.prototype.toXML = function () {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @memberof Sbgn
 * @param {Element} xmlObj
 * @return {Sbgn}
 */
ns.Sbgn.fromXML = function (xmlObj) {
	if (xmlObj.tagName != 'sbgn') {
		throw new Error("Bad XML provided, expected tagName sbgn, got: " + xmlObj.tagName);
	}
	var sbgn = new ns.Sbgn();
	sbgn.xmlns = xmlObj.getAttribute('xmlns') || null;

	// get children
	var mapXML = xmlObj.getElementsByTagName('map')[0];
	if (mapXML != null) {
		var map = ns.Map.fromXML(mapXML);
		sbgn.setMap(map);
	}
	sbgn.baseFromXML(xmlObj); // call to parent class
	return sbgn;
};
// ------- END SBGN -------

// ------- MAP -------
/**
 * Represents the <code>&lt;map&gt;</code> element.
 * @class
 * @name Map
 * @extends SBGNBase
 * @param {Object} params
 * @param {string=} params.id
 * @param {string=} params.language
 * @param {Glyph[]=} params.glyphs
 * @param {Arc[]=} params.arcs
 */
ns.Map = function (params) {
	ns.SBGNBase.call(this, params);
	var params = checkParams(params, ['id', 'language', 'glyphs', 'arcs']);
	this.id 		= params.id;
	this.language 	= params.language;
	this.glyphs 	= params.glyphs || [];
	this.arcs 		= params.arcs || [];

	this.allowedChildren = ['glyphs', 'arcs'];
	this.tagName = 'map';
};

ns.Map.prototype = Object.create(ns.SBGNBase.prototype);
ns.Map.prototype.constructor = ns.Map;

/**
 * @memberof Map.prototype
 * @param {Glyph} glyph
 */
ns.Map.prototype.addGlyph = function (glyph) {
	this.glyphs.push(glyph);
};

/**
 * @memberof Map.prototype
 * @param {Arc} arc
 */
ns.Map.prototype.addArc = function (arc) {
	this.arcs.push(arc);
};

/**
 * @memberof Map.prototype
 * @return {Element}
 */
ns.Map.prototype.buildXmlObj = function () {
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
 * @memberof Map.prototype
 * @return {string}
 */
ns.Map.prototype.toXML = function () {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @memberof Map
 * @param {Element} xmlObj
 * @return {Map}
 */
ns.Map.fromXML = function (xmlObj) {
	if (xmlObj.tagName != 'map') {
		throw new Error("Bad XML provided, expected tagName map, got: " + xmlObj.tagName);
	}
	var map = new ns.Map();
	map.id = xmlObj.getAttribute('id') || null;
	map.language = xmlObj.getAttribute('language') || null;

	// need to be careful here, as there can be glyph in arcs
	//var glyphsXML = xmlObj.querySelectorAll('map > glyph');
	var glyphsXML = getFirstLevelGlyphs(xmlObj);
	for (var i=0; i < glyphsXML.length; i++) {
		var glyph = ns.Glyph.fromXML(glyphsXML[i]);
		map.addGlyph(glyph);
	}
	var arcsXML = xmlObj.getElementsByTagName('arc') || null;
	for (var i=0; i < arcsXML.length; i++) {
		var arc = ns.Arc.fromXML(arcsXML[i]);
		map.addArc(arc);
	}

	map.baseFromXML(xmlObj);
	return map;
};
// ------- END MAP -------

// ------- EXTENSIONS -------
/**
  * Represents the <code>&lt;extension&gt;</code> element.
 * @class
 * @name Extension
 */
ns.Extension = function () {
	// consider first order children, add them with their tagname as property of this object
	// store xmlObject if no supported parsing (unrecognized extensions)
	// else store instance of the extension
	this.list = {};
};

/**
 * @memberof Extension.prototype
 * @param {Element|renderExtension.RenderInformation} extension
 */
ns.Extension.prototype.add = function (extension) {
	if (extension instanceof renderExt.RenderInformation) {
		this.list['renderInformation'] = extension;
	}
	else if (extension.nodeType == '1') { // Node.ELEMENT_NODE == 1
		// case where renderInformation is passed unparsed
		if (extension.tagName == 'renderInformation') {
			var renderInformation = renderExt.RenderInformation.fromXML(extension);
			this.list['renderInformation'] = renderInformation;
		}
		else {
			this.list[extension.tagName] = extension;
		}
	}
};

/**
 * @memberof Extension.prototype
 * @param {string} extensionName
 * @return {boolean}
 */
ns.Extension.prototype.has = function (extensionName) {
	return this.list.hasOwnProperty(extensionName);
};

/**
 * @memberof Extension.prototype
 * @param {string} extensionName
 * @return {Element|renderExtension.RenderInformation}
 */
ns.Extension.prototype.get = function (extensionName) {
	if (this.has(extensionName)) {
		return this.list[extensionName];
	}
	else {
		return null;
	}
};

/**
 * @memberof Extension.prototype
 * @return {Element}
 */
ns.Extension.prototype.buildXmlObj = function () {
	var extension = new xmldom.DOMImplementation().createDocument().createElement('extension');
	for (var extInstance in this.list) {
		if (extInstance == "renderInformation") {
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
 * @memberof Extension.prototype
 * @return {string}
 */
ns.Extension.prototype.toXML = function () {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @memberof Extension
 * @param {Element} xmlObj
 * @return {Extension}
 */
ns.Extension.fromXML = function (xmlObj) {
	if (xmlObj.tagName != 'extension') {
		throw new Error("Bad XML provided, expected tagName extension, got: " + xmlObj.tagName);
	}
	var extension = new ns.Extension();
	var children = xmlObj.childNodes;
	for (var i=0; i < children.length; i++) {
		if(!children[i].tagName) { // if tagname is here, real element found
			continue;
		}
		var extXmlObj = children[i];
		var extName = extXmlObj.tagName;
		//extension.add(extInstance);
		if (extName == 'renderInformation') {
			var renderInformation = renderExt.RenderInformation.fromXML(extXmlObj);
			extension.add(renderInformation);
		}
		else if (extName == 'annotations') {
			extension.add(extXmlObj); // to be parsed correctly
		}
		else { // unsupported extension, we still store the data as is
			extension.add(extXmlObj);
		}
	}
	return extension;
};
// ------- END EXTENSIONS -------

// ------- GLYPH -------
/**
 * Represents the <code>&lt;glyph&gt;</code> element.
 * @class Glyph
 * @name Glyph
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
ns.Glyph = function (params) {
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
	this.tagName = 'glyph';
};

ns.Glyph.prototype = Object.create(ns.SBGNBase.prototype);
ns.Glyph.prototype.constructor = ns.Glyph;

/**
 * @memberof Glyph.prototype
 * @param {Label} label
 */
ns.Glyph.prototype.setLabel = function (label) {
	this.label = label;
};

/**
 * @memberof Glyph.prototype
 * @param {StateType} state
 */
ns.Glyph.prototype.setState = function (state) {
	this.state = state;
};

/**
 * @memberof Glyph.prototype
 * @param {Bbox} bbox
 */
ns.Glyph.prototype.setBbox = function (bbox) {
	this.bbox = bbox;
};

/**
 * @memberof Glyph.prototype
 * @param {CloneType} clone
 */
ns.Glyph.prototype.setClone = function (clone) {
	this.clone = clone;
};

/**
 * @memberof Glyph.prototype
 * @param {Glyph} glyphMember
 */
ns.Glyph.prototype.addGlyphMember = function (glyphMember) {
	this.glyphMembers.push(glyphMember);
};

/**
 * @memberof Glyph.prototype
 * @param {Port} port
 */
ns.Glyph.prototype.addPort = function (port) {
	this.ports.push(port);
};

/**
 * @memberof Glyph.prototype
 * @return {Element}
 */
ns.Glyph.prototype.buildXmlObj = function () {
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
 * @memberof Glyph.prototype
 * @return {string}
 */
ns.Glyph.prototype.toXML = function () {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @memberof Glyph
 * @param {Element} xmlObj
 * @return {Glyph}
 */
ns.Glyph.fromXML = function (xmlObj) {
	if (xmlObj.tagName != 'glyph') {
		throw new Error("Bad XML provided, expected tagName glyph, got: " + xmlObj.tagName);
	}
	var glyph = new ns.Glyph();
	glyph.id 				= xmlObj.getAttribute('id') || null;
	glyph.class_ 			= xmlObj.getAttribute('class') || null;
	glyph.compartmentRef 	= xmlObj.getAttribute('compartmentRef') || null;

	var labelXML = xmlObj.getElementsByTagName('label')[0];
	if (labelXML != null) {
		var label = ns.Label.fromXML(labelXML);
		glyph.setLabel(label);
	}
	var stateXML = xmlObj.getElementsByTagName('state')[0];
	if (stateXML != null) {
		var state = ns.StateType.fromXML(stateXML);
		glyph.setState(state);
	}
	var bboxXML = xmlObj.getElementsByTagName('bbox')[0];
	if (bboxXML != null) {
		var bbox = ns.Bbox.fromXML(bboxXML);
		glyph.setBbox(bbox);
	}
	var cloneXMl = xmlObj.getElementsByTagName('clone')[0];
	if (cloneXMl != null) {
		var clone = ns.CloneType.fromXML(cloneXMl);
		glyph.setClone(clone);
	}
	// need special care because of recursion of nested glyph nodes
	// take only first level glyphs
	var children = xmlObj.childNodes;
	for (var j=0; j < children.length; j++) { // loop through all first level children
		var child = children[j];
		if (child.tagName && child.tagName == "glyph") { // here we only want the glyh children
			var glyphMember = ns.Glyph.fromXML(child); // recursive call on nested glyph
			glyph.addGlyphMember(glyphMember);
		}
	}
	var portsXML = xmlObj.getElementsByTagName('port');
	for (var i=0; i < portsXML.length; i++) {
		var port = ns.Port.fromXML(portsXML[i]);
		glyph.addPort(port);
	}
	glyph.baseFromXML(xmlObj);
	return glyph;
};
// ------- END GLYPH -------

// ------- LABEL -------
/**
 * Represents the <code>&lt;label&gt;</code> element.
 * @class Label
 * @name Label
 * @extends SBGNBase
 * @param {Object} params
 * @param {string=} params.text
 */
ns.Label = function (params) {
	ns.SBGNBase.call(this, params);
	var params = checkParams(params, ['text']);
	this.text = params.text;

	this.allowedChildren = [];
	this.tagName = 'label';
};

ns.Label.prototype = Object.create(ns.SBGNBase.prototype);
ns.Label.prototype.constructor = ns.Label;

/**
 * @memberof Label.prototype
 * @return {Element}
 */
ns.Label.prototype.buildXmlObj = function () {
	var label = new xmldom.DOMImplementation().createDocument().createElement('label');
	if(this.text != null) {
		label.setAttribute('text', this.text);
	}
	this.baseToXmlObj(label);
	return label;
};

/**
 * @memberof Label.prototype
 * @return {string}
 */
ns.Label.prototype.toXML = function () {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @memberof Label
 * @param {Element} xmlObj
 * @return {Label}
 */
ns.Label.fromXML = function (xmlObj) {
	if (xmlObj.tagName != 'label') {
		throw new Error("Bad XML provided, expected tagName label, got: " + xmlObj.tagName);
	}
	var label = new ns.Label();
	label.text = xmlObj.getAttribute('text') || null;
	label.baseFromXML(xmlObj);
	return label;
};
// ------- END LABEL -------

// ------- BBOX -------
/**
 * Represents the <code>&lt;bbox&gt;</code> element.
 * @class Bbox
 * @name Bbox
 * @extends SBGNBase
 * @param {Object} params
 * @param {string|number=} params.x
 * @param {string|number=} params.y
 * @param {string|number=} params.w
 * @param {string|number=} params.h
 */
ns.Bbox = function (params) {
	ns.SBGNBase.call(this, params);
	var params = checkParams(params, ['x', 'y', 'w', 'h']);
	this.x = parseFloat(params.x);
	this.y = parseFloat(params.y);
	this.w = parseFloat(params.w);
	this.h = parseFloat(params.h);

	this.allowedChildren = [];
	this.tagName = 'bbox';
};

ns.Bbox.prototype = Object.create(ns.SBGNBase.prototype);
ns.Bbox.prototype.constructor = ns.Bbox;

/**
 * @memberof Bbox.prototype
 * @return {Element}
 */
ns.Bbox.prototype.buildXmlObj = function () {
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
 * @memberof Bbox.prototype
 * @return {string}
 */
ns.Bbox.prototype.toXML = function () {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @memberof Bbox
 * @param {Element} xmlObj
 * @return {Bbox}
 */
ns.Bbox.fromXML = function (xmlObj) {
	if (xmlObj.tagName != 'bbox') {
		throw new Error("Bad XML provided, expected tagName bbox, got: " + xmlObj.tagName);
	}
	var bbox = new ns.Bbox();
	bbox.x = parseFloat(xmlObj.getAttribute('x'));
	bbox.y = parseFloat(xmlObj.getAttribute('y'));
	bbox.w = parseFloat(xmlObj.getAttribute('w'));
	bbox.h = parseFloat(xmlObj.getAttribute('h'));
	bbox.baseFromXML(xmlObj);
	return bbox;
};
// ------- END BBOX -------

// ------- STATE -------
/**
 * Represents the <code>&lt;state&gt;</code> element.
 * @class StateType
 * @name StateType
 * @param {Object} params
 * @param {string=} params.value
 * @param {string=} params.variable
 */
ns.StateType = function (params) {
	var params = checkParams(params, ['value', 'variable']);
	this.value = params.value;
	this.variable = params.variable;
};

/**
 * @memberof StateType.prototype
 * @return {Element}
 */
ns.StateType.prototype.buildXmlObj = function () {
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
 * @memberof StateType.prototype
 * @return {string}
 */
ns.StateType.prototype.toXML = function () {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @memberof StateType
 * @param {Element} xmlObj
 * @return {StateType}
 */
ns.StateType.fromXML = function (xmlObj) {
	if (xmlObj.tagName != 'state') {
		throw new Error("Bad XML provided, expected tagName state, got: " + xmlObj.tagName);
	}
	var state = new ns.StateType();
	state.value = xmlObj.getAttribute('value') || null;
	state.variable = xmlObj.getAttribute('variable') || null;
	return state;
};
// ------- END STATE -------

// ------- CLONE -------
/**
 * Represents the <code>&lt;clone&gt;</code> element.
 * @class CloneType
 * @name CloneType
 * @param {Object} params
 * @param {string=} params.label
 */
ns.CloneType = function (params) {
	var params = checkParams(params, ['label']);
	this.label = params.label;
};

/**
 * @memberof CloneType.prototype
 * @return {Element}
 */
ns.CloneType.prototype.buildXmlObj = function () {
	var clone = new xmldom.DOMImplementation().createDocument().createElement('clone');
	if(this.label != null) {
		clone.setAttribute('label', this.label);
	}
	return clone;
};

/**
 * @memberof CloneType.prototype
 * @return {string}
 */
ns.CloneType.prototype.toXML = function () {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @memberof CloneType
 * @param {Element} xmlObj
 * @return {CloneType}
 */
ns.CloneType.fromXML = function (xmlObj) {
	if (xmlObj.tagName != 'clone') {
		throw new Error("Bad XML provided, expected tagName clone, got: " + xmlObj.tagName);
	}
	var clone = new ns.CloneType();
	clone.label = xmlObj.getAttribute('label') || null;
	return clone;
};
// ------- END CLONE -------

// ------- PORT -------
/**
 * Represents the <code>&lt;port&gt;</code> element.
 * @class Port
 * @name Port
 * @param {Object} params
 * @param {string=} params.id
 * @param {string|number=} params.x
 * @param {string|number=} params.y
 */
ns.Port = function (params) {
	ns.SBGNBase.call(this, params);
	var params = checkParams(params, ['id', 'x', 'y']);
	this.id = params.id;
	this.x 	= parseFloat(params.x);
	this.y 	= parseFloat(params.y);

	this.allowedChildren = [];
	this.tagName = 'port';
};

ns.Port.prototype = Object.create(ns.SBGNBase.prototype);
ns.Port.prototype.constructor = ns.Port;

/**
 * @memberof Port.prototype
 * @return {Element}
 */
ns.Port.prototype.buildXmlObj = function () {
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
 * @memberof Port.prototype
 * @return {string}
 */
ns.Port.prototype.toXML = function () {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @memberof Port
 * @param {Element} xmlObj
 * @return {Port}
 */
ns.Port.fromXML = function (xmlObj) {
	if (xmlObj.tagName != 'port') {
		throw new Error("Bad XML provided, expected tagName port, got: " + xmlObj.tagName);
	}
	var port = new ns.Port();
	port.x 	= parseFloat(xmlObj.getAttribute('x'));
	port.y 	= parseFloat(xmlObj.getAttribute('y'));
	port.id = xmlObj.getAttribute('id') || null;
	port.baseFromXML(xmlObj);
	return port;
};
// ------- END PORT -------

// ------- ARC -------
/**
 * Represents the <code>&lt;arc&gt;</code> element.
 * @class Arc
 * @name Arc
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
ns.Arc = function (params) {
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
	this.tagName = 'arc';
};

ns.Arc.prototype = Object.create(ns.SBGNBase.prototype);
ns.Arc.prototype.constructor = ns.Arc;

/**
 * @memberof Arc.prototype
 * @param {StartType} start
 */
ns.Arc.prototype.setStart = function (start) {
	this.start = start;
};

/**
 * @memberof Arc.prototype
 * @param {EndType} end
 */
ns.Arc.prototype.setEnd = function (end) {
	this.end = end;
};

/**
 * @memberof Arc.prototype
 * @param {NextType} next
 */
ns.Arc.prototype.addNext = function (next) {
	this.nexts.push(next);
};

/**
 * @memberof Arc.prototype
 * @param {Glyph} glyph
 */
ns.Arc.prototype.addGlyph = function (glyph) {
	this.glyphs.push(glyph);
};

/**
 * @memberof Arc.prototype
 * @return {Element}
 */
ns.Arc.prototype.buildXmlObj = function () {
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
 * @memberof Arc.prototype
 * @return {string}
 */
ns.Arc.prototype.toXML = function () {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @memberof Arc
 * @param {Element} xmlObj
 * @return {Arc}
 */
ns.Arc.fromXML = function (xmlObj) {
	if (xmlObj.tagName != 'arc') {
		throw new Error("Bad XML provided, expected tagName arc, got: " + xmlObj.tagName);
	}
	var arc = new ns.Arc();
	arc.id 		= xmlObj.getAttribute('id') || null;
	arc.class_ 	= xmlObj.getAttribute('class') || null;
	arc.source 	= xmlObj.getAttribute('source') || null;
	arc.target 	= xmlObj.getAttribute('target') || null;

	var startXML = xmlObj.getElementsByTagName('start')[0];
	if (startXML != null) {
		var start = ns.StartType.fromXML(startXML);
		arc.setStart(start);
	}
	var nextXML = xmlObj.getElementsByTagName('next');
	for (var i=0; i < nextXML.length; i++) {
		var next = ns.NextType.fromXML(nextXML[i]);
		arc.addNext(next);
	}
	var endXML = xmlObj.getElementsByTagName('end')[0];
	if (endXML != null) {
		var end = ns.EndType.fromXML(endXML);
		arc.setEnd(end);
	}
	var glyphsXML = xmlObj.getElementsByTagName('glyph');
	for (var i=0; i < glyphsXML.length; i++) {
		var glyph = ns.Glyph.fromXML(glyphsXML[i]);
		arc.addGlyph(glyph);
	}

	arc.baseFromXML(xmlObj);
	return arc;
};

// ------- END ARC -------

// ------- STARTTYPE -------
/**
 * Represents the <code>&lt;start&gt;</code> element.
 * @class StartType
 * @name StartType
 * @param {Object} params
 * @param {string|number=} params.x
 * @param {string|number=} params.y
 */
ns.StartType = function (params) {
	var params = checkParams(params, ['x', 'y']);
	this.x = parseFloat(params.x);
	this.y = parseFloat(params.y);
};

/**
 * @memberof StartType.prototype
 * @return {Element}
 */
ns.StartType.prototype.buildXmlObj = function () {
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
 * @memberof StartType.prototype
 * @return {string}
 */
ns.StartType.prototype.toXML = function () {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @memberof StartType
 * @param {Element} xmlObj
 * @return {StartType}
 */
ns.StartType.fromXML = function (xmlObj) {
	if (xmlObj.tagName != 'start') {
		throw new Error("Bad XML provided, expected tagName start, got: " + xmlObj.tagName);
	}
	var start = new ns.StartType();
	start.x = parseFloat(xmlObj.getAttribute('x'));
	start.y = parseFloat(xmlObj.getAttribute('y'));
	return start;
};
// ------- END STARTTYPE -------

// ------- ENDTYPE -------
/**
 * Represents the <code>&lt;end&gt;</code> element.
 * @class EndType
 * @name EndType
 * @param {Object} params
 * @param {string|number=} params.x
 * @param {string|number=} params.y
 */
ns.EndType = function (params) {
	var params = checkParams(params, ['x', 'y']);
	this.x = parseFloat(params.x);
	this.y = parseFloat(params.y);
};

/**
 * @memberof EndType.prototype
 * @return {Element}
 */
ns.EndType.prototype.buildXmlObj = function () {
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
 * @memberof EndType.prototype
 * @return {string}
 */
ns.EndType.prototype.toXML = function () {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @memberof EndType
 * @param {Element} xmlObj
 * @return {EndType}
 */
ns.EndType.fromXML = function (xmlObj) {
	if (xmlObj.tagName != 'end') {
		throw new Error("Bad XML provided, expected tagName end, got: " + xmlObj.tagName);
	}
	var end = new ns.EndType();
	end.x = parseFloat(xmlObj.getAttribute('x'));
	end.y = parseFloat(xmlObj.getAttribute('y'));
	return end;
};
// ------- END ENDTYPE -------

// ------- NEXTTYPE -------
/**
 * Represents the <code>&lt;next&gt;</code> element.
 * @class NextType
 * @name NextType
 * @param {Object} params
 * @param {string|number=} params.x
 * @param {string|number=} params.y
 */
ns.NextType = function (params) {
	var params = checkParams(params, ['x', 'y']);
	this.x = parseFloat(params.x);
	this.y = parseFloat(params.y);
};

/**
 * @memberof NextType.prototype
 * @return {Element}
 */
ns.NextType.prototype.buildXmlObj = function () {
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
 * @memberof NextType.prototype
 * @return {string}
 */
ns.NextType.prototype.toXML = function () {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @memberof NextType
 * @param {Element} xmlObj
 * @return {NextType}
 */
ns.NextType.fromXML = function (xmlObj) {
	if (xmlObj.tagName != 'next') {
		throw new Error("Bad XML provided, expected tagName next, got: " + xmlObj.tagName);
	}
	var next = new ns.NextType();
	next.x = parseFloat(xmlObj.getAttribute('x'));
	next.y = parseFloat(xmlObj.getAttribute('y'));
	return next;
};
// ------- END NEXTTYPE -------

ns.renderExtension = renderExt;
//ns.annotationsExtension = annotExt;
module.exports = ns;