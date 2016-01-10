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
//var normalize=require("./normalize");
var cjcode={},cjurl={},entities={};
var bkchapter=function(fn) {
	var m=fn.match(/(\d+)\/(\d+)\.html/);
	return {bkid:parseInt(m[1]), chapterid:parseInt(m[2])};
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
	//console.log("writing",fn);
	filelist.push(fn);
	console.log(fn,out.length,"lines")
	fs.writeFileSync(fn,'<_ id="'+bkid+'">\n'+out.join("\n")+'\n</_>',"utf8");
	out=[];
}
var convertEntity=function(t){
	if (typeof t!=="string") {
		throw "empty "+t
	}
	return t.replace(/&#(\d+);/g,function(m,m1){
		var u=parseInt(m1);
		var c=String.fromCharCode(u);

		if (!entities[c])entities[c]=0;
		entities[c]++;
		return c;
	});
}
var processBody=function(body,bookid,chapterid) {
	body=body.replace(/<br\/?><br\/?>　　<br\/?><br\/?>/g,'');
	body=body.replace(/<br\/?><br\/?>　　<br\/?>　　<br\/?><br\/?>/g,'');
	body=body.replace(/\n　　\n/g,'\n');
	body=body.replace(/\n\n/g,'\n');
	body=body.replace(/<br\/?>\n?<br\/?>/g,"\n<br>");
	body=body.replace(/<br\/?>\n?<br\/?>/g,"\n<br>");

	body=body.replace(/<[bB]>/g,"<h3>");
	body=body.replace(/<\/[bB]>/g,"</h3>");

	body=body.replace(/<\/font>/g,"");
	body=body.replace(/<\/td>/g,"");
	body=convertEntity(body);

	var pcount=0;
	body=body.replace(/\n?<br>/g,function(){
		pcount++;
		var r='\n<_ id="'+bookid+'-'+chapterid+'-'+pcount+'"/>';
		return r;
	});


	//unicode entity
	body=body.replace(/&#(\d+);/g,function(m,m1){
		return String.fromCharCode(parseInt(m1));
	});



	//changjie code

	body=body.replace(/<img src=\/mpf\/.\/(.{1,6})\.(...).*?>/g,function(m,m1,m2){ //BMP might be bmp
		var cj=m1.toLowerCase();
		if (!cjcode[cj]) {
			cjcode[cj]=0;
			cjurl[cj]=m.substr(9);
		}
		cjcode[cj]++;
		
		return "[cj_"+m1.toLowerCase()+"]";
	})
	return body;
}
var processfile=function(fn) {
	var arr=fs.readFileSync(fn,"utf8").split("\n");

	var bc=bkchapter(fn);
	if (lastbkid!=bc.bkid && lastbkid) {
		writeBook(lastbkid);
	}

	var chapternameoffset=25; 
	
	//title has two line 7\1.html, chapter name at next line
	if (arr[chapternameoffset].indexOf("  <tr> ")>-1) chapternameoffset++; 


	var chapter=arr[chapternameoffset].match(pat);
	if (!chapter) {
		console.log("error parsing chapter",bc);
		throw ""
	}
	chapter=chapter[1];
	var chaptertitle=arr[chapternameoffset+1].match(pat)[1];

	var title=chaptertitle||chapter;//use title if possible

	var bkname=booklist.getbookname(bc.bkid);

	if (!title) {
		console.log("chapter ",bc.chapterid,"of book",bkname,"(",bc.bkid,")is empty");
		
	} else {
		if (!out.length) out.push('<h1 id="'+bc.bkid+'">'+bkname+'</h1>');
		out.push('<h2 n="'+bc.chapterid+'">'+convertEntity(title).replace(/<br>/,"　")+'</h2>');//title might have <br>
		var body=arr[chapternameoffset+5].substr(56);
		//console.log(body.length,out.length)
		out.push(processBody(body,bc.bkid,bc.chapterid));
	}

	lastbkid=bc.bkid;

}

var dumpcjcode=function(){
	var out=[];
	for (var cj in cjcode) {
		out.push([cj,cjcode[cj],cjurl[cj]]);
	}
	out.sort(function(a,b){return b[1]-a[1]});
	fs.writeFileSync("cjcode.json",out.join("\n"));
}
var dumpentities=function(){
	var out=[];
	for (var cj in entities) {
		out.push([cj,entities[cj]]);
	}
	out.sort(function(a,b){return b[1]-a[1]});
	fs.writeFileSync("entities.json",out.join("\n"));	
}


var processfiles=function(files){
	sortfiles(files).map(processfile);
	writeBook(lastbkid);
	fs.writeFileSync("openlit.lst",filelist.join("\n"),"utf8");
	dumpcjcode();
	dumpentities();
}

var allbooklist=require("./booklist.json").map(function(item){return item[0]});//全部書
var allbooklist=require("./book_history"); //歷史演義

var allfiles=[];
allbooklist.map(function(folder){
	var files=glob.sync("raw/"+folder+"/*.html");
	allfiles=allfiles.concat(files);
});
processfiles(allfiles);
