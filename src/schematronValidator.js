var ns = {};
var xml2js = require('xml2js');
ns.doValidation = function(file) {
    var errors = []; 
	try {
 		 $.ajax({
	      type: 'post',
	      url: "http://localhost:8081/schematronValidator/doValidation",
	      data: {file: file},
              async : false,
	      success: function(data){
		errors= data;
	      },
	      error: function(req, status, err) {
		console.error("Error during file validation", status, err);
	      }
	    });
            return errors;
	}
	catch(e) {
		console.log(e);
		return null;
	}	
}
module.exports = ns;
