/*
	<_ id="322">\n<h1 id="322">清稗類鈔</h1>\n<h2 n="1">時令類</h2>',

convert to 

[ '<_ id="322"/>\n<h1 id="322">清稗類鈔</h1>\n',
  '<_ id="322-1"><h2 n="1">時令類</h2>\n　　<h3>太宗用大統法以推時憲</h3>

*/

var createPreprocessor=function(files,config){
	console.log("Custom preprocessor for openlit, break into smaller files by h2");

	var glob = require("glob");
	var fs=require("fs");
	var now=0,now2=0;
	var smallfiles=[];

	var breakfile=function(content) {
		var lastidx=0,t="",filename;
		var out=[],bookid="",smallfilecount=0;
		

		content.replace(/<h2/g,function(m,idx){
			t=content.substring(lastidx,idx);
			if (lastidx==0) {
				t=t.replace(/<_ id="(\d+)">/,function(m,m1){
					bookid=m1;
					return '<_ id="'+m1+'"\/>';
				});
			};
			if (smallfilecount) out.push('<_ id="'+bookid+'-'+smallfilecount+'">'+t);
			else out.push(t);
			smallfilecount++;
			lastidx=idx;
		});
		var last=content.substr(lastidx);
		last=last.substr(0,last.length-4);
		out.push('<_ id="'+bookid+'-'+smallfilecount+'">'+last);
		return out;
	}
	var nextfile=function() {
			if (now===files.length) {
				return [];
			}
			filename=files[now];
			now++;
			now2=0;
			var content=fs.readFileSync(filename,config.inputEncoding).replace(/\r\n/g,"\n");
			if (content.charCodeAt(0)==0xfeff) {//remove BOM
				content=content.substring(1);
			}
			var idx=0;
			return breakfile(content);
	}

	var next=function(opts,cb) {
		if (!smallfiles.length || now2==smallfiles.length) {
			smallfiles=nextfile();
		}

		if (!smallfiles.length) {
			cb(0,null);
			return;
		}
		var sfn=filename.substr(4);
		sfn=sfn.substr(0,sfn.length-4)+"@"+now2;
		if (!smallfiles[now2]) {
			console.log(now2)
			throw "empty"
		}
		cb(0,{filename:sfn,content:smallfiles[now2],progress:(now+1)/files.length});
		now2++;
	}

	return next;
}

module.exports=createPreprocessor;