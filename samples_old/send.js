/*
 *  send.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-04-01
 *
 *  Demonstrate sending something
 *  Make sure to see README first
 */

var Transport = require('../IOTDBTransport').IOTDBTransport;

var p = new Transport({
});

var _update = function() {
    var now = (new Date()).toISOString();
    console.log("+ sent update", now);
    p.update("MyThingID", "meta", {
        first: "David",
        last: "Janes",
        now: now,
    });
};

setInterval(_update, 10 * 1000);
_update();
