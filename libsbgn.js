var renderExt = require('./libsbgn-render-ext');

var ns = {};

ns.xmlns = "http://sbgn.org/libsbgn/0.3";


// ------- SBGN -------
ns.Sbgn = function (xmlns) {
	this.xmlns = xmlns;
	this.map = null;
};
ns.Sbgn.prototype.setMap = function (map) {
	this.map = map;
};
ns.Sbgn.prototype.toXML = function () {
	var xmlString = "<sbgn xmlns='"+this.xmlns+"'>\n";
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
		xmlString += this.glyphs[i].toXML;
	}
	for(var i=0; i < this.arcs; i++) {
		xmlString += this.arcs[i].toXML;
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
	var arcsXML = xmlObj.getElementsByTagName('arcs');
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
};
ns.Extension.prototype.add = function (xmlObj) { // add specific extension
	var extName = xmlObj.tagName;
	if (extName == 'renderInformation') {
		var renderInformation = renderExt.RenderInformation.fromXML(xmlObj);
		this.renderInformation = renderInformation;
	}
	else if (extName == 'annotations') {
		this[extName] = xmlObj; // to be parsed correctly
	}
	else { // unsupported extension, we still store the data as is
		this[extName] = xmlObj;
	}
	
};
ns.Extension.prototype.has = function (extensionName) {
	return this.hasOwnProperty(extensionName);
};
ns.Extension.prototype.get = function (extensionName) {
	if (this.has(extensionName)) {
		return this[extensionName];
	}
	else {
		return null;
	}
};
ns.Extension.prototype.toXML = function () {
	var xmlString = "<extension>\n";
	for (var extInstance in this) {
		console.log('extInstance toXML', extInstance);
		if (extInstance == "renderInformation") {
			xmlString += this[extInstance].toXML();
		}
		else {
			xmlString += new XMLSerializer().serializeToString(this[extInstance]);
		}
	}
	xmlString += "</extension>\n";
	return xmlString;
}
ns.Extension.fromXML = function (xmlObj) {
	console.log("fromXML", xmlObj);
	var extension = new ns.Extension();
	var children = xmlObj.children;
	for (var i=0; i < children.length; i++) {
		var extInstance = children[i];
		extension.add(extInstance);
	}
	console.log("extension", extension);
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
		xmlString += this.glyphMembers[i].toXML;
	}
	for(var i=0; i < this.ports; i++) {
		xmlString += this.ports[i].toXML;
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
	var glyphMembersXML = xmlObj.getElementsByTagName('glyph');
	for (var i=0; i < glyphMembersXML.length; i++) {
		var glyphMember = ns.Glyph.fromXML(glyphMembersXML[i]);
		glyph.addGlyphMember(glyphMember);
	}
	var portsXML = xmlObj.getElementsByTagName('port');
	for (var i=0; i < portsXML.length; i++) {
		var port = ns.Port.fromXML(portsXML[i]);
		glyph.addPort(port);
	}
};
// ------- END GLYPH -------


module.exports = ns;