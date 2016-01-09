var iconv=require("iconv-lite");
var fs=require("fs");
var request=require("request");

var url="http://www.open-lit.com/list.php";
var pat=/<a href=bookindex.php\?gbid=(.*?)>(.*?)</g;
	
var convertEntity=function(t){
	return t.replace(/&#(\d+);/g,function(m,m1){
		var u=parseInt(m1);
		if (u==28057)return "淚";
		return String.fromCharCode(u);
	});
}
request({url:url,encoding:null}, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	  	console.log("return from ",url)
	    var str = iconv.decode(new Buffer(body), "big5");
	    //fs.writeFileSync("booklist.html",str,"utf8");
	    console.log("converting booklist");
	    var out=[];
	    str.replace(pat,function(m,m1,m2){
	    	out.push([m1,convertEntity(m2)]);
	    })
	    fs.writeFileSync('booklist.json',JSON.stringify(out,'',' '),'utf8');
	    console.log("done, total",out.length,"books")
	  }
});
