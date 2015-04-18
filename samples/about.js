/*
 *  about.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-04-16
 *
 *  Make sure to see README first
 */

var iotdb = require('iotdb');
var iot = iotdb.iot();
var things = iot.connect();

var Transport = require('../IOTDBTransport').IOTDBTransport;

var transport = new Transport({}, things);
transport.added(function(d) {
    transport.about(d, function(ad) {
        console.log("+", ad);
        process.exit(0)
    });
});
