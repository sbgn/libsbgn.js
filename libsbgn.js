var renderExt = require('./libsbgn-render-ext');

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
ns.Sbgn = function (xmlns) {
	this.xmlns = xmlns;
	this.map = null;
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
ns.Map = function (id, language) {
	this.id = id;
	this.language = language;
	this.extension = null;
	this.glyphs = [];
	this.arcs = [];
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
	for(var i=0; i < this.glyphs; i++) {
		xmlString += this.glyphs[i].toXML();
	}
	for(var i=0; i < this.arcs; i++) {
		xmlString += this.arcs[i].toXML();
	}
	xmlString += "</map>\n";

	return xmlString;
};
ns.Map.fromXML = function (xmlObj) {
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
	this.list = {};
};
ns.Extension.prototype.add = function (xmlObj) { // add specific extension
	var extName = xmlObj.tagName;
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
}
ns.Extension.fromXML = function (xmlObj) {
	var extension = new ns.Extension();
	var children = xmlObj.children;
	for (var i=0; i < children.length; i++) {
		var extInstance = children[i];
		extension.add(extInstance);
	}
	return extension;
};
// ------- END EXTENSIONS -------

// ------- GLYPH -------
ns.Glyph = function (id, class_, compartmentRef) {
	this.id = id;
	this.class_ = class_;
	this.compartmentRef = compartmentRef;

	// children
	this.label = null;
	this.bbox = null;
	this.glyphMembers = []; // case of complex, can have arbitrary list of nested glyphs
	this.ports = [];
};
ns.Glyph.prototype = Object.create(ns.SBGNBase.prototype);
ns.Glyph.prototype.constructor = ns.Glyph;
ns.Glyph.prototype.setLabel = function (label) {
	this.label = label;
};
ns.Glyph.prototype.setBbox = function (bbox) {
	this.bbox = bbox;
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
	if(this.bbox != null) {
		xmlString += this.bbox.toXML();
	}
	for(var i=0; i < this.glyphMembers; i++) {
		xmlString += this.glyphMembers[i].toXML();
	}
	for(var i=0; i < this.ports; i++) {
		xmlString += this.ports[i].toXML();
	}
	xmlString += "</glyph>\n";

	return xmlString;
};
ns.Glyph.fromXML = function (xmlObj) {
	var glyph = new ns.Glyph();
	glyph.id = xmlObj.getAttribute('id');
	glyph.class_ = xmlObj.getAttribute('class');
	glyph.compartmentRef = xmlObj.getAttribute('compartmentRef');

	var labelXML = xmlObj.getElementsByTagName('label')[0];
	if (labelXML != null) {
		var label = ns.Label.fromXML(labelXML);
		glyph.setLabel(label);
	}
	var bboxXML = xmlObj.getElementsByTagName('bbox')[0];
	if (bboxXML != null) {
		var bbox = ns.Bbox.fromXML(bboxXML);
		glyph.setBbox(bbox);
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
ns.Label = function (text) {
	this.text = text;
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
	var label = new ns.Label();
	label.text = xmlObj.getAttribute('text');
	return label;
};
// ------- END LABEL -------

// ------- BBOX -------
ns.Bbox = function (x, y, w, h) {
	this.x = parseFloat(x);
	this.y = parseFloat(y);
	this.w = parseFloat(w);
	this.h = parseFloat(h);
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
	var bbox = new ns.Bbox();
	bbox.x = parseFloat(xmlObj.getAttribute('x'));
	bbox.y = parseFloat(xmlObj.getAttribute('y'));
	bbox.w = parseFloat(xmlObj.getAttribute('w'));
	bbox.h = parseFloat(xmlObj.getAttribute('h'));
	return bbox;
};
// ------- END BBOX -------

// ------- PORT -------
ns.Port = function (id, x, y) {
	this.id = id;
	this.x = parseFloat(x);
	this.y = parseFloat(y);
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
}
ns.Port.fromXML = function (xmlObj) {
	var port = new ns.Port();
	port.x = parseFloat(xmlObj.getAttribute('x'));
	port.y = parseFloat(xmlObj.getAttribute('y'));
	port.id = xmlObj.getAttribute('id');
	return port;
};
// ------- END PORT -------

// ------- ARC -------
ns.Arc = function (id, class_, source, target) {
	this.id = id;
	this.class_ = class_;
	this.source = source;
	this.target = target;

	this.start = null;
	this.end = null;
	this.nexts = [];
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
	for(var i=0; i < this.nexts; i++) {
		xmlString += this.nexts[i].toXML();
	}
	if(this.end != null) {
		xmlString += this.end.toXML();
	}
	
	xmlString += "</arc>\n";
	return xmlString;
};
ns.Arc.fromXML = function (xmlObj) {
	var arc = new ns.Arc();
	arc.id = xmlObj.getAttribute('id');
	arc.class_ = xmlObj.getAttribute('class');
	arc.source = xmlObj.getAttribute('source');
	arc.target = xmlObj.getAttribute('target');

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
ns.StartType = function (x, y) {
	this.x = parseFloat(x);
	this.y = parseFloat(y);
};
ns.StartType.prototype = Object.create(ns.SBGNBase.prototype);
ns.StartType.prototype.constructor = ns.StartType;
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
}
ns.StartType.fromXML = function (xmlObj) {
	var start = new ns.StartType();
	start.x = parseFloat(xmlObj.getAttribute('x'));
	start.y = parseFloat(xmlObj.getAttribute('y'));
	return start;
};
// ------- END STARTTYPE -------

// ------- ENDTYPE -------
ns.EndType = function (x, y) {
	this.x = parseFloat(x);
	this.y = parseFloat(y);
};
ns.EndType.prototype = Object.create(ns.SBGNBase.prototype);
ns.EndType.prototype.constructor = ns.EndType;
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
}
ns.EndType.fromXML = function (xmlObj) {
	var end = new ns.EndType();
	end.x = parseFloat(xmlObj.getAttribute('x'));
	end.y = parseFloat(xmlObj.getAttribute('y'));
	return end;
};
// ------- END ENDTYPE -------

// ------- NEXTTYPE -------
ns.NextType = function (x, y) {
	this.x = parseFloat(x);
	this.y = parseFloat(y);
};
ns.NextType.prototype = Object.create(ns.SBGNBase.prototype);
ns.NextType.prototype.constructor = ns.NextType;
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
}
ns.NextType.fromXML = function (xmlObj) {
	var next = new ns.NextType();
	next.x = parseFloat(xmlObj.getAttribute('x'));
	next.y = parseFloat(xmlObj.getAttribute('y'));
	return next;
};
// ------- END NEXTTYPE -------

module.exports = ns;