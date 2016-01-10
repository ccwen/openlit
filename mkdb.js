/*
TODO , normalize all traditional and variants to simplified Chinese
*/
var raw="raw/*.html";

var do_div=function(text,tag,attributes,status) {
	return null;
}

var captureTags={
	"div":do_div, 
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

var config={
	name:"openlit"
	,meta:{
		config:"simple1",
		toc:"head"
	}
	,glob:yinshun // 可以規定索引的檔案群是那一些，可以含萬用字元
	,segsep:"p.n"
	,format:"TEIP5"
	,reset:true
	,finalized:finalized
	,finalizeField:finalizeField
	,warning:warning
	,captureTags:captureTags
	,callbacks: {
		onFile:onFile
	}
	,noWrite:true
}
require("ksana-indexer").build(config);
module.exports=config;