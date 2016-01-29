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
transport.list({}, function(d) {
    if (d.end) {
        return;
    }
    console.log("+", d.id);
});
transport.added({}, function(d) {
    console.log("+", d.id);
});
