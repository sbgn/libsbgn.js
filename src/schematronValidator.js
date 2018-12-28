var ns = {};
var fs = require('file-system');
var xml2js = require('xml2js');
var Issue =  require('./Issue').Issue;
var libxslt = require('libxslt');
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
					
		return errors;
	}
	catch(e) {
		console.log(e);
		return false;
	}	
}
function loadXMLDoc(filename)
{
if (window.ActiveXObject)
  {
  xhttp = new ActiveXObject("Msxml2.XMLHTTP");
  }
else 
  {
  xhttp = new XMLHttpRequest();
  }
xhttp.open("GET", filename, false);
try {xhttp.responseType = "msxml-document"} catch(err) {} // Helping IE11
xhttp.send("");
return xhttp.responseXML;
}
ns.SchematronValidation = SchematronValidation;
module.exports = ns;
