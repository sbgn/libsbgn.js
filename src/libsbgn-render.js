/**
 * This submodule contains the classes to manage the render extension's xml and some utility functions.
 * It adds the ability to save the styles and colors used in an SBGN map, as features like background-color,
 * border thickness or font properties are not part of the SBGN standard.
 *
 * It is loosely based on the {@link http://sbml.org/Documents/Specifications/SBML_Level_3/Packages/render|render extension of the SBML format}.
 * A subset of this specification has been adapted for SBGN-ML integration.
 *
 * See {@link Extension} for more general information on extensions in the SBGN-ML format.
 *
 * You can access the following classes like this: <code>libsbgn.render.ColorDefinition</code>
 *
 * @module libsbgn-render
 * @namespace libsbgn.render
*/

var checkParams = require('./utilities').checkParams;
var utils = require('./utilities');
var xmldom = require('xmldom');
var xml2js = require('xml2js');

var ns = {};

ns.xmlns = "http://www.sbml.org/sbml/level3/version1/render/version1";

// ------- COLORDEFINITION -------
/**
 * Represents the <code>&lt;colorDefinition&gt;</code> element.
 * @class
 * @param {Object} params
 * @param {string=} params.id
 * @param {string=} params.value
 */
var ColorDefinition = function(params) {
	var params = checkParams(params, ['id', 'value']);
	this.id 	= params.id;
	this.value 	= params.value;
};

/**
 * @return {Element}
 */
ColorDefinition.prototype.buildXmlObj = function () {
	var colorDefinition = new xmldom.DOMImplementation().createDocument().createElement('colorDefinition');
	if (this.id != null) {
		colorDefinition.setAttribute('id', this.id);
	}
	if (this.value != null) {
		colorDefinition.setAttribute('value', this.value);
	}
	return colorDefinition;
};

ColorDefinition.prototype.buildJsObj = function () {
	var colordefObj = {};

	// attributes
	var attributes = {};
	if(this.id != null) {
		attributes.id = this.id;
	}
	if(this.value != null) {
		attributes.value = this.value;
	}
	utils.addAttributes(colordefObj, attributes);
	return colordefObj;
};

/**
 * @return {string}
 */
ColorDefinition.prototype.toXML = function () {
	return utils.buildString({colorDefinition: this.buildJsObj()})
};

/**
 * @param {Element} xml
 * @return {ColorDefinition}
 */
ColorDefinition.fromXML_old = function (xml) {
	if (xml.tagName != 'colorDefinition') {
		throw new Error("Bad XML provided, expected tagName colorDefinition, got: " + xml.tagName);
	}
	var colorDefinition = new ns.ColorDefinition();
	colorDefinition.id 		= xml.getAttribute('id') || null;
	colorDefinition.value 	= xml.getAttribute('value') || null;
	return colorDefinition;
};

ColorDefinition.fromXML = function (string) {
	var colorDefinition;
	function fn (err, result) {
        colorDefinition = ColorDefinition.fromObj(result);
    };
    utils.parseString(string, fn);
    return colorDefinition;
};

ColorDefinition.fromObj = function (jsObj) {
	if (typeof jsObj.colorDefinition == 'undefined') {
		throw new Error("Bad XML provided, expected tagName colorDefinition, got: " + Object.keys(jsObj)[0]);
	}

	var colorDefinition = new ns.ColorDefinition();
	jsObj = jsObj.colorDefinition;
	if(typeof jsObj != 'object') { // nothing inside, empty xml
		return colorDefinition;
	}

	if(jsObj.$) { // we have some attributes
		var attributes = jsObj.$;
		colorDefinition.id = attributes.id || null;
		colorDefinition.value = attributes.value || null;
	}
	return colorDefinition;
};

ns.ColorDefinition = ColorDefinition;
// ------- END COLORDEFINITION -------

// ------- LISTOFCOLORDEFINITIONS -------
/**
 * Represents the <code>&lt;listOfColorDefinitions&gt;</code> element.
 * @class
 */
var ListOfColorDefinitions = function () {
	this.colorDefinitions = [];
};

/**
 * @param {ColorDefinition} colorDefinition
 */
ListOfColorDefinitions.prototype.addColorDefinition = function (colorDefinition) {
	this.colorDefinitions.push(colorDefinition);
};

/**
 * @return {Element}
 */
ListOfColorDefinitions.prototype.buildXmlObj = function () {
	var listOfColorDefinitions = new xmldom.DOMImplementation().createDocument().createElement('listOfColorDefinitions');
	for(var i=0; i<this.colorDefinitions.length; i++) {
		listOfColorDefinitions.appendChild(this.colorDefinitions[i].buildXmlObj());
	}
	return listOfColorDefinitions;
};

ListOfColorDefinitions.prototype.buildJsObj = function () {
	var listOfColorDefinitionsObj = {};

	for(var i=0; i < this.colorDefinitions.length; i++) {
		if (i==0) {
			listOfColorDefinitionsObj.colorDefinition = [];
		}
		listOfColorDefinitionsObj.colorDefinition.push(this.colorDefinitions[i].buildJsObj());
	}

	return listOfColorDefinitionsObj;
};

/**
 * @return {string}
 */
ListOfColorDefinitions.prototype.toXML = function () {
	return utils.buildString({listOfColorDefinitions: this.buildJsObj()})
};

/**
 * @param {Element} xml
 * @return {ListOfColorDefinitions}
 */
ListOfColorDefinitions.fromXML_old = function (xml) {
	if (xml.tagName != 'listOfColorDefinitions') {
		throw new Error("Bad XML provided, expected tagName listOfColorDefinitions, got: " + xml.tagName);
	}
	var listOfColorDefinitions = new ns.ListOfColorDefinitions();

	var colorDefinitions = xml.getElementsByTagName('colorDefinition');
	for (var i=0; i<colorDefinitions.length; i++) {
		var colorDefinitionXML = colorDefinitions[i];
		var colorDefinition = ns.ColorDefinition.fromXML(colorDefinitionXML);
		listOfColorDefinitions.addColorDefinition(colorDefinition);
	}
	return listOfColorDefinitions;
};

ListOfColorDefinitions.fromXML = function (string) {
	var listOfColorDefinitions;
	function fn (err, result) {
        listOfColorDefinitions = ListOfColorDefinitions.fromObj(result);
    };
    utils.parseString(string, fn);
    return listOfColorDefinitions;
};

ListOfColorDefinitions.fromObj = function (jsObj) {
	console.log("listOfColorDefinitions", jsObj);
	if (typeof jsObj.listOfColorDefinitions == 'undefined') {
		throw new Error("Bad XML provided, expected tagName listOfColorDefinitions, got: " + Object.keys(jsObj)[0]);
	}

	var listOfColorDefinitions = new ns.ListOfColorDefinitions();
	jsObj = jsObj.listOfColorDefinitions;
	if(typeof jsObj != 'object') { // nothing inside, empty xml
		return listOfColorDefinitions;
	}

	// children
	if(jsObj.colorDefinition) {
		var colorDefinitions = jsObj.colorDefinition;
		for (var i=0; i < colorDefinitions.length; i++) {
			var colorDefinition = ns.ColorDefinition.fromObj({colorDefinition: colorDefinitions[i]});
			listOfColorDefinitions.addColorDefinition(colorDefinition);
		}
	}

	return listOfColorDefinitions;
};

ns.ListOfColorDefinitions = ListOfColorDefinitions;
// ------- END LISTOFCOLORDEFINITIONS -------

// ------- RENDERGROUP -------
/**
 * Represents the <code>&lt;g&gt;</code> element.
 * @class
 * @param {Object} params
 * @param {string=} params.id
 * @param {string=} params.fontSize
 * @param {string=} params.fontFamily
 * @param {string=} params.fontWeight
 * @param {string=} params.fontStyle
 * @param {string=} params.textAnchor
 * @param {string=} params.vtextAnchor
 * @param {string=} params.fill The element's background color
 * @param {string=} params.stroke Border color for glyphs, line color for arcs.
 * @param {string=} params.strokeWidth
 */
var RenderGroup = function (params) {
	// each of those are optional, so test if it is defined is mandatory
	var params = checkParams(params, ['fontSize', 'fontFamily', 'fontWeight', 
		'fontStyle', 'textAnchor', 'vtextAnchor', 'fill', 'id', 'stroke', 'strokeWidth']);
	// specific to renderGroup
	this.fontSize 		= params.fontSize;
	this.fontFamily 	= params.fontFamily;
	this.fontWeight 	= params.fontWeight;
	this.fontStyle 		= params.fontStyle;
	this.textAnchor 	= params.textAnchor; // probably useless
	this.vtextAnchor 	= params.vtextAnchor; // probably useless
	// from GraphicalPrimitive2D
	this.fill 			= params.fill; // fill color
	// from GraphicalPrimitive1D
	this.id 			= params.id;
	this.stroke 		= params.stroke; // stroke color
	this.strokeWidth 	= params.strokeWidth;
};

/**
 * @return {Element}
 */
RenderGroup.prototype.buildXmlObj = function () {
	var renderGroup = new xmldom.DOMImplementation().createDocument().createElement('g');
	if (this.id != null) {
		renderGroup.setAttribute('id', this.id);
	}
	if (this.fontSize != null) {
		renderGroup.setAttribute('fontSize', this.fontSize);
	}
	if (this.fontFamily != null) {
		renderGroup.setAttribute('fontFamily', this.fontFamily);
	}
	if (this.fontWeight != null) {
		renderGroup.setAttribute('fontWeight', this.fontWeight);
	}
	if (this.fontStyle != null) {
		renderGroup.setAttribute('fontStyle', this.fontStyle);
	}
	if (this.textAnchor != null) {
		renderGroup.setAttribute('textAnchor', this.textAnchor);
	}
	if (this.vtextAnchor != null) {
		renderGroup.setAttribute('vtextAnchor', this.vtextAnchor);
	}
	if (this.stroke != null) {
		renderGroup.setAttribute('stroke', this.stroke);
	}
	if (this.strokeWidth != null) {
		renderGroup.setAttribute('strokeWidth', this.strokeWidth);
	}
	if (this.fill != null) {
		renderGroup.setAttribute('fill', this.fill);
	}
	return renderGroup;
};

RenderGroup.prototype.buildJsObj = function () {
	var renderGroupObj = {};

	// attributes
	var attributes = {};
	if(this.id != null) {
		attributes.id = this.id;
	}
	if(this.fontSize != null) {
		attributes.fontSize = this.fontSize;
	}
	if(this.fontFamily != null) {
		attributes.fontFamily = this.fontFamily;
	}
	if(this.fontWeight != null) {
		attributes.fontWeight = this.fontWeight;
	}
	if(this.fontStyle != null) {
		attributes.fontStyle = this.fontStyle;
	}
	if(this.textAnchor != null) {
		attributes.textAnchor = this.textAnchor;
	}
	if(this.vtextAnchor != null) {
		attributes.vtextAnchor = this.vtextAnchor;
	}
	if(this.stroke != null) {
		attributes.stroke = this.stroke;
	}
	if(this.strokeWidth != null) {
		attributes.strokeWidth = this.strokeWidth;
	}
	if(this.fill != null) {
		attributes.fill = this.fill;
	}
	utils.addAttributes(renderGroupObj, attributes);
	return renderGroupObj;
};

/**
 * @return {string}
 */
RenderGroup.prototype.toXML = function () {
	return utils.buildString({g: this.buildJsObj()})
};

/**
 * @param {Element} xml
 * @return {RenderGroup}
 */
RenderGroup.fromXML_old = function (xml) {
	if (xml.tagName != 'g') {
		throw new Error("Bad XML provided, expected tagName g, got: " + xml.tagName);
	}
	var renderGroup = new ns.RenderGroup({});
	renderGroup.id 			= xml.getAttribute('id') || null;
	renderGroup.fontSize 	= xml.getAttribute('fontSize') || null;
	renderGroup.fontFamily 	= xml.getAttribute('fontFamily') || null;
	renderGroup.fontWeight 	= xml.getAttribute('fontWeight') || null;
	renderGroup.fontStyle 	= xml.getAttribute('fontStyle') || null;
	renderGroup.textAnchor 	= xml.getAttribute('textAnchor') || null;
	renderGroup.vtextAnchor = xml.getAttribute('vtextAnchor') || null;
	renderGroup.stroke 		= xml.getAttribute('stroke') || null;
	renderGroup.strokeWidth = xml.getAttribute('strokeWidth') || null;
	renderGroup.fill 		= xml.getAttribute('fill') || null;
	return renderGroup;
};

RenderGroup.fromXML = function (string) {
	var g;
	function fn (err, result) {
        g = RenderGroup.fromObj(result);
    };
    utils.parseString(string, fn);
    return g;
};

RenderGroup.fromObj = function (jsObj) {
	if (typeof jsObj.g == 'undefined') {
		throw new Error("Bad XML provided, expected tagName g, got: " + Object.keys(jsObj)[0]);
	}

	var g = new ns.RenderGroup();
	jsObj = jsObj.g;
	if(typeof jsObj != 'object') { // nothing inside, empty xml
		return g;
	}

	if(jsObj.$) { // we have some attributes
		var attributes = jsObj.$;
		g.id 			= attributes.id || null;
		g.fontSize 		= attributes.fontSize || null;
		g.fontFamily 	= attributes.fontFamily || null;
		g.fontWeight 	= attributes.fontWeight || null;
		g.fontStyle 	= attributes.fontStyle || null;
		g.textAnchor 	= attributes.textAnchor || null;
		g.vtextAnchor 	= attributes.vtextAnchor || null;
		g.stroke 		= attributes.stroke || null;
		g.strokeWidth 	= attributes.strokeWidth || null;
		g.fill 			= attributes.fill || null;
	}
	return g;
};

ns.RenderGroup = RenderGroup;
// ------- END RENDERGROUP -------

// ------- STYLE -------
/**
 * Represents the <code>&lt;style&gt;</code> element.
 * @class
 * @param {Object} params
 * @param {string=} params.id
 * @param {string=} params.name
 * @param {string=} params.idList
 * @param {RenderGroup=} params.renderGroup
 */
var Style = function(params) {
	var params = checkParams(params, ['id', 'name', 'idList', 'renderGroup']);
	this.id 			= params.id;
	this.name 			= params.name;
	this.idList 		= params.idList; // TODO add utility functions to manage this (should be array)
	this.renderGroup 	= params.renderGroup;
};

/**
 * @param {RenderGroup} renderGroup
 */
Style.prototype.setRenderGroup = function (renderGroup) {
	this.renderGroup = renderGroup;
};

/**
 * @return {string[]}
 */
Style.prototype.getIdListAsArray = function () {
	return this.idList.split(' ');
}

/**
 * @param {string[]} idArray
 */
Style.prototype.setIdListFromArray = function (idArray) {
	this.idList = idArray.join(' ');
}

/**
 * @return {Element}
 */
Style.prototype.buildXmlObj = function () {
	var style = new xmldom.DOMImplementation().createDocument().createElement('style');
	if (this.id != null) {
		style.setAttribute('id', this.id);
	}
	if (this.name != null) {
		style.setAttribute('name', this.name);
	}
	if (this.idList != null) {
		style.setAttribute('idList', this.idList);
	}

	if (this.renderGroup) {
		style.appendChild(this.renderGroup.buildXmlObj());
	}
	return style;
};

Style.prototype.buildJsObj = function () {
	var styleObj = {};

	// attributes
	var attributes = {};
	if(this.id != null) {
		attributes.id = this.id;
	}
	if(this.name != null) {
		attributes.name = this.name;
	}
	if(this.idList != null) {
		attributes.idList = this.idList;
	}
	utils.addAttributes(styleObj, attributes);

	// children
	if(this.renderGroup != null) {
		styleObj.g =  this.renderGroup.buildJsObj();
	}
	console.log(styleObj);
	return styleObj;
};

/**
 * @return {string}
 */
Style.prototype.toXML = function () {
	return utils.buildString({style: this.buildJsObj()})
};

/**
 * @param {Element} xml
 * @return {Style}
 */
Style.fromXML_old = function (xml) {
	if (xml.tagName != 'style') {
		throw new Error("Bad XML provided, expected tagName style, got: " + xml.tagName);
	}
	var style = new ns.Style();
	style.id 		= xml.getAttribute('id') || null;
	style.name 		= xml.getAttribute('name') || null;
	style.idList 	= xml.getAttribute('idList') || null;

	var renderGroupXML = xml.getElementsByTagName('g')[0];
	if (renderGroupXML != null) {
		style.renderGroup = ns.RenderGroup.fromXML(renderGroupXML);
	}
	return style;
};

Style.fromXML = function (string) {
	var style;
	function fn (err, result) {
        style = Style.fromObj(result);
    };
    utils.parseString(string, fn);
    return style;
};

Style.fromObj = function (jsObj) {
	console.log("style", jsObj);
	if (typeof jsObj.style == 'undefined') {
		throw new Error("Bad XML provided, expected tagName style, got: " + Object.keys(jsObj)[0]);
	}

	var style = new ns.Style();
	jsObj = jsObj.style;
	if(typeof jsObj != 'object') { // nothing inside, empty xml
		return style;
	}

	if(jsObj.$) { // we have some attributes
		var attributes = jsObj.$;
		style.id = attributes.id || null;
		style.name = attributes.name || null;
		style.idList = attributes.idList || null;
	}

	// children
	if(jsObj.g) {
		var g = ns.RenderGroup.fromObj({g: jsObj.g[0]});
		style.setRenderGroup(g);
	}

	return style;
};

ns.Style = Style;
// ------- END STYLE -------

// ------- LISTOFSTYLES -------
/**
 * Represents the <code>&lt;listOfStyles&gt;</code> element.
 * @class
 */
var ListOfStyles = function() {
	this.styles = [];
};

/**
 * @param {Style} style
 */
ListOfStyles.prototype.addStyle = function(style) {
	this.styles.push(style);
};

/**
 * @return {Element}
 */
ListOfStyles.prototype.buildXmlObj = function () {
	var listOfStyles = new xmldom.DOMImplementation().createDocument().createElement('listOfStyles');
	for(var i=0; i<this.styles.length; i++) {
		listOfStyles.appendChild(this.styles[i].buildXmlObj());
	}
	return listOfStyles;
};

ListOfStyles.prototype.buildJsObj = function () {
	var listOfStylesObj = {};

	for(var i=0; i < this.styles.length; i++) {
		if (i==0) {
			listOfStylesObj.style = [];
		}
		listOfStylesObj.style.push(this.styles[i].buildJsObj());
	}

	return listOfStylesObj;
};

/**
 * @return {string}
 */
ListOfStyles.prototype.toXML = function () {
	return utils.buildString({listOfStyles: this.buildJsObj()})
};

/**
 * @param {Element} xml
 * @return {ListOfStyles}
 */
ListOfStyles.fromXML_old = function (xml) {
	if (xml.tagName != 'listOfStyles') {
		throw new Error("Bad XML provided, expected tagName listOfStyles, got: " + xml.tagName);
	}
	var listOfStyles = new ns.ListOfStyles();

	var styles = xml.getElementsByTagName('style');
	for (var i=0; i<styles.length; i++) {
		var styleXML = styles[i];
		var style = ns.Style.fromXML(styleXML);
		listOfStyles.addStyle(style);
	}
	return listOfStyles;
};

ListOfStyles.fromXML = function (string) {
	var listOfStyles;
	function fn (err, result) {
        listOfStyles = ListOfStyles.fromObj(result);
    };
    utils.parseString(string, fn);
    return listOfStyles;
};

ListOfStyles.fromObj = function (jsObj) {
	console.log("listOfStyles", jsObj);
	if (typeof jsObj.listOfStyles == 'undefined') {
		throw new Error("Bad XML provided, expected tagName listOfStyles, got: " + Object.keys(jsObj)[0]);
	}

	var listOfStyles = new ns.ListOfStyles();
	jsObj = jsObj.listOfStyles;
	if(typeof jsObj != 'object') { // nothing inside, empty xml
		return listOfStyles;
	}

	// children
	if(jsObj.style) {
		var styles = jsObj.style;
		for (var i=0; i < styles.length; i++) {
			var style = ns.Style.fromObj({style: styles[i]});
			listOfStyles.addStyle(style);
		}
	}

	return listOfStyles;
};

ns.ListOfStyles = ListOfStyles;
// ------- END LISTOFSTYLES -------

// ------- RENDERINFORMATION -------
/**
 * Represents the <code>&lt;renderInformation&gt;</code> element.
 * @class
 * @param {Object} params
 * @param {string=} params.id
 * @param {string=} params.name
 * @param {string=} params.programName
 * @param {string=} params.programVersion
 * @param {string=} params.backgroundColor
 * @param {ListOfColorDefinitions=} params.listOfColorDefinitions
 * @param {ListOfStyles=} params.listOfStyles
 */
var RenderInformation = function (params) {
	var params = checkParams(params, ['id', 'name', 'programName', 
		'programVersion', 'backgroundColor', 'listOfColorDefinitions', 'listOfStyles']);
	this.id 					= params.id; // required, rest is optional
	this.name 					= params.name;
	this.programName 			= params.programName;
	this.programVersion 		= params.programVersion;
	this.backgroundColor 		= params.backgroundColor;
	this.listOfColorDefinitions = params.listOfColorDefinitions;
	this.listOfStyles 			= params.listOfStyles;
};

/**
 * @param {ListOfColorDefinitions} listOfColorDefinitions
 */
RenderInformation.prototype.setListOfColorDefinitions = function(listOfColorDefinitions) {
	this.listOfColorDefinitions = listOfColorDefinitions;
};

/**
 * @param {ListOfStyles} listOfStyles
 */
RenderInformation.prototype.setListOfStyles = function(listOfStyles) {
	this.listOfStyles = listOfStyles;
};

/**
 * @return {Element}
 */
RenderInformation.prototype.buildXmlObj = function () {
	var renderInformation = new xmldom.DOMImplementation().createDocument().createElement('renderInformation');
	renderInformation.setAttribute('xmlns', ns.xmlns);
	if (this.id != null) {
		renderInformation.setAttribute('id', this.id);
	}
	if (this.name != null) {
		renderInformation.setAttribute('name', this.name);
	}
	if (this.programName != null) {
		renderInformation.setAttribute('programName', this.programName);
	}
	if (this.programVersion != null) {
		renderInformation.setAttribute('programVersion', this.programVersion);
	}
	if (this.backgroundColor != null) {
		renderInformation.setAttribute('backgroundColor', this.backgroundColor);
	}

	if (this.listOfColorDefinitions) {
		renderInformation.appendChild(this.listOfColorDefinitions.buildXmlObj());
	}
	if (this.listOfStyles) {
		renderInformation.appendChild(this.listOfStyles.buildXmlObj());
	}
	return renderInformation;
};

RenderInformation.prototype.buildJsObj = function () {
	var renderInformationObj = {};

	// attributes
	var attributes = {};
	attributes.xmlns = ns.xmlns;
	if(this.id != null) {
		attributes.id = this.id;
	}
	if(this.name != null) {
		attributes.name = this.name;
	}
	if(this.programName != null) {
		attributes.programName = this.programName;
	}
	if(this.programVersion != null) {
		attributes.programVersion = this.programVersion;
	}
	if(this.backgroundColor != null) {
		attributes.backgroundColor = this.backgroundColor;
	}
	utils.addAttributes(renderInformationObj, attributes);

	// children
	if(this.listOfColorDefinitions != null) {
		renderInformationObj.listOfColorDefinitions =  this.listOfColorDefinitions.buildJsObj();
	}
	if(this.listOfStyles != null) {
		renderInformationObj.listOfStyles =  this.listOfStyles.buildJsObj();
	}
	console.log(renderInformationObj);
	return renderInformationObj;
};

/**
 * @return {string}
 */
RenderInformation.prototype.toXML = function() {
	return utils.buildString({renderInformation: this.buildJsObj()})
};

/**
 * @param {Element} xml
 * @return {RenderInformation}
 */
RenderInformation.fromXML_old = function (xml) {
	if (xml.tagName != 'renderInformation') {
		throw new Error("Bad XML provided, expected tagName renderInformation, got: " + xml.tagName);
	}
	var renderInformation = new ns.RenderInformation();
	renderInformation.id 				= xml.getAttribute('id') || null;
	renderInformation.name 				= xml.getAttribute('name') || null;
	renderInformation.programName 		= xml.getAttribute('programName') || null;
	renderInformation.programVersion 	= xml.getAttribute('programVersion') || null;
	renderInformation.backgroundColor 	= xml.getAttribute('backgroundColor') || null;

	var listOfColorDefinitionsXML = xml.getElementsByTagName('listOfColorDefinitions')[0];
	var listOfStylesXML = xml.getElementsByTagName('listOfStyles')[0];
	if (listOfColorDefinitionsXML != null) {
		renderInformation.listOfColorDefinitions = ns.ListOfColorDefinitions.fromXML(listOfColorDefinitionsXML);
	}
	if (listOfStylesXML != null) {
		renderInformation.listOfStyles = ns.ListOfStyles.fromXML(listOfStylesXML);
	}

	return renderInformation;
};

RenderInformation.fromXML = function (string) {
	var renderInformation;
	function fn (err, result) {
        renderInformation = RenderInformation.fromObj(result);
    };
    utils.parseString(string, fn);
    return renderInformation;
};

RenderInformation.fromObj = function (jsObj) {
	console.log("renderInformation", jsObj);
	if (typeof jsObj.renderInformation == 'undefined') {
		throw new Error("Bad XML provided, expected tagName renderInformation, got: " + Object.keys(jsObj)[0]);
	}

	var renderInformation = new ns.RenderInformation();
	jsObj = jsObj.renderInformation;
	if(typeof jsObj != 'object') { // nothing inside, empty xml
		return renderInformation;
	}

	if(jsObj.$) { // we have some attributes
		var attributes = jsObj.$;
		renderInformation.id 				= attributes.id || null;
		renderInformation.name 				= attributes.name || null;
		renderInformation.programName 		= attributes.programName || null;
		renderInformation.programVersion 	= attributes.programVersion || null;
		renderInformation.backgroundColor 	= attributes.backgroundColor || null;
	}

	// children
	if(jsObj.listOfColorDefinitions) {
		var listOfColorDefinitions = ns.ListOfColorDefinitions.fromObj({listOfColorDefinitions: jsObj.listOfColorDefinitions[0]});
		renderInformation.setListOfColorDefinitions(listOfColorDefinitions);
	}
	if(jsObj.listOfStyles) {
		var listOfStyles = ns.ListOfStyles.fromObj({listOfStyles: jsObj.listOfStyles[0]});
		renderInformation.setListOfStyles(listOfStyles);
	}

	return renderInformation;
};

ns.RenderInformation = RenderInformation;
// ------- END RENDERINFORMATION -------

module.exports = ns;