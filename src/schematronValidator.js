var ns = {};
var xml2js = require('xml2js');
var SchematronValidation = function(file) {
	this.file 	= file;
};
SchematronValidation.isValid = function(file) {
	try {
 		 $.ajax({
	      type: 'post',
	      url: "http://localhost:8081/schematronValidator/isValid",
	      data: {file: file},
	      success: function(data){
		return data;
	      },
	      error: function(req, status, err) {
		console.error("Error during file validation", status, err);
	      }
	    });
	}
	catch(e) {
		console.log(e);
		return null;
	}	
}
ns.SchematronValidation = SchematronValidation;
module.exports = ns;
