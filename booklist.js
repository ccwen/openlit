
var data=require("./booklist.json");

var getbookname=function(bkid) {
	var out= data.filter(function(b){return b[0]==bkid});
	if (out.length) return out[0][1];
}
var getbookid=function(bookname) {
	var out= data.filter(function(b){return b[1]==bookname});
	if (out.length) return out[0][0];
}
module.exports={allbooks:data,getbookname:getbookname,getbookid:getbookid};
