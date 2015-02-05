/* generate xml from openlit html */

/*

readdir
sort bookname

start convert
save as xml

create filelist.lst
*/
var fs=require("fs");
var glob=require("glob");
var booklist=require("./booklist");

var bkchapter=function(fn) {
	var i=fn.lastIndexOf("/");
	var v=fn.substr(i+1).replace(".html","").split("-");
	return {bkid:parseInt(v[0]), chapterid:parseInt(v[1])};
}
var sortfiles=function(files){
	return files.sort(function(a,b){
		var bc1=bkchapter(a);
		var bc2=bkchapter(b);
		if (bc1.bkid==bc2.bkid) {
			return bc1.chapterid-bc2.chapterid;
		} else {
			return bc1.bkid-bc2.bkid;
		}
	});
}
var pat=/<b>(.*?)<\/b>/
var lastbkid=0;
var out=[];
var filelist=[];
var writeBook=function(bkid) {
	var fn="xml/"+bkid+".xml";
	console.log("writing",fn);
	filelist.push(fn);
	fs.writeFileSync(fn,out.join("\n"),"utf8");
	out=[];
}

var processBody=function(body) {
	body=body.replace(/<br>/g,"\n<seg/>");
	body=body.replace(/<seg\/>\n<seg\/>/g,"\n<seg/>");
	body=body.replace(/<\/font>/g,"");
	body=body.replace(/<\/td>/g,"");

	//unicode entity
	body=body.replace(/&#(\d+);/g,function(m,m1){
		return String.fromCharCode(parseInt(m1));
	});

	//changjie code

	body=body.replace(/<img src=\/mpf\/.\/(.+?)\.BMP.*?>/g,function(m,m1){
		return "&cj-"+m1.toLowerCase()+";";
	})
	return body;
}
var processfile=function(fn) {
	var arr=fs.readFileSync(fn,"utf8").split("\n");
	var chapter=arr[26].match(pat)[1];
	var bc=bkchapter(fn);
	if (lastbkid!=bc.bkid && lastbkid) {
		writeBook(lastbkid);
	}
	var bkname=booklist.getbookname(bc.bkid);
	if (!chapter) {
		console.log("chapter ",bc.chapterid,"of book",bkname,"is empty");
		return;
	}
	if (!out.length) out.push('<book n="'+bc.bkid+'">'+bkname+'</book>');
	out.push('<chapter n="'+bc.chapterid+'">'+chapter+'</chapter>');
	var body=arr[30].substr(56);
	out.push(processBody(body));
	lastbkid=bc.bkid;
}
glob("raw/*.html",function(err,files){
	sortfiles(files).map(processfile);
	writeBook(lastbkid);
	fs.writeFileSync("filelist.lst",filelist.join("\n"),"utf8");
});
