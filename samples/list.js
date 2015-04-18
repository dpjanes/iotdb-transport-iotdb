/*
 *  list.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-04-01
 *
 *  Demonstrate receiving
 *  Make sure to see README first
 */

var iotdb = require('iotdb');
var iot = iotdb.iot();
var things = iot.connect();

var Transport = require('../IOTDBTransport').IOTDBTransport;

var transport = new Transport({}, things);
transport.list(function(d) {
    if (!d) {
        return;
    }
    console.log("+", d.id);
});
transport.added(function(d) {
    if (!d) {
        return;
    }
    console.log("+", d.id);
});
