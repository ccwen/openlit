/*
http://stackoverflow.com/questions/19557325/big5-to-utf-8-encoding-while-scraping-website-with-node-request
*/
var iconv=require("iconv-lite");
var fs=require("fs");
var request=require("request");

var targetfolder="raw/";
var errorlog=[];
var baseurl="http://open-lit.com/bookindex.php?gbid="

var chapterurl=function(bkid,chapterid){
	return "http://open-lit.com/showlit.php?gbid="+bkid+"&cid="+chapterid;
}
//var gbidtoget=[6,140,231]; //see booklist.js
//"紅樓夢" ,二十年目睹之怪現狀,文明小史
//var gbidtoget=[10,92,12,14,19];
//var gbidtoget=[96,97,100,91,39,93,90,147]; //87 is empty
var gbidtoget=require("./booklist").allbooks.map(function(item){return item[0]});
gbidtoget=gbidtoget.slice(21); //remove top 21 books (Chu works)
var getchaptercount=function(bkid,cb) {
	request({url:baseurl+bkid,encoding:null}, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    var str = iconv.decode(new Buffer(body), "big5");
		var i=str.indexOf("總章回 ");

		if (i>-1) {
			var chaptercount=parseInt(str.substr(i+4));
			console.log("book",bkid,'has ',chaptercount,'chapter')
			cb(chaptercount);
		}
	  }
	})
}

var msg=function(t){
	process.stdout.write(t+"\033[0G");
}
var getchapter=function(bkid,chapter,total,finishcb) {
	var url=chapterurl(bkid,chapter);
	request({url:url,encoding:null}, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	  	msg("return from "+url)
	    var str = iconv.decode(new Buffer(body), "big5");
	    if (!fs.existsSync(targetfolder+bkid)) fs.mkdirSync(targetfolder+bkid);
	    str=str.replace("charset=big5","charset=utf8");
	    fs.writeFileSync(targetfolder+bkid+"/"+chapter+".html",str,"utf8");
	    chapter++;

	    if (chapter<=total) {
	    	setTimeout(function(){
	    		getchapter(bkid,chapter,total,finishcb);	
	    	},300);
	    } else {
	    	finishcb();
	    }
	  } else {
	  	var estr="error bkid:"+bkid+",chapter:"+chapter;
	  	console.log(estr)
	  	errorlog.push(estr);
	  }
	});	
}
var now=0;
var getbook=function() {
	if (now==gbidtoget.length) {
		fs.writeFileSync("errordownload.txt",errorlog.join("\n"),"utf8");
		console.log("download finished")
		return;
	}
	var bkid=gbidtoget[now];

	getchaptercount(bkid,function(n){
		getchapter(bkid,1,n,function(){
			now++;
			getbook();
		});
	});
}

getbook();