/*
 *  receive.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-04-01
 *
 *  Demonstrate receiving
 *  Make sure to see README first
 */

var Transport = require('../IOTDBTransport').IOTDBTransport;

var p = new Transport({
});
p.get("MyThingID", "meta", function(id, band, value) {
    console.log("+", "get", id, band, value);
});
p.updated(function(id, band, value) {
    if (value === undefined) {
        p.get(id, band, function(_id, _band, value) {
            console.log("+", id, band, value);
        });
    } else {
        console.log("+", id, band, value);
    }
});
