/**
* @author Supal Dubey
* http://roadtobe.com/supaldubey/
**/

function dispatch(handler, pathname, req) {
   console.log("About to dispatch a request for " + pathname);
   var content = "Hey "+pathname;
  if (typeof handler[pathname] === 'function') {
    content += handler[pathname](req);
  } else {
    console.log("No request handler found for " + pathname);
  }

  return content;
}

exports.dispatch = dispatch;