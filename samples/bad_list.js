/*
 *  bad_list.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-04-01
 *
 *  Deal with data that does not exist
 *  Expect to see just 'null'
 */

var Transport = require('../IOTDBTransport').IOTDBTransport;

var p = new Transport({
});
p.list(function(ld) {
    console.log(ld.id);
});
