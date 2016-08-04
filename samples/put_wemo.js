/*
 *  put_wemo.js
 *
 *  David Janes
 *  IOTDB.org
 *  2016-08-04
 */

const testers = require("iotdb-transport").testers;

const iotdb = require("iotdb")
const _ = iotdb._;

iotdb.use("homestar-wemo")
const things = iotdb.connect("WeMoSocket")

const transporter = require("../transporter");
const transport = transporter.make({}, things);

things.on("thing", (thing) => {
    let count = 0;

    setInterval(() => {
        const source = transport.put({
            id: thing.thing_id(),
            band: "ostate",
            value: {
                on: count++ % 2
            },
        });
        source.subscribe(...testers.log_value("put"));
    }, 1500);
});
