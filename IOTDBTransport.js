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
var iotdb_transport = require('iotdb-transport');
const errors = require('iotdb-errors');
var _ = iotdb._;

var path = require('path');

var util = require('util');
var url = require('url');

var logger = iotdb.logger({
    name: 'iotdb-transport-iotdb',
    module: 'IOTDBTransport',
});

/* --- constructor --- */
/**
 *  Create a Transporter for IOTDB Things.
 *  <p>
 *  Bands for IOTDB are inherenly "istate", "ostate", "model", "meta".
 *  <p>
 *  See {iotdb_transport.Transport#Transport} for documentation.
 *
 *  @constructor
 */
var IOTDBTransport = function (initd, things) {
    var self = this;

    self.initd = _.defaults(
        initd, {
            authorize: function (authd, callback) {
                return callback(null, true);
            },
            user: null,
        },
        iotdb.keystore().get("/transports/IOTDBTransport/initd"), {}
    );

    if (!_.is.ThingArray(things)) {
        throw new Error("things is required and must be a ThingArray");
    }

    self.native = things;
};

IOTDBTransport.prototype = new iotdb_transport.Transport();
IOTDBTransport.prototype._class = "IOTDBTransport";

/* --- methods --- */
/**
 *  See {iotdb_transport.Transport#list} for documentation.
 */
IOTDBTransport.prototype.list = function (paramd, callback) {
    var self = this;
    var ld;

    self._validate_list(paramd, callback);

    var count = self.native.length;
    if (count === 0) {
        return callback(null, null);
    }

    var _authorize = function (thing) {
        var _after_authorize = function (_error, is_authorized) {
            if (count === 0) {
                return;
            }

            if (is_authorized) {
                ld = _.d.clone.shallow(paramd);
                ld.id = thing.thing_id();

                var r = callback(null, ld);
                if (!r) {
                    count--;
                } else {
                    count = 0;
                }

                if (count === 0) {
                    return callback(null, null);
                }
            } else {
                count = 0;

                ld = _.d.clone.shallow(paramd);
                return callback(new errors.NotAuthorized(), ld);
            }
        };

        var authd = {
            id: thing.thing_id(),
            authorize: "read",
            user: paramd.user,
        };
        self.initd.authorize(authd, _after_authorize);
    };

    for (var i = 0; i < self.native.length; i++) {
        _authorize(self.native[i]);
    }
};

/**
 *  See {iotdb_transport.Transport#added} for documentation.
 */
IOTDBTransport.prototype.added = function (paramd, callback) {
    var self = this;

    self._validate_added(paramd, callback);

    self.native.on("thing", function (thing) {
        var authd = {
            id: thing.thing_id(),
            authorize: "read",
            user: paramd.user,
        };
        self.initd.authorize(authd, function (error, is_authorized) {
            if (!is_authorized) {
                return;
            }

            var callbackd = {
                id: thing.thing_id(),
                user: self.initd.user,
            };
            return callback(null, callbackd);
        });
    });
};

/**
 *  See {iotdb_transport.Transport#bands} for documentation.
 */
IOTDBTransport.prototype.bands = function (paramd, callback) {
    var self = this;

    self._validate_bands(paramd, callback);

    var bd = _.d.clone.shallow(paramd);
    bd.bandd = {};

    var thing = self._thing_by_id(paramd.id);
    if (!thing) {
        return callback(new errors.NotFound(), bd);
    }

    var authd = {
        id: paramd.id,
        authorize: "read",
        user: paramd.user,
    };
    self.initd.authorize(authd, function (error, is_authorized) {
        if (!is_authorized) {
            return callback(new errors.NotAuthorized(), bd);
        }

        bd.bandd = {
            "istate": null,
            "ostate": null,
            "model": null,
            "meta": null,
            "connection": null,
        };

        var model_iri = thing.model_first("iot:model", null);
        if (model_iri) {
            bd.bandd["model"] = model_iri;
        }

        return callback(null, bd);
    });
};
/**
 *  See {iotdb_transport.Transport#get} for documentation.
 */
IOTDBTransport.prototype.get = function (paramd, callback) {
    var self = this;

    self._validate_get(paramd, callback);

    var thing = self._thing_by_id(paramd.id);
    if (!thing) {
        return callback(new errors.NotFound(), {
            id: paramd.id,
            band: paramd.band,
            value: null,
            user: self.initd.user,
        });
    }

    var authd = {
        id: paramd.id,
        authorize: "read",
        band: paramd.band,
        user: paramd.user,
    };
    self.initd.authorize(authd, function (error, is_authorized) {
        var callbackd = {
            id: paramd.id,
            band: paramd.band,
            user: paramd.user,
            value: null,
        };

        if (!is_authorized) {
            return callback(errors.NotAuthorized(), callbackd);
        } else {
            callbackd.value = thing.state(paramd.band);
            return callback(null, callbackd);
        }

    });
};

/**
 *  See {iotdb_transport.Transport#update} for documentation.
 *  <p>
 *  NOT FINISHED
 */
IOTDBTransport.prototype.put = function (paramd, callback) {
    var self = this;

    self._validate_update(paramd, callback);

    var pd = _.d.clone.shallow(paramd);

    if (!(paramd.id.match(/^urn:iotdb:thing:/) || paramd.id.match(/^urn:iotdb:t:/))) {
        return callback(new errors.NotAppropriate(), pd);
    }

    // XXX: at some point in the future we should be able to add new Things
    var thing = self._thing_by_id(paramd.id);
    if (!thing) {
        logger.error({
            method: "update",
            cause: "hard to say - may not be important",
            thing_id: paramd.id,
        }, "Thing not found");

        return callback(new errors.NotFound(), pd);
    }

    var authd = {
        id: paramd.id,
        authorize: "write",
        band: paramd.band,
        user: paramd.user,
    };
    self.initd.authorize(authd, function (error, is_authorized) {
        if (!is_authorized) {
            return callback(new errors.NotAuthorized(), pd);
        } else {
            thing.update(paramd.band, paramd.value);
            return callback(null, pd);
        }
    });
};

/**
 *  See {iotdb_transport.Transport#updated} for documentation.
 */
IOTDBTransport.prototype.updated = function (paramd, callback) {
    var self = this;

    self._validate_updated(paramd, callback);

    /*
    if (paramd.id) {
        var authd = {
            id: paramd.id,
            authorize: "read",
            band: paramd.band,
            user: paramd.user,
        };
        if (!self.initd.authorize({
                id: paramd.id,
                authorize: "read",
                band: paramd.band,
                user: paramd.user,
            })) {
            return;
        }
    }
    */

    /*
    if (!paramd.user) {
        console.log("BAD USER", paramd);
        console.trace();
        process.exit(0);
    }
    */

    var _monitor_band = function (_band) {
        if ((_band === "istate") || (_band === "ostate") || (_band === "meta") || (_band === "connection")) {
            self.native.on(_band, function (thing) {
                if (paramd.id && (thing.thing_id() !== paramd.id)) {
                    return;
                }

                var authd = {
                    id: thing.thing_id(),
                    authorize: "read",
                    band: _band,
                    user: paramd.user,
                };
                self.initd.authorize(authd, function (error, is_authorized) {
                    if (!is_authorized) {
                        return;
                    }

                    var callbackd = {
                        id: thing.thing_id(),
                        band: _band,
                        value: thing.state(_band),
                        user: self.initd.user,
                    };
                    return callback(null, callbackd);
                });
            });
        } else if (_band === "model") {} else {}
    };

    if (paramd.band) {
        _monitor_band(paramd.band);
    } else {
        var bands = ["istate", "ostate", "meta", "model", "connection", ];
        for (var bi in bands) {
            _monitor_band(bands[bi]);
        }
    }
};

/**
 *  See {iotdb_transport.Transport#removed} for documentation.
 */
IOTDBTransport.prototype.removed = function (paramd, callback) {
    var self = this;

    self._validate_remove(paramd, callback);

    var rd = _.d.clone.shallow(paramd);
    delete rd.band;
    delete rd.value;

    callback(new errors.NeverImplemented(), rd);
}

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
