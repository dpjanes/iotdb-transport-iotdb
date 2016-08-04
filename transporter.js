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
const Rx = require('rx');

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

    const _things = things || iotdb.things();
    assert(_.is.ThingSet(_things), "things must be a thing_set, not " + typeof things);

    self.rx.list = (observer, d) => {
        _things.forEach(thing => {
            d = _.d.clone.shallow(d);
            d.id = thing.thing_id();

            observer.onNext(d);
        });

        observer.onCompleted();
    };

    self.rx.put = (observer, d) => {
        const thing = _things.find(thing => thing.thing_id() === d.id);
        if (!thing) {
            return observer.onError(new errors.NotFound("thing not found: " + d.id))
        }

        const band = thing.band(d.band);
        if (!band) {
            return observer.onError(new errors.NotFound("band not found: " + d.band))
        }

        band.update(d.value, {
            replace: true,
        });

        d = _.d.clone.shallow(d);
        observer.onNext(d);

        observer.onCompleted();
    };
    
    self.rx.get = (observer, d) => {
        const thing = _things.find(thing => thing.thing_id() === d.id);
        if (!thing) {
            return observer.onError(new errors.NotFound("thing not found: " + d.id))
        }

        const band = thing.band(d.band);
        if (!band) {
            return observer.onError(new errors.NotFound("band not found: " + d.band))
        }

        d = _.d.clone.shallow(d);
        d.value = band.state();
        observer.onNext(d);

        observer.onCompleted();
    };
    
    self.rx.bands = (observer, d) => {
        const thing = _things.find(thing => thing.thing_id() === d.id);
        if (!thing) {
            return observer.onError(new errors.NotFound("thing not found: " + d.id))
        }

        thing   
            .bands()
            .sort()
            .forEach(band => {
                d = _.d.clone.shallow(d);
                d.band = band;

                observer.onNext(d);
            });

        observer.onCompleted();
    };

    self.rx.updated = (observer, d) => {
        [ "istate", "ostate", "meta", "model", "connection", ]
            .filter(band => !d.band || (d.band === band))
            .forEach(band => {
                Rx.Observable.fromEvent(_things, band)
                    .filter(thing => !d.id || (d.id === thing.thing_id()))
                    .forEach(thing => {
                        d = _.d.clone.shallow(d);
                        d.id = thing.thing_id();
                        d.band = band;
                        d.value = thing.state(band);

                        observer.onNext(d);
                    });
            });
    };

    return self;
};

/**
 *  API
 */
exports.make = make;
