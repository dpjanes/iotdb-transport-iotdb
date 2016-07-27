/*
 *  transporter.js
 *
 *  David Janes
 *  IOTDB.org
 *  2016-07-27
 *
 *  Copyright [2013-2016] [David P. Janes]
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

const iotdb = require('iotdb');
const _ = iotdb._;
const iotdb_transport = require('iotdb-transport');
const errors = require('iotdb-errors');

const assert = require('assert');

const logger = iotdb.logger({
    name: 'iotdb-transport-memory',
    module: 'transporter',
});

const global_bddd = {};
const subjectd = new Map();

const make = (initd, things) => {
    const self = iotdb_transport.make();

    const _initd = _.d.compose.shallow(
        initd, {
        },
        iotdb.keystore().get("/transports/IOTDBTransport/initd"), {
            prefix: ""
        }
    );

    const _things = things;
    assert(_.is.ThingSet(_things), "things must be a thing_set");

    self.rx.list = (observer, d) => {
    };

    self.rx.put = (observer, d) => {
    };
    
    self.rx.get = (observer, d) => {
    };
    
    self.rx.bands = (observer, d) => {
    };

    self.rx.updated = (observer, d) => {
    };

    return self;
};

/**
 *  API
 */
exports.make = make;
