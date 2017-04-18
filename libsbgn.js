var renderExt = require('./libsbgn-render-ext');
var checkParams = require('./utilities').checkParams;

var ns = {};

ns.xmlns = "http://sbgn.org/libsbgn/0.3";

// ------- SBGNBase -------
/*
	Every sbgn element inherit from this. Allows to put notes everywhere.
*/
ns.SBGNBase = function () {

};
// ------- END SBGNBase -------

// ------- SBGN -------
ns.Sbgn = function (params) {
	var params = checkParams(params, ['xmlns', 'map']);
	this.xmlns 	= params.xmlns;
	this.map 	= params.map;
};

ns.Sbgn.prototype = Object.create(ns.SBGNBase.prototype);
ns.Sbgn.prototype.constructor = ns.Sbgn;

ns.Sbgn.prototype.setMap = function (map) {
	this.map = map;
};

ns.Sbgn.prototype.toXML = function () {
	var xmlString = "<sbgn";
	if(this.xmlns != null) {
		xmlString += " xmlns='"+this.xmlns+"'";
	}
	xmlString += ">\n";

	if (this.map != null) {
		xmlString += this.map.toXML();
	}
	xmlString += "</sbgn>\n";
	return xmlString;
};

ns.Sbgn.fromXML = function (xmlObj) {
	if (xmlObj.tagName != 'sbgn') {
		throw new Error("Bad XML provided, expected tagName sbgn, got: " + xmlObj.tagName);
	}
	var sbgn = new ns.Sbgn();
	sbgn.xmlns = xmlObj.getAttribute('xmlns');

	// get children
	var mapXML = xmlObj.getElementsByTagName('map')[0];
	if (mapXML != null) {
		var map = ns.Map.fromXML(mapXML);
		sbgn.setMap(map);
	}
	return sbgn;
};
// ------- END SBGN -------

// ------- MAP -------
ns.Map = function (params) {
	var params = checkParams(params, ['id', 'language', 'extension', 'glyphs', 'arcs']);
	this.id 		= params.id;
	this.language 	= params.language;
	this.extension 	= params.extension;
	this.glyphs 	= params.glyphs || [];
	this.arcs 		= params.arcs || [];
};

ns.Map.prototype = Object.create(ns.SBGNBase.prototype);
ns.Map.prototype.constructor = ns.Map;

ns.Map.prototype.setExtension = function (extension) {
	this.extension = extension;
};

ns.Map.prototype.addGlyph = function (glyph) {
	this.glyphs.push(glyph);
};

ns.Map.prototype.addArc = function (arc) {
	this.arcs.push(arc);
};

ns.Map.prototype.toXML = function () {
	var xmlString = "<map";
	// attributes
	if(this.id != null) {
		xmlString += " id='"+this.id+"'";
	}
	if(this.language != null) {
		xmlString += " language='"+this.language+"'";
	}
	xmlString += ">\n";

	// children
	if(this.extension != null) {
		xmlString += this.extension.toXML();
	}
	for(var i=0; i < this.glyphs.length; i++) {
		xmlString += this.glyphs[i].toXML();
	}
	for(var i=0; i < this.arcs.length; i++) {
		xmlString += this.arcs[i].toXML();
	}
	xmlString += "</map>\n";

	return xmlString;
};

ns.Map.fromXML = function (xmlObj) {
	if (xmlObj.tagName != 'map') {
		throw new Error("Bad XML provided, expected tagName map, got: " + xmlObj.tagName);
	}
	var map = new ns.Map();
	map.id = xmlObj.getAttribute('id');
	map.language = xmlObj.getAttribute('language');

	// children
	var extensionXML = xmlObj.getElementsByTagName('extension')[0];
	if (extensionXML != null) {
		var extension = ns.Extension.fromXML(extensionXML);
		map.setExtension(extension);
	}
	var glyphsXML = xmlObj.getElementsByTagName('glyph');
	for (var i=0; i < glyphsXML.length; i++) {
		var glyph = ns.Glyph.fromXML(glyphsXML[i]);
		map.addGlyph(glyph);
	}
	var arcsXML = xmlObj.getElementsByTagName('arc');
	for (var i=0; i < arcsXML.length; i++) {
		var arc = ns.Arc.fromXML(arcsXML[i]);
		map.addArc(arc);
	}

	return map;
};
// ------- END MAP -------

// ------- EXTENSIONS -------
ns.Extension = function () {
	// consider first order children, add them with their tagname as property of this object
	// store xmlObject if no supported parsing (unrecognized extensions)
	// else store instance of the extension
	this.list = {};
	this.unsupportedList = {};
};

/*ns.Extension.prototype.add = function (xmlObj) { // add specific extension
	var extName = xmlObj.tagName;
	console.log("extName", extName, xmlObj);
	if (extName == 'renderInformation') {
		var renderInformation = renderExt.RenderInformation.fromXML(xmlObj);
		this.list['renderInformation'] = renderInformation;
	}
	else if (extName == 'annotations') {
		this.list['annotations'] = xmlObj; // to be parsed correctly
	}
	else { // unsupported extension, we still store the data as is
		this.list[extName] = xmlObj;
	}
};*/

ns.Extension.prototype.add = function (extension) {
	if (extension instanceof renderExt.RenderInformation) {
		this.list['renderInformation'] = extension;
	}
	else if (extension.nodeType == Node.ELEMENT_NODE) {
		// case where renderInformation is passed unparsed
		if (extension.tagName == 'renderInformation') {
			var renderInformation = renderExt.RenderInformation.fromXML(extension);
			this.list['renderInformation'] = renderInformation;
		}
		this.unsupportedList[extension.tagName] = extension;
	}
};

ns.Extension.prototype.has = function (extensionName) {
	return this.list.hasOwnProperty(extensionName);
};

ns.Extension.prototype.get = function (extensionName) {
	if (this.has(extensionName)) {
		return this.list[extensionName];
	}
	else {
		return null;
	}
};

ns.Extension.prototype.toXML = function () {
	var xmlString = "<extension>\n";
	for (var extInstance in this.list) {
		if (extInstance == "renderInformation") {
			xmlString += this.get(extInstance).toXML();
		}
		else {
			xmlString += new XMLSerializer().serializeToString(this.get(extInstance));
		}
	}
	xmlString += "</extension>\n";
	return xmlString;
};

ns.Extension.fromXML = function (xmlObj) {
	if (xmlObj.tagName != 'extension') {
		throw new Error("Bad XML provided, expected tagName extension, got: " + xmlObj.tagName);
	}
	var extension = new ns.Extension();
	var children = xmlObj.children;
	for (var i=0; i < children.length; i++) {
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
ns.Glyph = function (params) {
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
};

ns.Glyph.prototype = Object.create(ns.SBGNBase.prototype);
ns.Glyph.prototype.constructor = ns.Glyph;

ns.Glyph.prototype.setLabel = function (label) {
	this.label = label;
};

ns.Glyph.prototype.setState = function (state) {
	this.state = state;
};

ns.Glyph.prototype.setBbox = function (bbox) {
	this.bbox = bbox;
};

ns.Glyph.prototype.setClone = function (clone) {
	this.clone = clone;
};

ns.Glyph.prototype.addGlyphMember = function (glyphMember) {
	this.glyphMembers.push(glyphMember);
};

ns.Glyph.prototype.addPort = function (port) {
	this.ports.push(port);
};

ns.Glyph.prototype.toXML = function () {
	var xmlString = "<glyph";
	// attributes
	if(this.id != null) {
		xmlString += " id='"+this.id+"'";
	}
	if(this.class_ != null) {
		xmlString += " class='"+this.class_+"'";
	}
	if(this.compartmentRef != null) {
		xmlString += " compartmentRef='"+this.compartmentRef+"'";
	}
	xmlString += ">\n";

	// children
	if(this.label != null) {
		xmlString += this.label.toXML();
	}
	if(this.state != null) {
		xmlString += this.state.toXML();
	}
	if(this.bbox != null) {
		xmlString += this.bbox.toXML();
	}
	if(this.clone != null) {
		xmlString += this.clone.toXML();
	}
	for(var i=0; i < this.glyphMembers.length; i++) {
		xmlString += this.glyphMembers[i].toXML();
	}
	for(var i=0; i < this.ports.length; i++) {
		xmlString += this.ports[i].toXML();
	}
	xmlString += "</glyph>\n";

	return xmlString;
};

ns.Glyph.fromXML = function (xmlObj) {
	if (xmlObj.tagName != 'glyph') {
		throw new Error("Bad XML provided, expected tagName glyph, got: " + xmlObj.tagName);
	}
	var glyph = new ns.Glyph();
	glyph.id 				= xmlObj.getAttribute('id');
	glyph.class_ 			= xmlObj.getAttribute('class');
	glyph.compartmentRef 	= xmlObj.getAttribute('compartmentRef');

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
	var children = xmlObj.children;
	for (var j=0; j < children.length; j++) { // loop through all first level children
		var child = children[j];
		if (child.tagName == "glyph") { // here we only want the glyh children
			var glyphMember = ns.Glyph.fromXML(child); // recursive call on nested glyph
			glyph.addGlyphMember(glyphMember);
		}
	}
	var portsXML = xmlObj.getElementsByTagName('port');
	for (var i=0; i < portsXML.length; i++) {
		var port = ns.Port.fromXML(portsXML[i]);
		glyph.addPort(port);
	}
	return glyph;
};
// ------- END GLYPH -------

// ------- LABEL -------
ns.Label = function (params) {
	var params = checkParams(params, ['text']);
	this.text = params.text;
};

ns.Label.prototype = Object.create(ns.SBGNBase.prototype);
ns.Label.prototype.constructor = ns.Label;

ns.Label.prototype.toXML = function () {
	var xmlString = "<label";
	// attributes
	if(this.text != null) {
		xmlString += " text='"+this.text+"'";
	}
	xmlString += " />\n";
	return xmlString;
};

ns.Label.fromXML = function (xmlObj) {
	if (xmlObj.tagName != 'label') {
		throw new Error("Bad XML provided, expected tagName label, got: " + xmlObj.tagName);
	}
	var label = new ns.Label();
	label.text = xmlObj.getAttribute('text');
	return label;
};
// ------- END LABEL -------

// ------- BBOX -------
ns.Bbox = function (params) {
	var params = checkParams(params, ['x', 'y', 'w', 'h']);
	this.x = parseFloat(params.x);
	this.y = parseFloat(params.y);
	this.w = parseFloat(params.w);
	this.h = parseFloat(params.h);
};

ns.Bbox.prototype = Object.create(ns.SBGNBase.prototype);
ns.Bbox.prototype.constructor = ns.Bbox;

ns.Bbox.prototype.toXML = function () {
	var xmlString = "<bbox";
	// attributes
	if(!isNaN(this.x)) {
		xmlString += " x='"+this.x+"'";
	}
	if(!isNaN(this.y)) {
		xmlString += " y='"+this.y+"'";
	}
	if(!isNaN(this.w)) {
		xmlString += " w='"+this.w+"'";
	}
	if(!isNaN(this.h)) {
		xmlString += " h='"+this.h+"'";
	}
	xmlString += " />\n";
	return xmlString;
};

ns.Bbox.fromXML = function (xmlObj) {
	if (xmlObj.tagName != 'bbox') {
		throw new Error("Bad XML provided, expected tagName bbox, got: " + xmlObj.tagName);
	}
	var bbox = new ns.Bbox();
	bbox.x = parseFloat(xmlObj.getAttribute('x'));
	bbox.y = parseFloat(xmlObj.getAttribute('y'));
	bbox.w = parseFloat(xmlObj.getAttribute('w'));
	bbox.h = parseFloat(xmlObj.getAttribute('h'));
	return bbox;
};
// ------- END BBOX -------

// ------- STATE -------
ns.StateType = function (params) {
	var params = checkParams(params, ['value', 'variable']);
	this.value = params.value;
	this.variable = params.variable;
};

ns.StateType.prototype.toXML = function () {
	var xmlString = "<state";
	// attributes
	if(this.value != null) {
		xmlString += " value='"+this.value+"'";
	}
	if(this.variable != null) {
		xmlString += " variable='"+this.variable+"'";
	}
	xmlString += " />\n";
	return xmlString;
};

ns.StateType.fromXML = function (xmlObj) {
	if (xmlObj.tagName != 'state') {
		throw new Error("Bad XML provided, expected tagName state, got: " + xmlObj.tagName);
	}
	var state = new ns.StateType();
	state.value = xmlObj.getAttribute('value');
	state.variable = xmlObj.getAttribute('variable');
	return state;
};
// ------- END STATE -------

// ------- CLONE -------
ns.CloneType = function (params) {
	var params = checkParams(params, ['label']);
	this.label = params.label;
};

ns.CloneType.prototype.toXML = function () {
	var xmlString = "<clone";
	// attributes
	if(this.label != null) {
		xmlString += " label='"+this.label+"'";
	}
	xmlString += " />\n";
	return xmlString;
};

ns.CloneType.fromXML = function (xmlObj) {
	if (xmlObj.tagName != 'clone') {
		throw new Error("Bad XML provided, expected tagName clone, got: " + xmlObj.tagName);
	}
	var clone = new ns.CloneType();
	clone.label = xmlObj.getAttribute('label');
	return clone;
};
// ------- END CLONE -------

// ------- PORT -------
ns.Port = function (params) {
	var params = checkParams(params, ['id', 'x', 'y']);
	this.id = params.id;
	this.x 	= parseFloat(params.x);
	this.y 	= parseFloat(params.y);
};

ns.Port.prototype = Object.create(ns.SBGNBase.prototype);
ns.Port.prototype.constructor = ns.Port;

ns.Port.prototype.toXML = function () {
	var xmlString = "<port";
	// attributes
	if(this.id != null) {
		xmlString += " id='"+this.id+"'";
	}
	if(!isNaN(this.x)) {
		xmlString += " x='"+this.x+"'";
	}
	if(!isNaN(this.y)) {
		xmlString += " y='"+this.y+"'";
	}
	xmlString += " />\n";
	return xmlString;
};

ns.Port.fromXML = function (xmlObj) {
	if (xmlObj.tagName != 'port') {
		throw new Error("Bad XML provided, expected tagName port, got: " + xmlObj.tagName);
	}
	var port = new ns.Port();
	port.x 	= parseFloat(xmlObj.getAttribute('x'));
	port.y 	= parseFloat(xmlObj.getAttribute('y'));
	port.id = xmlObj.getAttribute('id');
	return port;
};
// ------- END PORT -------

// ------- ARC -------
ns.Arc = function (params) {
	var params = checkParams(params, ['id', 'class_', 'source', 'target', 'start', 'end', 'nexts']);
	this.id 	= params.id;
	this.class_ = params.class_;
	this.source = params.source;
	this.target = params.target;

	this.start 	= params.start;
	this.end 	= params.end;
	this.nexts 	= params.nexts || [];
};

ns.Arc.prototype = Object.create(ns.SBGNBase.prototype);
ns.Arc.prototype.constructor = ns.Arc;

ns.Arc.prototype.setStart = function (start) {
	this.start = start;
};

ns.Arc.prototype.setEnd = function (end) {
	this.end = end;
};

ns.Arc.prototype.addNext = function (next) {
	this.nexts.push(next);
};

ns.Arc.prototype.toXML = function () {
	var xmlString = "<arc";
	// attributes
	if(this.id != null) {
		xmlString += " id='"+this.id+"'";
	}
	if(this.class_ != null) {
		xmlString += " class='"+this.class_+"'";
	}
	if(this.source != null) {
		xmlString += " source='"+this.source+"'";
	}
	if(this.target != null) {
		xmlString += " target='"+this.target+"'";
	}
	xmlString += ">\n";

	// children
	if(this.start != null) {
		xmlString += this.start.toXML();
	}
	for(var i=0; i < this.nexts.length; i++) {
		xmlString += this.nexts[i].toXML();
	}
	if(this.end != null) {
		xmlString += this.end.toXML();
	}
	
	xmlString += "</arc>\n";
	return xmlString;
};

ns.Arc.fromXML = function (xmlObj) {
	if (xmlObj.tagName != 'arc') {
		throw new Error("Bad XML provided, expected tagName arc, got: " + xmlObj.tagName);
	}
	var arc = new ns.Arc();
	arc.id 		= xmlObj.getAttribute('id');
	arc.class_ 	= xmlObj.getAttribute('class');
	arc.source 	= xmlObj.getAttribute('source');
	arc.target 	= xmlObj.getAttribute('target');

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

	return arc;
};

// ------- END ARC -------

// ------- STARTTYPE -------
ns.StartType = function (params) {
	var params = checkParams(params, ['x', 'y']);
	this.x = parseFloat(params.x);
	this.y = parseFloat(params.y);
};

ns.StartType.prototype.toXML = function () {
	var xmlString = "<start";
	// attributes
	if(!isNaN(this.x)) {
		xmlString += " x='"+this.x+"'";
	}
	if(!isNaN(this.y)) {
		xmlString += " y='"+this.y+"'";
	}
	xmlString += " />\n";
	return xmlString;
};

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
ns.EndType = function (params) {
	var params = checkParams(params, ['x', 'y']);
	this.x = parseFloat(params.x);
	this.y = parseFloat(params.y);
};

ns.EndType.prototype.toXML = function () {
	var xmlString = "<end";
	// attributes
	if(!isNaN(this.x)) {
		xmlString += " x='"+this.x+"'";
	}
	if(!isNaN(this.y)) {
		xmlString += " y='"+this.y+"'";
	}
	xmlString += " />\n";
	return xmlString;
};

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
ns.NextType = function (params) {
	var params = checkParams(params, ['x', 'y']);
	this.x = parseFloat(params.x);
	this.y = parseFloat(params.y);
};

ns.NextType.prototype.toXML = function () {
	var xmlString = "<next";
	// attributes
	if(!isNaN(this.x)) {
		xmlString += " x='"+this.x+"'";
	}
	if(!isNaN(this.y)) {
		xmlString += " y='"+this.y+"'";
	}
	xmlString += " />\n";
	return xmlString;
};

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
module.exports = ns;