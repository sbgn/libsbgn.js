var schematronValidator = require('./SchematronValidator');
var fs = require('file-system');
var file=fs.readFileSync('pd10112-fail-1.sbgn', 'utf8');
var result = schematronValidator.isValid(file);
console.log(result);
