var ns = {};
var fs = require('fs');
var Issue =  require('./Issue').Issue;
var SchematronValidation = function(file) {
	this.file 	= file;
};
SchematronValidation.isValid = function(file) {
	try {
		var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async="false";
  		xmlDoc.onreadystatechange=verify;
  		xmlDoc.load('template.xslt');
  		var isoContent=xmlDoc.documentElement;
		var xsltProcessor = new XSLTProcessor();
		xsltProcessor.importStylesheet(isoContent);
		var ownerDocument = document.implementation.createDocument("", "", null);
	  	var result = xsltProcessor.transformToFragment(xmlDoc, ownerDocument);
		var errors = [];
		if(result["svrl:schematron-output"]["svrl:failed-assert"] == undefined)
			return errors;
		var errCount= resultDocument2["svrl:schematron-output"]["svrl:failed-assert"].length;
		for(var i=0;i<errCount;i++){
		   var error = new Issue();
		   error.setText(result["svrl:schematron-output"]["svrl:failed-assert"][i]["svrl:text"]);
		   error.setPattern(result["svrl:schematron-output"]["svrl:failed-assert"][i]["$"]["id"]); 
		   error.setRole(result["svrl:schematron-output"]["svrl:failed-assert"][i]["svrl:diagnostic-reference"][0]["_"]);	
		   errors.push(error);	 			
		}
					
		//console.log(result["svrl:schematron-output"]["svrl:failed-assert"][0]);
		return errors;
	}
	catch(e) {
		console.log(e);
		return false;
	}	
}
ns.SchematronValidation = SchematronValidation;
module.exports = ns;
