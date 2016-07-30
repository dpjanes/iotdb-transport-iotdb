/*
 *  make.js
 *
 *  David Janes
 *  IOTDB.org
 *  2016-07-27
 */

const path = require("path");

const iotdb = require("iotdb")
const _ = iotdb._;

// iotdb.use("homestar-wemo")
// iotdb.connect("WeMoSocket")

iotdb.use("homestar-feed")
iotdb.connect("USGSEarthquake")

const things = iotdb.things();

const transporter = require("../transporter");
const transport = transporter.make({}, things);

const on_one = (done) => {
    let once = false;
    const _done = (error) => {
        if (once) {
            return;
        }

        once = true;
        if (error) {
            console.log("#", "make.on_one", _.error.message(error));
        }

        done(error);
    };

    if (!things.empty()) {
        return _done();
    }

    things.on("thing", () => {
        return _done();
    });

    setTimeout(() => _done(new Error("timed out")), 10 * 1000);
};

const quit = () => {
    setTimeout(process.exit, 1 * 1000);
};

exports.transport = transport;
exports.on_one = on_one;
exports.quit = quit;
