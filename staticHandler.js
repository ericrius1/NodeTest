/**
* @author Supal Dubey
* http://roadtobe.com/supaldubey/
**/

var path = require('path'),
    fs = require('fs');
	
function handleStatic(pageUrl, response)
{
	var filename = path.join(process.cwd(), pageUrl);
	path.exists(filename, function(exists) {
		if(!exists) {
			console.log("not exists: " + filename);
			response.writeHead(404, {'Content-Type': 'text/html'});
			response.write('404 Not Found\n');
			response.end();
			return;
		}
		//Do not send Content type, browser will pick it up.
		response.writeHead(200);

		var fileStream = fs.createReadStream(filename);
		fileStream.on('end', function() {
			response.end();
		});

		fileStream.pipe(response);
		return;
	}); 		
}
exports.handleStatic = handleStatic;		