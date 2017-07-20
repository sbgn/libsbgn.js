/**
 * The API contains two other submodules: {@link libsbgn.render} and {@link libsbgn.annot}
 * @module libsbgn
 * @namespace libsbgn
*/

var renderExt = require('./libsbgn-render');
var annotExt = require('./libsbgn-annotations');
var checkParams = require('./utilities').checkParams;
var getFirstLevelByName = require('./utilities').getFirstLevelByName;
var xml2js = require('xml2js');
var utils = require('./utilities');

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

SBGNBase.prototype.baseToJsObj = function (jsObj) {
	if(this.extension != null) {
		jsObj.extension = this.extension.buildJsObj();
	}
};

SBGNBase.prototype.baseFromObj = function (jsObj) {
	if (jsObj.extension) {
		var extension = ns.Extension.fromObj({extension: jsObj.extension[0]});
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
 * @return {Object} - xml2js formatted object
 */
Sbgn.prototype.buildJsObj = function () {
	var sbgnObj = {};

	// attributes
	var attributes = {};
	if(this.xmlns != null) {
		attributes.xmlns = this.xmlns;
	}
	if(this.language != null) {
		attributes.language = this.language;
	}
	utils.addAttributes(sbgnObj, attributes);

	// children
	this.baseToJsObj(sbgnObj);
	if (this.map != null) {
		sbgnObj.map = this.map.buildJsObj();
	}
	return sbgnObj;
};

/**
 * @return {string}
 */
Sbgn.prototype.toXML = function () {
	//var builder = new xml2js.Builder();
	//var xml = builder.buildObject(this.buildXmlObj());
	return utils.buildString({
		sbgn: this.buildJsObj()
	});
};

Sbgn.fromXML = function (string) {
    var sbgn;
    function fn (err, result) {
        sbgn = Sbgn.fromObj(result);
    }
    utils.parseString(string, fn);
    return sbgn;

};

/**
 * @param {Element} xmlObj
 * @return {Sbgn}
 */
Sbgn.fromObj = function (jsObj) {
	if (typeof jsObj.sbgn == 'undefined') {
		throw new Error("Bad XML provided, expected tagName sbgn, got: " + Object.keys(jsObj)[0]);
	}

	var sbgn = new ns.Sbgn();
	jsObj = jsObj.sbgn;
	if(typeof jsObj != 'object') { // nothing inside, empty xml
		return sbgn;
	}

	if(jsObj.$) { // we have some atributes
		var attributes = jsObj.$;
		sbgn.xmlns = attributes.xmlns || null;

		// getting attribute with 'xmlns' doesn't work if some namespace is defined like 'xmlns:sbgn'
		// so if there is some attribute there, and we didn't find the xmlns directly, we need to into it
		if(!sbgn.xmlns && Object.keys(attributes).length > 0) {
			// sbgn is not supposed to have any other attribute than an xmlns, so we assume the first attr is the xmlns
			var key = Object.keys(attributes)[0];
			if(key.startsWith('xmlns')) {
				sbgn.xmlns = attributes[key];
				sbgn.namespacePrefix = key.replace('xmlns:', '');
			}
			else {
				throw new Error("Couldn't find xmlns definition in sbgn element");
			}
		}
	}

	if(jsObj.map) { // we have some children
		// get children
		var mapXML = jsObj.map[0];
		if (mapXML != null) {
			var map = ns.Map.fromObj({map: mapXML});
			sbgn.setMap(map);
		}
	}

	sbgn.baseFromObj(jsObj); // call to parent class
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
 * @return {Object} - xml2js formatted object
 */
Map.prototype.buildJsObj = function () {
	var mapObj = {};

	// attributes
	var attributes = {};
	if(this.id != null) {
		attributes.id = this.id;
	}
	if(this.language != null) {
		attributes.language = this.language;
	}
	utils.addAttributes(mapObj, attributes);

	// children
	this.baseToJsObj(mapObj);
	for(var i=0; i < this.glyphs.length; i++) {
		if (i==0) {
			mapObj.glyph = [];
		}
		mapObj.glyph.push(this.glyphs[i].buildJsObj());
	}
	for(var i=0; i < this.arcs.length; i++) {
		if (i==0) {
			mapObj.arc = [];
		}
		mapObj.arc.push(this.arcs[i].buildJsObj());
	}
	return mapObj;
};

/**
 * @return {string}
 */
Map.prototype.toXML = function () {
	return utils.buildString({map: this.buildJsObj()});
};

Map.fromXML = function (string) {
	var map;
	function fn (err, result) {
        map = Map.fromObj(result);
    };
    utils.parseString(string, fn);
    return map;
};

Map.fromObj = function (jsObj) {
	if (typeof jsObj.map == 'undefined') {
		throw new Error("Bad XML provided, expected tagName map, got: " + Object.keys(jsObj)[0]);
	}

	var map = new ns.Map();
	jsObj = jsObj.map;
	if(typeof jsObj != 'object') { // nothing inside, empty xml
		return map;
	}

	if(jsObj.$) { // we have some attributes
		var attributes = jsObj.$;
		map.id = attributes.id || null;
		map.language = attributes.language || null;
	}

	if(jsObj.glyph) {
		var glyphs = jsObj.glyph;
		for (var i=0; i < glyphs.length; i++) {
			var glyph = ns.Glyph.fromObj({glyph: glyphs[i]});
			map.addGlyph(glyph);
		}
	}
	if(jsObj.arc) {
		var arcs = jsObj.arc;
		for (var i=0; i < arcs.length; i++) {
			var arc = ns.Arc.fromObj({arc: arcs[i]});
			map.addArc(arc);
		}
	}

	map.baseFromObj(jsObj);
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
	else if(typeof extension == "string") {
		var parsedAsObj;
		function fn (err, result) {
	        parsedAsObj = result;
	    };
	    utils.parseString(extension, fn);
	    var name = Object.keys(parsedAsObj)[0];
	    if(name == "renderInformation") {
	    	var renderInformation = renderExt.RenderInformation.fromXML(extension);
			this.list['renderInformation'] = renderInformation;
	    }
	    else if(name == "annotation") {
	    	var annotation = annotExt.Annotation.fromXML(extension);
			this.list['annotation'] = renderInformation;
	    }
	    else {
	    	this.list[name] = extension;
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

Extension.prototype.buildJsObj = function () {
	var extensionObj = {};

	for (var extInstance in this.list) {
		if (extInstance == "renderInformation") {
			extensionObj.renderInformation =  this.get(extInstance).buildJsObj();
		} 
		else if (extInstance == "annotation") {
			extensionObj.annotation =  this.get(extInstance).buildJsObj();
		}
		else {
			// unsupported extensions are stored as is, as xml string
			// we need to parse it to build the js object
			var unsupportedExtObj;
			function fn (err, result) {
		        unsupportedExtObj = result;
		    };
		    utils.parseString(this.get(extInstance), fn);
			extensionObj[extInstance] = unsupportedExtObj[extInstance];
		}
	}
	return extensionObj;
};

/**
 * @return {string}
 */
Extension.prototype.toXML = function () {
	return utils.buildString({extension: this.buildJsObj()})
};

Extension.fromXML = function (string) {
	var extension;
	function fn (err, result) {
        extension = Extension.fromObj(result);
    };
    utils.parseString(string, fn);
    return extension;
};

Extension.fromObj = function (jsObj) {
	if (typeof jsObj.extension == 'undefined') {
		throw new Error("Bad XML provided, expected tagName extension, got: " + Object.keys(jsObj)[0]);
	}

	var extension = new Extension();
	jsObj = jsObj.extension;
	if(typeof jsObj != 'object') { // nothing inside, empty xml
		return extension;
	}

	//var children = Object.keys(jsObj);
	for (var extName in jsObj) {
		//var extName = Object.keys(jsObj[i])[0];
		var extJsObj = jsObj[extName];

		//extension.add(extInstance);
		if (extName == 'renderInformation') {
			var renderInformation = renderExt.RenderInformation.fromObj({renderInformation: extJsObj});
			extension.add(renderInformation);
		}
		else if (extName == 'annotation') {
			var annotation = annotExt.Annotation.fromObj({annotation: extJsObj});
			extension.add(annotation);
		}
		else { // unsupported extension, we still store the data as is
			var unsupportedExt = {};
			unsupportedExt[extName] = extJsObj[0]; // make extension serialisable
			var stringExt = utils.buildString(unsupportedExt); // serialise to string
			extension.add(stringExt); // save it
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
 * @param {EntityType=} params.entity
 * @param {Glyph[]=} params.glyphMembers
 * @param {Port[]=} params.ports
 */
var Glyph = function (params) {
	ns.SBGNBase.call(this, params);
	var params = checkParams(params, ['id', 'class_', 'compartmentRef', 'label', 'bbox', 'glyphMembers', 'ports', 'state', 'clone', 'entity']);
	this.id 			= params.id;
	this.class_ 		= params.class_;
	this.compartmentRef = params.compartmentRef;

	// children
	this.label 			= params.label;
	this.state 			= params.state;
	this.bbox 			= params.bbox;
	this.clone 			= params.clone;
	this.entity 		= params.entity;
	this.glyphMembers 	= params.glyphMembers || []; // case of complex, can have arbitrary list of nested glyphs
	this.ports 			= params.ports || [];

	this.allowedChildren = ['label', 'state', 'bbox', 'clone', 'glyphMembers', 'ports', 'entity'];
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
 * @param {EntityType} entity
 */
Glyph.prototype.setEntity = function (entity) {
	this.entity = entity;
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

Glyph.prototype.buildJsObj = function () {
	var glyphObj = {};

	// attributes
	var attributes = {};
	if(this.id != null) {
		attributes.id = this.id;
	}
	if(this.class_ != null) {
		attributes.class = this.class_;
	}
	if(this.compartmentRef != null) {
		attributes.compartmentRef = this.compartmentRef;
	}
	utils.addAttributes(glyphObj, attributes);

	// children
	this.baseToJsObj(glyphObj);
	if(this.label != null) {
		glyphObj.label =  this.label.buildJsObj();
	}
	if(this.state != null) {
		glyphObj.state =  this.state.buildJsObj();
	}
	if(this.clone != null) {
		glyphObj.clone =  this.clone.buildJsObj();
	}
	if(this.entity != null) {
		glyphObj.entity =  this.entity.buildJsObj();
	}
	if(this.bbox != null) {
		glyphObj.bbox =  this.bbox.buildJsObj();
	}
	for(var i=0; i < this.glyphMembers.length; i++) {
		if (i==0) {
			glyphObj.glyph = [];
		}
		glyphObj.glyph.push(this.glyphMembers[i].buildJsObj());
	}
	for(var i=0; i < this.ports.length; i++) {
		if (i==0) {
			glyphObj.port = [];
		}
		glyphObj.port.push(this.ports[i].buildJsObj());
	}
	return glyphObj;
};

/**
 * @return {string}
 */
Glyph.prototype.toXML = function () {
	return utils.buildString({glyph: this.buildJsObj()})
};

Glyph.fromXML = function (string) {
	var glyph;
	function fn (err, result) {
        glyph = Glyph.fromObj(result);
    };
    utils.parseString(string, fn);
    return glyph;
};

Glyph.fromObj = function (jsObj) {
	if (typeof jsObj.glyph == 'undefined') {
		throw new Error("Bad XML provided, expected tagName glyph, got: " + Object.keys(jsObj)[0]);
	}

	var glyph = new ns.Glyph();
	jsObj = jsObj.glyph;
	if(typeof jsObj != 'object') { // nothing inside, empty xml
		return glyph;
	}

	if(jsObj.$) { // we have some attributes
		var attributes = jsObj.$;
		glyph.id = attributes.id || null;
		glyph.class_ = attributes.class || null;
		glyph.compartmentRef = attributes.compartmentRef || null;
	}

	// children
	if(jsObj.label) {
		var label = ns.Label.fromObj({label: jsObj.label[0]});
		glyph.setLabel(label);
	}
	if(jsObj.state) {
		var state = ns.StateType.fromObj({state: jsObj.state[0]});
		glyph.setState(state);
	}
	if(jsObj.clone) {
		var clone = ns.CloneType.fromObj({clone: jsObj.clone[0]});
		glyph.setClone(clone);
	}
	if(jsObj.entity) {
		var entity = ns.EntityType.fromObj({entity: jsObj.entity[0]});
		glyph.setEntity(entity);
	}
	if(jsObj.bbox) {
		var bbox = ns.Bbox.fromObj({bbox: jsObj.bbox[0]});
		glyph.setBbox(bbox);
	}

	if(jsObj.glyph) {
		var glyphs = jsObj.glyph;
		for (var i=0; i < glyphs.length; i++) {
			var glyphMember = ns.Glyph.fromObj({glyph: glyphs[i]});
			glyph.addGlyphMember(glyphMember);
		}
	}
	if(jsObj.port) {
		var ports = jsObj.port;
		for (var i=0; i < ports.length; i++) {
			var port = ns.Port.fromObj({port: ports[i]});
			glyph.addPort(port);
		}
	}

	glyph.baseFromObj(jsObj);
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

Label.prototype.buildJsObj = function () {
	var labelObj = {};

	// attributes
	var attributes = {};
	if(this.text != null) {
		attributes.text = this.text;
	}
	utils.addAttributes(labelObj, attributes);
	this.baseToJsObj(labelObj);
	return labelObj;
};

/**
 * @return {string}
 */
Label.prototype.toXML = function () {
	return utils.buildString({label: this.buildJsObj()})
};

Label.fromXML = function (string) {
	var label;
	function fn (err, result) {
        label = Label.fromObj(result);
    };
    utils.parseString(string, fn);
    return label;
};

Label.fromObj = function (jsObj) {
	if (typeof jsObj.label == 'undefined') {
		throw new Error("Bad XML provided, expected tagName label, got: " + Object.keys(jsObj)[0]);
	}

	var label = new ns.Label();
	jsObj = jsObj.label;
	if(typeof jsObj != 'object') { // nothing inside, empty xml
		return label;
	}

	if(jsObj.$) { // we have some attributes
		var attributes = jsObj.$;
		label.text = attributes.text || null;
	}
	label.baseFromObj(jsObj);
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

Bbox.prototype.buildJsObj = function () {
	var bboxObj = {};

	// attributes
	var attributes = {};
	if(!isNaN(this.x)) {
		attributes.x = this.x;
	}
	if(!isNaN(this.y)) {
		attributes.y = this.y;
	}
	if(!isNaN(this.w)) {
		attributes.w = this.w;
	}
	if(!isNaN(this.h)) {
		attributes.h = this.h;
	}
	utils.addAttributes(bboxObj, attributes);
	this.baseToJsObj(bboxObj);
	return bboxObj;
};

/**
 * @return {string}
 */
Bbox.prototype.toXML = function () {
	return utils.buildString({bbox: this.buildJsObj()})
};

Bbox.fromXML = function (string) {
	var bbox;
	function fn (err, result) {
        bbox = Bbox.fromObj(result);
    };
    utils.parseString(string, fn);
    return bbox;
};

Bbox.fromObj = function (jsObj) {
	if (typeof jsObj.bbox == 'undefined') {
		throw new Error("Bad XML provided, expected tagName bbox, got: " + Object.keys(jsObj)[0]);
	}

	var bbox = new ns.Bbox();
	jsObj = jsObj.bbox;
	if(typeof jsObj != 'object') { // nothing inside, empty xml
		return bbox;
	}

	if(jsObj.$) { // we have some attributes
		var attributes = jsObj.$;
		bbox.x = parseFloat(attributes.x);
		bbox.y = parseFloat(attributes.y);
		bbox.w = parseFloat(attributes.w);
		bbox.h = parseFloat(attributes.h);
	}
	bbox.baseFromObj(jsObj);
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

StateType.prototype.buildJsObj = function () {
	var stateObj = {};

	// attributes
	var attributes = {};
	if(this.value != null) {
		attributes.value = this.value;
	}
	if(this.variable != null) {
		attributes.variable = this.variable;
	}
	utils.addAttributes(stateObj, attributes);
	return stateObj;
};

/**
 * @return {string}
 */
StateType.prototype.toXML = function () {
	return utils.buildString({state: this.buildJsObj()})
};

/**
 * @param {Element} xmlObj
 * @return {StateType}
 */
StateType.fromXML_old = function (xmlObj) {
	if (xmlObj.localName != 'state') {
		throw new Error("Bad XML provided, expected localName state, got: " + xmlObj.localName);
	}
	var state = new ns.StateType();
	state.value = xmlObj.getAttribute('value') || null;
	state.variable = xmlObj.getAttribute('variable') || null;
	return state;
};

StateType.fromXML = function (string) {
	var state;
	function fn (err, result) {
        state = StateType.fromObj(result);
    };
    utils.parseString(string, fn);
    return state;
};

StateType.fromObj = function (jsObj) {
	if (typeof jsObj.state == 'undefined') {
		throw new Error("Bad XML provided, expected tagName state, got: " + Object.keys(jsObj)[0]);
	}

	var state = new ns.StateType();
	jsObj = jsObj.state;
	if(typeof jsObj != 'object') { // nothing inside, empty xml
		return state;
	}

	if(jsObj.$) { // we have some attributes
		var attributes = jsObj.$;
		state.value = attributes.value || null;
		state.variable = attributes.variable || null;
	}
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

CloneType.prototype.buildJsObj = function () {
	var cloneObj = {};

	// attributes
	var attributes = {};
	if(this.label != null) {
		attributes.label = this.label;
	}
	utils.addAttributes(cloneObj, attributes);
	return cloneObj;
};

/**
 * @return {string}
 */
CloneType.prototype.toXML = function () {
	return utils.buildString({clone: this.buildJsObj()})
};

CloneType.fromXML = function (string) {
	var clone;
	function fn (err, result) {
        clone = CloneType.fromObj(result);
    };
    utils.parseString(string, fn);
    return clone;
};

CloneType.fromObj = function (jsObj) {
	if (typeof jsObj.clone == 'undefined') {
		throw new Error("Bad XML provided, expected tagName clone, got: " + Object.keys(jsObj)[0]);
	}

	var clone = new ns.CloneType();
	jsObj = jsObj.clone;
	if(typeof jsObj != 'object') { // nothing inside, empty xml
		return clone;
	}

	if(jsObj.$) { // we have some attributes
		var attributes = jsObj.$;
		clone.label = attributes.label || null;
	}
	return clone;
};

ns.CloneType = CloneType;
// ------- END CLONE -------

// ------- ENTITYTYPE -------
/**
 * Represents the <code>&lt;entity&gt;</code> element.
 * @class EntityType
 * @param {Object} params
 * @param {string=} params.name
 */
var EntityType = function (params) {
	var params = checkParams(params, ['name']);
	this.name = params.name;
};

EntityType.prototype.buildJsObj = function () {
	var entityObj = {};

	// attributes
	var attributes = {};
	if(this.name != null) {
		attributes.name = this.name;
	}
	utils.addAttributes(entityObj, attributes);
	return entityObj;
};

/**
 * @return {string}
 */
EntityType.prototype.toXML = function () {
	return utils.buildString({entity: this.buildJsObj()})
};

EntityType.fromXML = function (string) {
	var entity;
	function fn (err, result) {
        entity = EntityType.fromObj(result);
    };
    utils.parseString(string, fn);
    return entity;
};

EntityType.fromObj = function (jsObj) {
	if (typeof jsObj.entity == 'undefined') {
		throw new Error("Bad XML provided, expected tagName entity, got: " + Object.keys(jsObj)[0]);
	}

	var entity = new ns.EntityType();
	jsObj = jsObj.entity;
	if(typeof jsObj != 'object') { // nothing inside, empty xml
		return entity;
	}

	if(jsObj.$) { // we have some attributes
		var attributes = jsObj.$;
		entity.name = attributes.name || null;
	}
	return entity;
};

ns.EntityType = EntityType;
// ------- END ENTITYTYPE -------

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

Port.prototype.buildJsObj = function () {
	var portObj = {};

	// attributes
	var attributes = {};
	if(this.id != null) {
		attributes.id = this.id;
	}
	if(!isNaN(this.x)) {
		attributes.x = this.x;
	}
	if(!isNaN(this.y)) {
		attributes.y = this.y;
	}
	utils.addAttributes(portObj, attributes);
	this.baseToJsObj(portObj);
	return portObj;
};

/**
 * @return {string}
 */
Port.prototype.toXML = function () {
	return utils.buildString({port: this.buildJsObj()})
};

Port.fromXML = function (string) {
	var port;
	function fn (err, result) {
        port = Port.fromObj(result);
    };
    utils.parseString(string, fn);
    return port;
};

Port.fromObj = function (jsObj) {
	if (typeof jsObj.port == 'undefined') {
		throw new Error("Bad XML provided, expected tagName port, got: " + Object.keys(jsObj)[0]);
	}

	var port = new ns.Port();
	jsObj = jsObj.port;
	if(typeof jsObj != 'object') { // nothing inside, empty xml
		return port;
	}

	if(jsObj.$) { // we have some attributes
		var attributes = jsObj.$;
		port.x = parseFloat(attributes.x);
		port.y = parseFloat(attributes.y);
		port.id = attributes.id || null;
	}
	port.baseFromObj(jsObj);
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

Arc.prototype.buildJsObj = function () {
	var arcObj = {};

	// attributes
	var attributes = {};
	if(this.id != null) {
		attributes.id = this.id;
	}
	if(this.class_ != null) {
		attributes.class = this.class_;
	}
	if(this.source != null) {
		attributes.source = this.source;
	}
	if(this.target != null) {
		attributes.target = this.target;
	}
	utils.addAttributes(arcObj, attributes);

	// children
	this.baseToJsObj(arcObj);
	for(var i=0; i < this.glyphs.length; i++) {
		if (i==0) {
			arcObj.glyph = [];
		}
		arcObj.glyph.push(this.glyphs[i].buildJsObj());
	}
	if(this.start != null) {
		arcObj.start =  this.start.buildJsObj();
	}
	if(this.state != null) {
		arcObj.state =  this.state.buildJsObj();
	}
	for(var i=0; i < this.nexts.length; i++) {
		if (i==0) {
			arcObj.next = [];
		}
		arcObj.next.push(this.nexts[i].buildJsObj());
	}
	if(this.end != null) {
		arcObj.end =  this.end.buildJsObj();
	}
	return arcObj;
};

/**
 * @return {string}
 */
Arc.prototype.toXML = function () {
	return utils.buildString({arc: this.buildJsObj()})
};

Arc.fromXML = function (string) {
	var arc;
	function fn (err, result) {
        arc = Arc.fromObj(result);
    };
    utils.parseString(string, fn);
    return arc;
};

Arc.fromObj = function (jsObj) {
	if (typeof jsObj.arc == 'undefined') {
		throw new Error("Bad XML provided, expected tagName arc, got: " + Object.keys(jsObj)[0]);
	}

	var arc = new ns.Arc();
	jsObj = jsObj.arc;
	if(typeof jsObj != 'object') { // nothing inside, empty xml
		return arc;
	}

	if(jsObj.$) { // we have some attributes
		var attributes = jsObj.$;
		arc.id = attributes.id || null;
		arc.class_ = attributes.class || null;
		arc.source = attributes.source || null;
		arc.target = attributes.target || null;
	}

	// children
	if(jsObj.start) {
		var start = ns.StartType.fromObj({start: jsObj.start[0]});
		arc.setStart(start);
	}
	if(jsObj.next) {
		var nexts = jsObj.next;
		for (var i=0; i < nexts.length; i++) {
			var next = ns.NextType.fromObj({next: nexts[i]});
			arc.addNext(next);
		}
	}
	if(jsObj.end) {
		var end = ns.EndType.fromObj({end: jsObj.end[0]});
		arc.setEnd(end);
	}
	if(jsObj.glyph) {
		var glyphs = jsObj.glyph;
		for (var i=0; i < glyphs.length; i++) {
			var glyph = ns.Glyph.fromObj({glyph: glyphs[i]});
			arc.addGlyph(glyph);
		}
	}

	arc.baseFromObj(jsObj);
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

StartType.prototype.buildJsObj = function () {
	var startObj = {};

	// attributes
	var attributes = {};
	if(!isNaN(this.x)) {
		attributes.x = this.x;
	}
	if(!isNaN(this.y)) {
		attributes.y = this.y;
	}
	utils.addAttributes(startObj, attributes);
	return startObj;
};

/**
 * @return {string}
 */
StartType.prototype.toXML = function () {
	return utils.buildString({start: this.buildJsObj()})
};

StartType.fromXML = function (string) {
	var start;
	function fn (err, result) {
        start = StartType.fromObj(result);
    };
    utils.parseString(string, fn);
    return start;
};

StartType.fromObj = function (jsObj) {
	if (typeof jsObj.start == 'undefined') {
		throw new Error("Bad XML provided, expected tagName start, got: " + Object.keys(jsObj)[0]);
	}

	var start = new ns.StartType();
	jsObj = jsObj.start;
	if(typeof jsObj != 'object') { // nothing inside, empty xml
		return start;
	}

	if(jsObj.$) { // we have some attributes
		var attributes = jsObj.$;
		start.x = parseFloat(attributes.x);
		start.y = parseFloat(attributes.y);
	}
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

EndType.prototype.buildJsObj = function () {
	var endObj = {};

	// attributes
	var attributes = {};
	if(!isNaN(this.x)) {
		attributes.x = this.x;
	}
	if(!isNaN(this.y)) {
		attributes.y = this.y;
	}
	utils.addAttributes(endObj, attributes);
	return endObj;
};

/**
 * @return {string}
 */
EndType.prototype.toXML = function () {
	return utils.buildString({end: this.buildJsObj()})
};

EndType.fromXML = function (string) {
	var end;
	function fn (err, result) {
        end = EndType.fromObj(result);
    };
    utils.parseString(string, fn);
    return end;
};

EndType.fromObj = function (jsObj) {
	if (typeof jsObj.end == 'undefined') {
		throw new Error("Bad XML provided, expected tagName end, got: " + Object.keys(jsObj)[0]);
	}

	var end = new ns.EndType();
	jsObj = jsObj.end;
	if(typeof jsObj != 'object') { // nothing inside, empty xml
		return end;
	}

	if(jsObj.$) { // we have some attributes
		var attributes = jsObj.$;
		end.x = parseFloat(attributes.x);
		end.y = parseFloat(attributes.y);
	}
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

NextType.prototype.buildJsObj = function () {
	var nextObj = {};

	// attributes
	var attributes = {};
	if(!isNaN(this.x)) {
		attributes.x = this.x;
	}
	if(!isNaN(this.y)) {
		attributes.y = this.y;
	}
	utils.addAttributes(nextObj, attributes);
	return nextObj;
};

/**
 * @return {string}
 */
NextType.prototype.toXML = function () {
	return utils.buildString({next: this.buildJsObj()})
};

NextType.fromXML = function (string) {
	var next;
	function fn (err, result) {
        next = NextType.fromObj(result);
    };
    utils.parseString(string, fn);
    return next;
};

NextType.fromObj = function (jsObj) {
	if (typeof jsObj.next == 'undefined') {
		throw new Error("Bad XML provided, expected tagName next, got: " + Object.keys(jsObj)[0]);
	}

	var next = new ns.NextType();
	jsObj = jsObj.next;
	if(typeof jsObj != 'object') { // nothing inside, empty xml
		return next;
	}

	if(jsObj.$) { // we have some attributes
		var attributes = jsObj.$;
		next.x = parseFloat(attributes.x);
		next.y = parseFloat(attributes.y);
	}
	return next;
};

ns.NextType = NextType;
// ------- END NEXTTYPE -------

// ------- POINT -------
/**
 * Represents the <code>&lt;point&gt;</code> element.
 * @class Point
 * @param {Object} params
 * @param {string|number=} params.x
 * @param {string|number=} params.y
 */
var Point = function (params) {
	ns.SBGNBase.call(this, params);
	var params = checkParams(params, ['x', 'y']);
	this.x = parseFloat(params.x);
	this.y = parseFloat(params.y);
};
Point.prototype = Object.create(ns.SBGNBase.prototype);
Point.prototype.constructor = Point;

Point.prototype.buildJsObj = function () {
	var pointJsObj = {};

	// attributes
	var attributes = {};
	if(!isNaN(this.x)) {
		attributes.x = this.x;
	}
	if(!isNaN(this.y)) {
		attributes.y = this.y;
	}
	utils.addAttributes(pointJsObj, attributes);
	this.baseToJsObj(pointJsObj);
	return pointJsObj;
};

/**
 * @return {string}
 */
Point.prototype.toXML = function () {
	return utils.buildString({point: this.buildJsObj()})
};

Point.fromXML = function (string) {
	var point;
	function fn (err, result) {
        point = Point.fromObj(result);
    };
    utils.parseString(string, fn);
    return point;
};

Point.fromObj = function (jsObj) {
	if (typeof jsObj.point == 'undefined') {
		throw new Error("Bad XML provided, expected tagName point, got: " + Object.keys(jsObj)[0]);
	}

	var point = new ns.Point();
	jsObj = jsObj.point;
	if(typeof jsObj != 'object') { // nothing inside, empty xml
		return point;
	}

	if(jsObj.$) { // we have some attributes
		var attributes = jsObj.$;
		point.x = parseFloat(attributes.x);
		point.y = parseFloat(attributes.y);
	}
	point.baseFromObj(jsObj);
	return point;
};

ns.Point = Point;
// ------- END POINT -------

ns.render = renderExt;
ns.annot = annotExt;
module.exports = ns;