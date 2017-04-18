var checkParams = require('./utilities').checkParams;

var ns = {};

ns.xmlns = "http://www.sbml.org/sbml/level3/version1/render/version1";

// ------- COLORDEFINITION -------
ns.ColorDefinition = function(params) {
	var params = checkParams(params, ['id', 'value']);
	this.id 	= params.id;
	this.value 	= params.value;
};

ns.ColorDefinition.prototype.toXML = function () {
	var xmlString = "<colorDefinition";
	if (this.id != null) {
		xmlString += " id='"+this.id+"'";
	}
	if (this.value != null) {
		xmlString += " value='"+this.value+"'";
	}
	xmlString += " />\n";
	return xmlString;
};

ns.ColorDefinition.fromXML = function (xml) {
	var colorDefinition = new ns.ColorDefinition();
	colorDefinition.id 		= xml.getAttribute('id');
	colorDefinition.value 	= xml.getAttribute('value');
	return colorDefinition;
};
// ------- END COLORDEFINITION -------

// ------- LISTOFCOLORDEFINITIONS -------
ns.ListOfColorDefinitions = function () {
	this.colorList = [];
};

ns.ListOfColorDefinitions.prototype.addColorDefinition = function (colorDefinition) {
	this.colorList.push(colorDefinition);
};

ns.ListOfColorDefinitions.prototype.toXML = function () {
	var xmlString = "<listOfColorDefinitions>\n";
	for(var i=0; i<this.colorList.length; i++) {
		var color = this.colorList[i];
		xmlString += color.toXML();
	}
	xmlString += "</listOfColorDefinitions>\n";
	return xmlString;
};

ns.ListOfColorDefinitions.fromXML = function (xml) {
	var listOfColorDefinitions = new ns.ListOfColorDefinitions();

	var colorDefinitions = xml.getElementsByTagName('colorDefinition');
	for (var i=0; i<colorDefinitions.length; i++) {
		var colorDefinitionXML = colorDefinitions[i];
		var colorDefinition = ns.ColorDefinition.fromXML(colorDefinitionXML);
		listOfColorDefinitions.addColorDefinition(colorDefinition);
	}
	return listOfColorDefinitions;
};
// ------- END LISTOFCOLORDEFINITIONS -------

// ------- RENDERGROUP -------
ns.RenderGroup = function (params) {
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

ns.RenderGroup.prototype.toXML = function () {
	var xmlString = "<g";
	if (this.id != null) {
		xmlString += " id='"+this.id+"'";
	}
	if (this.fontSize != null) {
		xmlString += " fontSize='"+this.fontSize+"'";
	}
	if (this.fontFamily != null) {
		xmlString += " fontFamily='"+this.fontFamily+"'";
	}
	if (this.fontWeight != null) {
		xmlString += " fontWeight='"+this.fontWeight+"'";
	}
	if (this.fontStyle != null) {
		xmlString += " fontStyle='"+this.fontStyle+"'";
	}
	if (this.textAnchor != null) {
		xmlString += " textAnchor='"+this.textAnchor+"'";
	}
	if (this.vtextAnchor != null) {
		xmlString += " vtextAnchor='"+this.vtextAnchor+"'";
	}
	if (this.stroke != null) {
		xmlString += " stroke='"+this.stroke+"'";
	}
	if (this.strokeWidth != null) {
		xmlString += " strokeWidth='"+this.strokeWidth+"'";
	}
	if (this.fill != null) {
		xmlString += " fill='"+this.fill+"'";
	}
	xmlString += " />\n";
	return xmlString;
};

ns.RenderGroup.fromXML = function (xml) {
	var renderGroup = new ns.RenderGroup({});
	renderGroup.id 			= xml.getAttribute('id');
	renderGroup.fontSize 	= xml.getAttribute('fontSize');
	renderGroup.fontFamily 	= xml.getAttribute('fontFamily');
	renderGroup.fontWeight 	= xml.getAttribute('fontWeight');
	renderGroup.fontStyle 	= xml.getAttribute('fontStyle');
	renderGroup.textAnchor 	= xml.getAttribute('textAnchor');
	renderGroup.vtextAnchor = xml.getAttribute('vtextAnchor');
	renderGroup.stroke 		= xml.getAttribute('stroke');
	renderGroup.strokeWidth = xml.getAttribute('strokeWidth');
	renderGroup.fill 		= xml.getAttribute('fill');
	return renderGroup;
};
// ------- END RENDERGROUP -------

// ------- STYLE -------
// localStyle from specs
ns.Style = function(params) {
	var params = checkParams(params, ['id', 'name', 'idList', 'renderGroup']);
	this.id 			= params.id;
	this.name 			= params.name;
	this.idList 		= params.idList;
	this.renderGroup 	= params.renderGroup;
};

ns.Style.prototype.setRenderGroup = function (renderGroup) {
	this.renderGroup = renderGroup;
};

ns.Style.prototype.toXML = function () {
	var xmlString = "<style";
	if (this.id != null) {
		xmlString += " id='"+this.id+"'";
	}
	if (this.name != null) {
		xmlString += " name='"+this.name+"'";
	}
	if (this.idList != null) {
		xmlString += " idList='"+this.idList.join(' ')+"'";
	}
	xmlString += ">\n";

	if (this.renderGroup) {
		xmlString += this.renderGroup.toXML();
	}

	xmlString += "</style>\n";
	return xmlString;
};

ns.Style.fromXML = function (xml) {
	var style = new ns.Style();
	style.id 		= xml.getAttribute('id');
	style.name 		= xml.getAttribute('name');
	var idList 		= xml.getAttribute('idList');
	style.idList 	= idList != null ? idList.split(' ') : [];

	var renderGroupXML = xml.getElementsByTagName('g')[0];
	if (renderGroupXML != null) {
		style.renderGroup = ns.RenderGroup.fromXML(renderGroupXML);
	}
	return style;
};
// ------- END STYLE -------

// ------- LISTOFSTYLES -------
ns.ListOfStyles = function() {
	this.styleList = [];
};

ns.ListOfStyles.prototype.addStyle = function(style) {
	this.styleList.push(style);
};

ns.ListOfStyles.prototype.toXML = function () {
	var xmlString = "<listOfStyles>\n";
	for(var i=0; i<this.styleList.length; i++) {
		var style = this.styleList[i];
		xmlString += style.toXML();
	}
	xmlString += "</listOfStyles>\n";
	return xmlString;
};

ns.ListOfStyles.fromXML = function (xml) {
	var listOfStyles = new ns.ListOfStyles();

	var styles = xml.getElementsByTagName('style');
	for (var i=0; i<styles.length; i++) {
		var styleXML = styles[i];
		var style = ns.Style.fromXML(styleXML);
		listOfStyles.addStyle(style);
	}
	return listOfStyles;
};
// ------- END LISTOFSTYLES -------

// ------- RENDERINFORMATION -------
ns.RenderInformation = function (params) {
	var params = checkParams(params, ['id', 'name', 'programName', 
		'programVersion', 'backgroundColor', 'listOfColorDefinitions', 'listOfStyles']);
	this.id 					= params.id; // required, rest is optional
	this.name 					= params.name;
	this.programName 			= params.programName;
	this.programVersion 		= params.programVersion;
	this.backgroundColor 		= params.backgroundColor;
	this.listOfColorDefinitions = params.listOfColorDefinitions;
	this.listOfStyles 			= params.listOfStyles;
	/*this.listOfColorDefinitions = new renderExtension.ListOfColorDefinitions(renderInfo.colorDef.colorList);
	this.listOfStyles = new renderExtension.ListOfStyles(renderInfo.styleDef);
	*/
};

ns.RenderInformation.prototype.setListOfColorDefinition = function(listOfColorDefinitions) {
	this.listOfColorDefinitions = listOfColorDefinitions;
};

ns.RenderInformation.prototype.setListOfStyles = function(listOfStyles) {
	this.listOfStyles = listOfStyles;
};

ns.RenderInformation.prototype.toXML = function() {
	// tag and its attributes
	var xmlString = "<renderInformation";
	if (this.id != null) {
		xmlString += " id='"+this.id+"'";
	}
	if (this.name != null) {
		xmlString += " name='"+this.name+"'";
	}
	if (this.programName != null) {
		xmlString += " programName='"+this.programName+"'";
	}
	if (this.programVersion != null) {
		xmlString += " programVersion='"+this.programVersion+"'";
	}
	if (this.backgroundColor != null) {
		xmlString += " backgroundColor='"+this.backgroundColor+"'";
	}
	xmlString += " xmlns='"+ns.xmlns+"'>\n";

	// child elements
	if (this.listOfColorDefinitions) {
		xmlString += this.listOfColorDefinitions.toXML();
	}
	if (this.listOfStyles) {
		xmlString += this.listOfStyles.toXML();
	}

	xmlString += "</renderInformation>\n";
	return xmlString;
};

// static constructor method
ns.RenderInformation.fromXML = function (xml) {
	var renderInformation = new ns.RenderInformation();
	renderInformation.id 				= xml.getAttribute('id');
	renderInformation.name 				= xml.getAttribute('name');
	renderInformation.programName 		= xml.getAttribute('programName');
	renderInformation.programVersion 	= xml.getAttribute('programVersion');
	renderInformation.backgroundColor 	= xml.getAttribute('backgroundColor');

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
// ------- END RENDERINFORMATION -------

module.exports = ns;