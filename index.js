/**
* @author Supal Dubey
* http://roadtobe.com/supaldubey/
**/

var server = require('./server');	
var controller = require("./controller");
var urlResponseHandlers = require("./urlResponseHandlers");

var handle = {};
  
handle["/"] = urlResponseHandlers.fetch;
handle["/fetch"] = urlResponseHandlers.fetch;
handle["/save"] = urlResponseHandlers.save;

server.start(controller.dispatch, handle);

