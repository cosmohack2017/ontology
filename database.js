'use strict';

const _ = require('lodash');

module.exports = class Database {
    connect(options, callback) {
        if (this._connected) {
            return callback(new Error('Error trying to open unclosed connection'));
        }

        this._endpoint = options.endpoint;

        this._options = {
            headers: {
                connection: 'close'
            },
            qsStringifyOptions: {
                arrayFormat: 'repeat'
            }
        };

        if (options.auth) {
            this._options.auth = options.auth;
        }

        this._connected = true;
        callback();
    }
};
