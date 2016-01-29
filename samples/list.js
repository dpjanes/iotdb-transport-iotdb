/*
 *  list.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-04-01
 *
 *  Make sure to see README first
 *
 *  Hint:
 *  node list | grep '^+'
 */

var iotdb = require('iotdb');
var iot = iotdb.iot();
var things = iot.connect();

var Transport = require('../IOTDBTransport').IOTDBTransport;

var transport = new Transport({}, things);
transport.list({}, function(error, ld) {
    if (error) {
        console.log("#", "error", error);
        return;
    }
    if (!ld) {
        console.log("+", "<end>");
        break;
    }

    console.log("+", ld.id);
});
transport.added({}, function(error, ad) {
    console.log("+", ad.id);
});
