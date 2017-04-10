var libsbgnTypes = require('./libsbgn-types');
var libsbgnCore = require('./libsbgn');

var libsbgn = {};

libsbgn.test = function () {
	console.log("test libsbgn-js", libsbgnTypes.Language.PD);
	console.log("test crate sbgn", new libsbgnCore.Sbgn());
};

module.exports = {
	libsbgn: libsbgn,
	libsbgnCore: libsbgnCore
}