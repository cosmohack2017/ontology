'use strict';

const _ = require('lodash');
const request = require('request');

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

    trBegin(options, callback) {
        this._post(`/${options.database}/transaction/begin`, {
            type: 'form',
            auth: options.auth
        }, callback);
    }

    trCommit(options, callback) {
        this._post(`/${options.database}/transaction/commit/` + options.tid, {
            type: 'form',
            auth: options.auth
        }, callback);
    }

    trRollback(options, callback) {
        this._post(`/${options.database}/transaction/rollback/` + options.tid, {
            type: 'form',
            auth: options.auth
        }, callback);
    }
};
