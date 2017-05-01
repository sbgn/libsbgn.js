var checkParams = require('./utilities').checkParams;
var $rdf = require('rdflib');
var xmldom = require('xmldom');
var rdfstore = require('rdfstore');
var deasync = require('deasync');

var ns = {};

/*
	EXAMPLE:

	<rdf:RDF 
		xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
	    xmlns:bqmodel="http://biomodels.net/model-qualifiers/"
	    xmlns:bqbiol="http://biomodels.net/biology-qualifiers/"
	    xmlns:eisbm="http://www.eisbm.org/rdf-annotation-newt/">
		<rdf:Description rdf:about="#_000001">
			<bqmodel:is>
				<rdf:Bag>
					<rdf:li rdf:resource="http://identifiers.org/biomodels.db/BIOMD0000000004" />
				</rdf:Bag>
			</bqmodel:is>

			<bqmodel:isDescribedBy>
				<rdf:Bag>
					<rdf:li rdf:resource="http://identifiers.org/pubmed/1833774" />
				</rdf:Bag>
			</bqmodel:isDescribedBy>

			<eisbm:hasProperty>
				<rdf:Bag>
					<eisbm:item eisbm:key="data" eisbm:value="42" />
					<eisbm:item eisbm:key="data2" eisbm:value="1.23" />
				</rdf:Bag>
			</eisbm:hasProperty>

		</rdf:Description>
	</rdf:RDF> 


*/

//ns.xmlns = "http://www.sbml.org/sbml/level3/version1/render/version1";

// ------- ANNOTATION -------
/**
 * Represents the <code>&lt;annotation&gt;</code> element.
 * @class
 */
var Annotation = function (params) {
	var params = checkParams(params, []);
	this.rdfElements = [];
};

/**
 * @param {RdfElement} rdfAnnotation
 */
Annotation.prototype.addRDF = function(rdfAnnotation) {
	this.rdfElements.push(rdfAnnotation);
};

/**
 * @return {Element}
 */
Annotation.prototype.buildXmlObj = function () {
	var annotation = new xmldom.DOMImplementation().createDocument().createElement('annotation');
	for (var i=0; i<this.rdfElements.length; i++) {
		var rdf = this.rdfElements[i];
		console.log(rdf.toXML());

	}
	return annotation;
};

/**
 * @return {string}
 */
Annotation.prototype.toXML = function() {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @param {Element} xml
 * @return {Annotation}
 */
Annotation.fromXML = function (xml) {
	if (xml.tagName != 'annotation') {
		throw new Error("Bad XML provided, expected tagName annotation, got: " + xml.tagName);
	}
	var annotation = new ns.Annotation();

	var rdfs = xml.getElementsByTagName('rdf:RDF');
	for (var i=0; i<rdfs.length; i++) {
		var rdfXML = rdfs[i];
		// parse rdf
		var rdf = ns.RdfElement.fromXML(rdfXML);
		annotation.addRDF(rdf);
	}

	return annotation;
};
ns.Annotation = Annotation;
// ------- END ANNOTATION -------

// ------- RDFELEMENT -------
/**
 * Represents the <code>&lt;rdf&gt;</code> element.
 * @class
 */
var RdfElement = function (params) {
	var params = checkParams(params, ['graph']);
	this.graph = params.graph;
	this.uri = 'http://www.eisbm.org/';
};

/**
 * @return {Element}
 */
RdfElement.prototype.buildXmlObj = function () {

};

/**
 * @return {string}
 */
RdfElement.prototype.toXML = function() {

	var stringNT;
	var done = false;
	console.log("init graph", this.graph);
	this.graph.graph(function(err, graph){
	  stringNT = graph.toNT();
	  console.log("inside", graph);
	  done = true;
	});
	deasync.loopWhile(function(){return !done;});
	console.log("first serialize", stringNT);

	var graph = $rdf.graph();
	try {
	    $rdf.parse(stringNT, graph, this.uri, 'text/n3');
	} catch (err) {
	    console.log(err);
	}
	//console.log("intermediate graph", graph);


	var serialize = $rdf.serialize($rdf.sym(this.uri), graph, undefined, 'application/rdf+xml');
	console.log("final serialize", serialize);
	// serialize1 has modified output !!! need to correct it

	function replaceItem(string) {
		// regexp will capture key and value
		// $1 gets the namespace prefix
		// $2 gets the key attribute value
		// $3 gets the value attribute value
		var regexpItem = /<(\w+?):item( rdf:parseType="Resource")?>[\s\S]*?<\w+?:key>(\S*)<\/\w+?:key>[\s\S]*?<\w+?:value>(\S*)<\/\w+?:value>[\s\S]*?<\/\w+?:item>/g;
		var result = string.replace(regexpItem, '<$1:item $1:key="$3" $1:value="$4"/>');

		return result;
	}

	function replaceLi(string) {
		var regexpLi = /<rdf:li( rdf:parseType="Resource")?>[\s\S]*?<(\w+):SIO_000116>([\s\S]*?)<\/\2:SIO_000116>[\s\S]*?<rdf:value>([\s\S]*?)<\/rdf:value>[\s\S]*?<\/rdf:li>/g;
		var result = string.replace(regexpLi, '<rdf:li $2:SIO_000116="$3" rdf:value="$4"/>');
		return result;
	}

	function replaceBag(string) {
		// regexp will spot a transformed bag and capture its content
		//var regexpBag = / rdf:parseType="Resource">[\s\S]*?(<rdf:Description>([\s\S]*?)<rdf:type rdf:resource="http:\/\/www\.w3\.org\/1999\/02\/22-rdf-syntax-ns#Bag"\/>[\s\S]*?<\/rdf:Description>)/g;
		var regexpBag = /(<rdf:Description>([\s\S]*?)<rdf:type rdf:resource="http:\/\/www\.w3\.org\/1999\/02\/22-rdf-syntax-ns#Bag"\/>[\s\S]*?<\/rdf:Description>)/g;
		var result1 = string.replace(regexpBag, '<rdf:Bag>$2</rdf:Bag>');
		//console.log('INTERMEDIATE RESULT\n', result1);
		var result = replaceLi(result1);
		return result;
	}

	function replaceParseType(string) {
		var regexp = / rdf:parseType="Resource"/g;
		return string.replace(regexp, '');
	}
	
	var result = replaceParseType(replaceBag(serialize));
	
	return result;
};

RdfElement.prototype.test = function() {
	console.log(this.graph);
	var RDF = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
	var BQMODEL = $rdf.Namespace("http://biomodels.net/model-qualifiers/");
	var BQBIOL = $rdf.Namespace("http://biomodels.net/biology-qualifiers/");
	var SIO = $rdf.Namespace("http://semanticscience.org/resource/");
	console.log("test1", this.graph.statementsMatching(undefined, undefined, $rdf.literal("42")));
	var query = $rdf.SPARQLToQuery("PREFIX sio:  <http://semanticscience.org/resource/>\n"+
		"SELECT ?res \n"+
		"WHERE {\n"+
		'    ?res sio:SIO_000116 "data2" .\n'+
		//'    ?res rdfs:member ?tmp .\n'+
		//"    ?person foaf:mbox ?email .\n"+
		"}", true, this.graph);
	this.graph.fetcher = null;

	function endf(res) {
		console.log("END", res);
	}
	this.graph.query(query, function(result) {
        console.log('query ran');
        var res = result['?res'].value;
        console.log(res);
        endf(res);
    });

    console.log("execute", store.execute('PREFIX sio: <http://semanticscience.org/resource/>\n'+
				'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> '+
				'SELECT * '+
				'WHERE { '+
				'?res sio:SIO_000116 "data2". '+
				'?bag ?a ?res.'+
				'?end sio:SIO_000223 ?bag.'+
				//'?a ?res ?b '+
				//'?a ?c ?b '+
				//'?cities ?prop ?s. FILTER (strstarts(str(?s), str(rdf:_)))'+
				'}', function(err, results){
					if(!err) {
						// process results
						console.log("execute", results);
					}
				}));

}

/**
 * @param {Element} xml
 * @return {RdfElement}
 */
RdfElement.fromXML = function (xml) {
	if (xml.tagName != 'rdf:RDF') {
		throw new Error("Bad XML provided, expected tagName rdf:RDF, got: " + xml.tagName);
	}
	var rdfElement = new RdfElement();
	var graph = $rdf.graph();

	// rdflib only accepts string as input, not xml elements
	var stringXml = new xmldom.XMLSerializer().serializeToString(xml);
	try {
	    $rdf.parse(stringXml, graph, rdfElement.uri, 'application/rdf+xml');
	} catch (err) {
	    console.log(err);
	}
	
	// convert to turtle to feed to rdfstore
	var turtle = $rdf.serialize($rdf.sym(rdfElement.uri), graph, undefined, 'text/turtle');

	var done = false;
	var finalStore;
	rdfstore.create(function(err, store) {
		store.load("text/turtle", turtle, function(err, results) {
			done = true;
		});
		finalStore = store;
	});
	deasync.loopWhile(function(){return !done;});
	rdfElement.graph = finalStore;

	return rdfElement;
};
ns.RdfElement = RdfElement;
// ------- END RDFELEMENT -------

ns.rdflib = $rdf;

module.exports = ns;
