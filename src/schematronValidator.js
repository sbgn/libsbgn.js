var ns = {};
var fs = require('file-system');
var libxslt = require('libxslt');
var replaceall = require("replaceall");
var parser = require("xml2js");
var Issue =  require('./Issue').Issue;
var SchematronValidation = function(file) {
	this.file 	= file;
};
SchematronValidation.isValid = function(file) {
	try {
		var isoContent=fs.readFileSync('template.xslt', 'utf8');
		var stylesheet2 =libxslt.parse(isoContent);
		var resultDocument2 = stylesheet2.apply(file);
		 parser.parseString(resultDocument2, function (err, result) {
        		resultDocument2 = result;
    		})
		var errors = [];
		if(resultDocument2["svrl:schematron-output"]["svrl:failed-assert"] == undefined)
			return errors;
		var errCount= resultDocument2["svrl:schematron-output"]["svrl:failed-assert"].length;
		for(var i=0;i<errCount;i++){
		   var error = new Issue();
		   error.setText(resultDocument2["svrl:schematron-output"]["svrl:failed-assert"][i]["svrl:text"]);
		   error.setPattern(resultDocument2["svrl:schematron-output"]["svrl:failed-assert"][i]["$"]["id"]); 
		   error.setRole(resultDocument2["svrl:schematron-output"]["svrl:failed-assert"][i]["svrl:diagnostic-reference"][0]["_"]);	
		   errors.push(error);	 			
		}
					
		//console.log(resultDocument2["svrl:schematron-output"]["svrl:failed-assert"][0]);
		return errors;
	}
	catch(e) {
		console.log(e);
		return false;
	}	
}
ns.SchematronValidation = SchematronValidation;
module.exports = ns;
