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

    addRdfData(options, callback) {
        this._addOrDeleteFileData(options, callback);
    }

    _request(url, options, callback) {
        _.defaultsDeep(options, this._options);
        options.url = this._endpoint + url;

        if (options.contentType) {
            options.headers['content-type'] = options.contentType;
        }

        options.accept = options.accept || '*/*';

        _.defaults(options.headers, {
            accept: options.accept
        });

        request(options, (err, resp, data) => {
            if (err) {
                return callback(err);
            }

            if (!/^2\d\d$/.test(resp.statusCode)) {
                if (data.length) {
                    return callback(new Error(data));
                }
                return callback(new Error(resp.statusCode + ' ' + resp.statusMessage));
            }

            if (!data || !data.length) {
                return callback();
            }

            const contentType = resp.headers['content-type'];

            if (contentType) {
                if ((contentType.includes('application/sparql-results+json')) ||
                    (contentType.includes('application/json'))) {

                    return jsonParse(data, callback);
                }
                else if (contentType === 'text/boolean') {
                    return callback(null, (data === 'true'));
                }
            }
            callback(null, data);
        });

        function jsonParse(json, callback) {
            try {
                json = JSON.parse(json);
            } catch (err) {
                return callback(err);
            }
            callback(null, json);
        }
    }

    _post(url, options, callback) {
        this._request(url, Object.assign({}, options, {
            method: 'POST',
            [options.type]: options.data
        }), callback);
    }

    _trAddFileData(options, callback) {
        options.contentType = options.contentType || 'application/rdf+xml';

        this._post(`/${options.database}/${options.tid}/add?graph-uri=${options.graph}`, Object.assign({}, options, {
            type: 'body'
        }), callback);
    }

    _trDeleteFileData(options, callback) {
        options.contentType = options.contentType || 'application/rdf+xml';

        this._post(`/${options.database}/${options.tid}/remove?graph-uri=${options.graph}`, Object.assign({}, options, {
            type: 'body'
        }), callback);
    }

    _addOrDeleteFileData(options, callback) {
        this.trBegin(options, (err, tid) => {
            if (err) {
                return callback(err);
            }

            const addOrDeleteFileData = options.delete ?
                this._trDeleteFileData : this._trAddFileData;

            addOrDeleteFileData.call(this, Object.assign({}, options, {
                tid: tid
            }), (err) => {
                if (err) {
                    return this.trRollback(Object.assign({}, options, {
                        tid: tid
                    }), (err2) => {
                        callback(err2 || err);
                    });
                }

                this.trCommit(Object.assign({}, options, {
                    tid: tid
                }), callback);
            });
        });
    }
};
