/*
http://stackoverflow.com/questions/19557325/big5-to-utf-8-encoding-while-scraping-website-with-node-request
*/
var iconv=require("iconv-lite");
var fs=require("fs");
var request=require("request");

var targetfolder="raw/";

var baseurl="http://open-lit.com/bookindex.php?gbid="

var chapterurl=function(bkid,chapterid){
	return "http://open-lit.com/showlit.php?gbid="+bkid+"&cid="+chapterid;
}
//var gbidtoget=[6,140,231]; //see booklist.js
//"紅樓夢" ,二十年目睹之怪現狀,文明小史
var gbidtoget=[10,92,12,14,19];

var getchaptercount=function(bkid,cb) {
	request({url:baseurl+bkid,encoding:null}, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    var str = iconv.decode(new Buffer(body), "big5");
		var i=str.indexOf("總章回 ");
		if (i>-1) {
			cb(parseInt(str.substr(i+4)));
		}
	  }
	})
}

var getchapter=function(bkid,chapter,total) {

	var url=chapterurl(bkid,chapter);
	request({url:url,encoding:null}, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	  	console.log("return from ",url)
	    var str = iconv.decode(new Buffer(body), "big5");
	    fs.writeFileSync(targetfolder+bkid+"-"+chapter+".html",str,"utf8");
	    chapter++;
	    if (chapter<=total) getchapter(bkid,chapter,total);
	  }
	});	
}

var getbook=function(bkid) {
	getchaptercount(bkid,function(n){
		getchapter(bkid,1,n);
	});
}
gbidtoget.map(getbook);
