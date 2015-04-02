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

var Transport = require('../FSTransport').FSTransport;

var p = new Transport({
});
p.list(function(id) {
    console.log(id);
});
