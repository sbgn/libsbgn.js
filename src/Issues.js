var Issues = function Issues() {
  this.text = {};
  this.patternId = {};	
}
Issues.prototype.setText = function(text) {
  this.text = text;
};
Issues.prototype.getText = function() {
  return this.text;
};
Issues.prototype.setPattern = function(pattern) {
  this.pattern = pattern;
};
Issues.prototype.getPattern = function() {
  return this.pattern;
};

exports.Issues = Issues;
