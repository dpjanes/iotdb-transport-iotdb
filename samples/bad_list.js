/*
 *  bad_list.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-04-01
 *
 *  Deal with data that does not exist.
 *  This will actutally fail because of a missing argument
 */

var Transport = require('../IOTDBTransport').IOTDBTransport;

var p = new Transport({
});
p.list(function(error, ld) {
    if (error) {
        console.log("#", "error", error);
        return;
    }
    if (!ld) {
        console.log("+", "<end>");
        break;
    }

    console.log(ld.id);
});
