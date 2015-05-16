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

/* --- constructor --- */
/**
 *  Create a Transporter for IOTDB Things.
 *  <p>
 *  Bands for IOTDB are inherenly "istate", "ostate", "model", "meta".
 *  <p>
 *  See {iotdb.transporter.Transport#Transport} for documentation.
 *
 *  @constructor
 */
var IOTDBTransport = function (initd, things) {
    var self = this;

    if (arguments.length === 1) {
        initd = {};
        things = arguments[0];
    }

    self.initd = _.defaults(
        initd,
        iotdb.keystore().get("/transports/IOTDBTransport/initd"), {}
    );

    if (!_.is.ThingArray(things)) {
        throw new Error("things is required and must be a ThingArray");
    }

    self.native = things;
};

IOTDBTransport.prototype = new iotdb.transporter.Transport();

/* --- methods --- */
/**
 *  See {iotdb.transporter.Transport#list} for documentation.
 */
IOTDBTransport.prototype.list = function (paramd, callback) {
    var self = this;

    if (arguments.length === 1) {
        paramd = {};
        callback = arguments[0];
    }

    self._validate_list(paramd, callback);

    for (var i = 0; i < self.native.length; i++) {
        var thing = self.native[i];
        if (callback({
                id: thing.thing_id(),
            })) {
            break;
        }
    }

    callback({
        end: true,
    });
};

/**
 *  See {iotdb.transporter.Transport#added} for documentation.
 */
IOTDBTransport.prototype.added = function (paramd, callback) {
    var self = this;

    if (arguments.length === 1) {
        paramd = {};
        callback = arguments[0];
    }

    self._validate_added(paramd, callback);

    self.native.on("thing", function (thing) {
        callback({
            id: thing.thing_id(),
        });
    });
};

/**
 *  See {iotdb.transporter.Transport#about} for documentation.
 */
IOTDBTransport.prototype.about = function (paramd, callback) {
    var self = this;

    self._validate_about(paramd, callback);

    var thing = self._thing_by_id(paramd.id);
    if (!thing) {
        return callback({
            id: paramd.id,
        });
    }

    return callback({
        id: paramd.id,
        bands: ["istate", "ostate", "model", "meta", ],
    });
};
/**
 *  See {iotdb.transporter.Transport#get} for documentation.
 */
IOTDBTransport.prototype.get = function (paramd, callback) {
    var self = this;

    self._validate_get(paramd, callback);

    var thing = self._thing_by_id(paramd.id);
    if (!thing) {
        return callback({
            id: paramd.id,
            band: paramd.band,
            value: null,
        });
    }

    return callback({
        id: paramd.id,
        band: paramd.band,
        value: thing.state(paramd.band),
    });
};

/**
 *  See {iotdb.transporter.Transport#update} for documentation.
 *  <p>
 *  NOT FINISHED
 */
IOTDBTransport.prototype.update = function (paramd, callback) {
    var self = this;

    self._validate_update(paramd, callback);

    // XXX: at some point in the future we should be able to add new Things
    var thing = self._thing_by_id(paramd.id);
    if (!thing) {
        logger.error({
            method: "update",
            cause: "hard to say - may not be important",
            thing_id: paramd.id,
        }, "Thing not found");
        return;
    }

    thing.update(paramd.band, paramd.value);
};

/**
 *  See {iotdb.transporter.Transport#updated} for documentation.
 */
IOTDBTransport.prototype.updated = function (paramd, callback) {
    var self = this;

    if (arguments.length === 1) {
        paramd = {};
        callback = arguments[0];
    }

    self._validate_updated(paramd, callback);

    var _monitor_band = function (_band) {
        if ((_band === "istate") || (_band === "ostate") || (_band === "meta")) {
            self.native.on(_band, function (thing) {
                if (paramd.id && (thing.thing_id() !== paramd.id)) {
                    return;
                }

                callback({
                    id: thing.thing_id(),
                    band: _band,
                    value: thing.state(_band),
                });
            });
        } else if (_band === "model") {} else {}
    };

    if (paramd.band) {
        _monitor_band(paramd.band);
    } else {
        var bands = ["istate", "ostate", "meta", "model"];
        for (var bi in bands) {
            _monitor_band(bands[bi]);
        }
    }
};

/* -- internals -- */
IOTDBTransport.prototype._thing_by_id = function (id) {
    var self = this;

    for (var i = 0; i < self.native.length; i++) {
        var thing = self.native[i];
        if (thing.thing_id() === id) {
            return thing;
        }
    }

    return null;
};

/**
 *  API
 */
exports.IOTDBTransport = IOTDBTransport;
