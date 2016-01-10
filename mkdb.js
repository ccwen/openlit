/*
TODO , normalize all traditional and variants to simplified Chinese
*/


var do_hn=function(text,tag,attributes,status) {
	if (!text) return;
	var depth=parseInt(tag.substr(2,1));
	if (isNaN(depth)) {
		console.log('error tag',tag,text);
	}
	return [	{path:["hn"],value:text.trim()},
		      {path:["hn_depth"],value:depth},
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

//break into smaller unit by h1
var finalizeJSON=function(JSON) {
	JSON.segnames.enc="utf8";
	JSON.filenames.enc="utf8";
}

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

	,warning:warning
	,captureTags:captureTags
	,preprocessor:require("./preprocessor")
	,norawtag:true
	,callbacks: {
		onFile:onFile
		,finalized:finalized
		,finalizeJSON:finalizeJSON
	}
	//,noWrite:true
}
require("ksana-indexer").build(config);
module.exports=config;