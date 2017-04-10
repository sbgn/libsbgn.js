var ns = {};

ns.xmlns = "http://www.sbml.org/sbml/level3/version1/render/version1";

ns.ColorDefinition = function(id, value) {
	// both are optional
	this.id = id;
	this.value = value;
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
	colorDefinition.id = xml.getAttribute('id');
	colorDefinition.value = xml.getAttribute('value');
	return colorDefinition;
};

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


ns.RenderGroup = function (param) {
	// each of those are optional, so test if it is defined is mandatory
	// specific to renderGroup
	this.fontSize = param.fontSize;
	this.fontFamily = param.fontFamily;
	this.fontWeight = param.fontWeight;
	this.fontStyle = param.fontStyle;
	this.textAnchor = param.textAnchor; // probably useless
	this.vtextAnchor = param.vtextAnchor; // probably useless
	// from GraphicalPrimitive2D
	this.fill = param.fill; // fill color
	// from GraphicalPrimitive1D
	this.id = param.id;
	this.stroke = param.stroke; // stroke color
	this.strokeWidth = param.strokeWidth;
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
	renderGroup.id = xml.getAttribute('id');
	renderGroup.fontSize = xml.getAttribute('fontSize');
	renderGroup.fontFamily = xml.getAttribute('fontFamily');
	renderGroup.fontWeight = xml.getAttribute('fontWeight');
	renderGroup.fontStyle = xml.getAttribute('fontStyle');
	renderGroup.textAnchor = xml.getAttribute('textAnchor');
	renderGroup.vtextAnchor = xml.getAttribute('vtextAnchor');
	renderGroup.stroke = xml.getAttribute('stroke');
	renderGroup.strokeWidth = xml.getAttribute('strokeWidth');
	renderGroup.fill = xml.getAttribute('fill');
	return renderGroup;
};

// localStyle from specs
ns.Style = function(id, name, idList) {
	// everything is optional	
	this.id = id;
	this.name = name;
	this.idList = idList;
	this.renderGroup = null; // 0 or 1
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
	style.id = xml.getAttribute('id');
	style.name = xml.getAttribute('name');
	var idList = xml.getAttribute('idList');
	style.idList = idList != null ? idList.split(' ') : [];

	var renderGroupXML = xml.getElementsByTagName('g')[0];
	if (renderGroupXML != null) {
		style.renderGroup = ns.RenderGroup.fromXML(renderGroupXML);
	}
	return style;
};

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

ns.RenderInformation = function (id, name, backgroundColor, providedProgName, providedProgVersion) {
	this.id = id; // required, rest is optional
	this.name = name;
	this.programName = providedProgName;
	this.programVersion = providedProgVersion;
	this.backgroundColor = backgroundColor;
	this.listOfColorDefinitions = null;
	this.listOfStyles = null;
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
	var xmlString = "<renderInformation id='"+this.id+"'";
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
	renderInformation.id = xml.getAttribute('id');
	renderInformation.name = xml.getAttribute('name');
	renderInformation.programName = xml.getAttribute('programName');
	renderInformation.programVersion = xml.getAttribute('programVersion');
	renderInformation.backgroundColor = xml.getAttribute('backgroundColor');

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

/* probably useless, seems like nobody use this in the extension
ns.defaultValues = {
	backgroundColor: null,
	fontSize: null,
	fontFamily: null,
	fontWeight: null,
	fontStyle: null,
	textAnchor: null,
	vtextAnchor: null,
	fill: null,
	stroke: null,
	strokeWidth: null
};


ns.listOfRenderInformation = {
	defaultValues: {},
	renderInformationList: []
}
*/

module.exports = ns;