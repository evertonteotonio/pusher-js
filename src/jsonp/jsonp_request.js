var Util = require('../util');
var ScriptRequest = require('../dom/script_request');
var Base64 = require('../base64');

/** Sends data via JSONP.
 *
 * Data is a key-value map. Its values are JSON-encoded and then passed
 * through base64. Finally, keys and encoded values are appended to the query
 * string.
 *
 * The class itself does not guarantee raising errors on failures, as it's not
 * possible to support such feature on all browsers. Instead, JSONP endpoint
 * should call back in a way that's easy to distinguish from browser calls,
 * for example by passing a second argument to the receiver.
 *
 * @param {String} url
 * @param {Object} data key-value map of data to be submitted
 */
function JSONPRequest(url, data) {
  this.url = url;
  this.data = data;
}
var prototype = JSONPRequest.prototype;

/** Sends the actual JSONP request.
 *
 * @param {ScriptReceiver} receiver
 */
prototype.send = function(receiver) {
  if (this.request) {
    return;
  }

  var params = Util.filterObject(this.data, function(value) {
    return value !== undefined;
  });
  var query = Util.map(
    Util.flatten(encodeParamsObject(params)),
    Util.method("join", "=")
  ).join("&");
  var url = this.url + "/" + receiver.number + "?" + query;

  this.request = new ScriptRequest(url);
  this.request.send(receiver);
};

/** Cleans up the DOM remains of the JSONP request. */
prototype.cleanup = function() {
  if (this.request) {
    this.request.cleanup();
  }
};

function encodeParamsObject(data) {
  return Util.mapObject(data, function(value) {
    if (typeof value === "object") {
      value = JSON.stringify(value);
    }
    return encodeURIComponent(Base64.encode(value.toString()));
  });
}

module.exports = JSONPRequest;
