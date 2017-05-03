var N3 = require('n3');

var ns = {};

ns.prefixes = {	rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
			    bqmodel: "http://biomodels.net/model-qualifiers/",
			    bqbiol: "http://biomodels.net/biology-qualifiers/",
			    sio: "http://semanticscience.org/resource/",
			    eisbm: "http://www.eisbm.org/"};

ns.expandPrefix = function(prefix) {
	return N3.Util.expandPrefixedName(prefix, ns.prefixes)
};

ns.getPropertiesOfId = function (graph, id) {
	var kvresult = {};
	//console.log(graph.getTriples());
	var propBags = graph.getTriples(id, "sio:SIO_000223", null);
	//console.log(propBags);
	for(var i=0; i<propBags.length; i++) {
		var propBag = propBags[i].object;
		//console.log(propBag);
		var propertyContainers = graph.getTriples(propBag, null, null);
		//console.log(propertyContainers);
		for(var j=0; j<propertyContainers.length; j++) {
			var propertyContainer = propertyContainers[j].object;
			if(propertyContainer == ns.expandPrefix("rdf:Bag")) {
				continue;
			}
			//console.log("container", propertyContainer);
			var value = graph.getObjects(propertyContainer, ns.expandPrefix("rdf:value"), null)[0];
			value = N3.Util.getLiteralValue(value);
			var key = graph.getObjects(propertyContainer, ns.expandPrefix("sio:SIO_000116"), null)[0];
			key = N3.Util.getLiteralValue(key);
			//console.log(key, value);
			kvresult[key] = value;
		}
	}
	return kvresult;
};

ns.getAllIds = function (graph) {
	var result = [];
	var all = graph.getSubjects();
	//console.log(graph.getTriples());
	//console.log(all);
	for(var i=0; i<all.length; i++) {
		if(! N3.Util.isBlank(all[i])) {
			var subject = all[i]; // potential IDs
			// now check if they aren't used as object of other triples
			var idAsObject = graph.countTriples(null, null, subject);
			if (idAsObject == 0) { // nothing is over this id, true id
				result.push(subject);
			}
		}
	}
	return result;
};

/**
 * will add triples to represent key/value properties attached to the id
 * kvObject can have one or multiple properties
 */
ns.addProperty = function (graph, id, kvObject) {
	var hasPropElement = ns.addHasProperty(graph, id);
	console.log("add kv to", hasPropElement);
	for(var key in kvObject) {
		// using elemnt count as index may be dangerous if previous manipulation of
		// the elements has happened. Like removing one. 
		var propIndex = ns.countBagElements(graph, hasPropElement) + 1;
		console.log("elements in bag:", propIndex);
		var newBlank = graph.createBlankNode();
		console.log("expand list element", ns.expandPrefix("rdf:_"+propIndex));
		graph.addTriple(hasPropElement, ns.expandPrefix("rdf:_"+propIndex), newBlank);
		graph.addTriple(newBlank, ns.expandPrefix("sio:SIO_000116"), N3.Util.createLiteral(key));
		graph.addTriple(newBlank, ns.expandPrefix("rdf:value"), N3.Util.createLiteral(kvObject[key]));
		console.log("added", key, kvObject[key]);
	}
};

ns.hasHasProperty = function (graph, id) {
	var countSIOProp = graph.countTriples(id, "sio:SIO_000223", null);
	return countSIOProp > 0;
};

ns.getHasProperty = function (graph, id) {
	var hasProp = graph.getObjects(id, "sio:SIO_000223", null)[0];
	return hasProp;
};

/**
 * returns the id of a newly created blank node representing the HasProperty predicate
 * if one already exists, returns its id
 */
ns.addHasProperty = function (graph, id) {
	if (ns.hasHasProperty(graph, id)) {
		return ns.getHasProperty(graph, id);
	}
	else {
		var newBlank = graph.createBlankNode();
		graph.addTriple(id, ns.expandPrefix("sio:SIO_000223"), newBlank);
		graph.addTriple(newBlank, ns.expandPrefix("rdf:type"), ns.expandPrefix("rdf:Bag"));
		return newBlank;
	}
};

ns.hasBag = function (graph, subject) {
	var countBag = graph.countTriples(subject, "rdf:type", "rdf:Bag");
	return countBag > 0;
};

ns.countBagElements = function(graph, subject) {
	return graph.countTriples(subject, null, null) - 1;
};

module.exports = ns;