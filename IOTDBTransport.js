/*
 *  IOTDBTransport.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-04-01
 *
 *  Copyright [2013-2015] [David P. Janes]
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

"use strict";

var iotdb = require('iotdb');
var _ = iotdb._;
var bunyan = iotdb.bunyan;

var path = require('path');

var util = require('util');
var url = require('url');

var logger = bunyan.createLogger({
    name: 'iotdb-transport-iotdb',
    module: 'IOTDBTransport',
});

/**
 *  Create a transport for IOTDB.
 */
var IOTDBTransport = function (initd) {
    var self = this;

    self.initd = _.defaults(
        initd,
        iotdb.keystore().get("/transports/IOTDBTransport/initd"),
        {
        }
    );

    if (!initd.things) {
        throw new Error("initd.things is required");
    }
    if (_.isThingArray(initd.things)) {
        throw new Error("initd.things must be a ThingArray");
    }
    
    self.native = initd.things
};

/**
 *  List all the IDs associated with this Transport.
 *
 *  The callback is called with a list of IDs
 *  and then null when there are no further values.
 *
 *  Note that this may not be memory efficient due
 *  to the way "value" works. This could be revisited
 *  in the future.
 */
IOTDBTransport.prototype.list = function(paramd, callback) {
    var self = this;

    if (arguments.length === 1) {
        paramd = {};
        callback = arguments[0];
    }

    for (var i = 0; i < self.native.length; i++) {
        var thing = self.native[i];
        callback([ thing.thing_id() ]);
    }

    callback(null);
};

/**
 */
IOTDBTransport.prototype.get = function(id, band, callback) {
    var self = this;

    if (!id) {
        throw new Error("id is required");
    }
    if (!band) {
        throw new Error("band is required");
    }

    var thing = self._thing_by_id(id);
    if (!thing) {
        return callback(id, band, null); 
    }
    
    return callback(id, band, self._get_thing_band(thing, band));
};

/**
 */
IOTDBTransport.prototype.update = function(id, band, value) {
    var self = this;

    if (!id) {
        throw new Error("id is required");
    }
    if (!band) {
        throw new Error("band is required");
    }

    var channel = self._channel(id, band, { mkdirs: true });
    var d = _pack(value);

    // do something
};

/**
 *  Probably could be made a hell of a lot more efficient
 */
IOTDBTransport.prototype.updated = function(id, band, callback) {
    var self = this;

    if (arguments.length === 1) {
        id = null;
        band = null;
        callback = arguments[0];
    } else if (arguments.length === 2) {
        band = null;
        callback = arguments[1];
    }

    var _monitor_band = function(_band) {
        if ((band === "istate") || (band === "ostate") || (band === "meta")) {
            self.native.on(band, function(thing) {
                if (id && (thing.thing_id() !== id)) {
                    return;
                }

                callback(thing.thing_id(), band, self._thing_get_band(thing, band));
            });
        } else if (band === "model") {
        } else {
            return null;
        }
    };

    if (band) {
        _monitor_band(band);
    } else {
        var bands = [ "istate", "ostate", "meta", "model" ];
        for (var bi in bands) {
            _monitor_band(bands[bi]);
        };
    }
};

/**
 */
IOTDBTransport.prototype.remove = function(id, band) {
    var self = this;

    throw new Error("Not implemented");
};

/* -- internals -- */
IOTDBTransport.prototype._thing_by_id = function(id) {
    for (var i = 0; i < self.native.length; i++) {
        var thing = self.native[i];
        if (thing.thing_id() === id) {
            return thing;
        }
    }

    return null;
};

IOTDBTransport.prototype._get_thing_band = function(thing, band) {
    if (band === "istate") {
        return thing.state({ istate: true, ostate: false });
    } else if (band === "ostate") {
        return thing.state({ istate: false, ostate: true });
    } else if (band === "model") {
        return _.ld.compact(thing.jsonld());
    } else if (band === "meta") {
        return _.ld.compact(thing.meta().state());
    } else {
        return null;
    }
};

/**
 *  API
 */
exports.IOTDBTransport = IOTDBTransport;
