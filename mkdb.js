/*
TODO , normalize all traditional and variants to simplified Chinese
*/


var do_hn=function(text,tag,attributes,status) {
	if (!text) return;
	return [	{path:["hn"],value:text.trim()},
		      {path:["hn_depth"],value:status.tagStack.length+2},
		      {path:["hn_vpos"],value:status.vposstart},
		      {path:["hn_len"],value:status.vpos-status.vposstart}
		    ]
}

var captureTags={
	"h1":do_hn, 
	"h2":do_hn, 
	"h3":do_hn, 
};

var warning=function() {
	console.log.apply(console,arguments);
}

var onFile=function(fn) {
	if (typeof window!=="undefined") console.log("indexing ",fn);
	else process.stdout.write("indexing "+fn+"\033[0G");
}

var finalized=function(session) {
	console.log("VPOS",session.vpos);
	console.log("FINISHED")
}
var finalizeField=function(fields) {

}
//break into smaller unit by h1

var config={
	name:"openlit"
	,meta:{
		config:"simple1",
		toc:'hn'
	}
	,glob:"openlit.lst"
	,segsep:"_.id"
	,format:"TEIP5"
	,reset:true
	,finalized:finalized
	,finalizeField:finalizeField
	,warning:warning
	,captureTags:captureTags
	,preprocessor:require("./preprocessor")
	,norawtag:true
	,callbacks: {
		onFile:onFile
	}
	//,noWrite:true
}
require("ksana-indexer").build(config);
module.exports=config;