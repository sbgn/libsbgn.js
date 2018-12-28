var schematronValidator = require('./schematronValidator');
var fs = require('file-system');
var file=fs.readFileSync('pd10101-fail.sbgn.xml', 'utf8');
var result = schematronValidator.isValid(file);
console.log(result);
