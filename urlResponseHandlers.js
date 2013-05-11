/**
* @author Supal Dubey
* http://roadtobe.com/supaldubey/
**/

var url = require("url");

function fetch(req) {
	console.log("Request handler 'fetch' was called.");
	return read(req);
}

function save(req) {
	console.log("Request handler 'Save' was called.");
	return read(req);
}

exports.fetch = fetch;
exports.save = save;


function read(req)
{
	var content = "";
	var _url = url.parse(req.url, true);
	var pathname = _url.pathname;
	console.log("Request for " + pathname + " received.");
	if(_url.query)
	{
	content += "<br><br>Ohh! You have also provided me below data - <ul>";
	for(i in _url.query)
	{
	content += "<li>" + i + " = " + _url.query[i]  +"</li>";
	}
	content += "</ul>";
	}
	return content;
}