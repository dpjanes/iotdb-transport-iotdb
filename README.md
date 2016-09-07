# iotdb-transport-iotdb
[IOTDB](https://github.com/dpjanes/node-iotdb) 
[Transporter](https://github.com/dpjanes/node-iotdb/blob/master/docs/transporters.md)
for IOTDB (!)

<img src="https://raw.githubusercontent.com/dpjanes/iotdb-homestar/master/docs/HomeStar.png" align="right" />

# About

Transporters are all about connecting to other Transporters, e.g. so 
we can make an API to all our Things. 
So this is kinda the "root" Transporter that actually talks to the Things
using IOTDB, and you'll often be connecting other Transporters to this.

See the samples folder for working examples

* [Read more about Transporters](https://github.com/dpjanes/node-iotdb/blob/master/docs/transporters.md)

# Use
## Basic

Don't forget your `subscribe`s! Most Transporter methods 
return RX Observables.

Note that the path to the `prefix` will be created.

    const iotdb = require("iotdb");
    const iotdb_transport = require("iotdb-transport-iotdb");
    const iotdb_transporter = iotdb_transport.make({{});

    iotdb_transport
        .all({})
        .subscribe(
            thingd => { /* all the bands of the thing in thingd */ }
        );

## Specific Things

By default, the Transporter will use `iotdb.connect` and
connect to everything in your environment it can find. 
Sometimes you will just want to wrap specific things.

    const iotdb = require("iotdb");
    iotdb.use("homestar-wemo")

    const things = iotdb.connect("WeMoSocket");

    const iotdb_transport = require("iotdb-transport-iotdb");
    const iotdb_transporter = iotdb_transport.make({{}, things);

    // this transporter will only have WeMoSockets

