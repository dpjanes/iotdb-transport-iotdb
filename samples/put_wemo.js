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

const transporter = require("../transporter");
const transport = transporter.make({}, iotdb.connect("WeMoSocket"))

transport
    .added()
    .subscribe(ad => {
        let count = 0;

        setInterval(() => {
            const source = transport.put({
                id: ad.id,
                band: "ostate",
                value: {
                    on: count++ % 2
                },
            });
            source.subscribe(...testers.log_value("put"));
        }, 1500);
    })
