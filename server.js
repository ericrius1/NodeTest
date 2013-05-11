/**
* @author Supal Dubey
* http://roadtobe.com/supaldubey/
**/

var http = require('http'),
    url = require('url'),
	staticHandler = require('./staticHandler');
	
function start(router, handlers)
{
	http.createServer(function(req, res) {
		var _url = url.parse(req.url).pathname;
		
		if(_url.indexOf('/static/') != -1)
		{
			staticHandler.handleStatic(_url, res);
			return;
		}
		else
		{
			var content = router(handlers, _url, req);
			res.writeHead(200, {"Content-Type": "text/html"});
			res.write(content);
			res.end();
			
		}
	}).listen(8888);
	
	console.log("Server started !! ");

}

exports.start = start;