'use strict';

const fs = require('fs');
const Database = require('./database');

const database = new Database();

database.connect({
    endpoint: 'http://localhost:5820',
    auth: {
        user: 'test',
        pass: 'test'
    }
}, (err) => {
    if (err) {
        throw err;
    }

    fs.readFile('./foaf.rdf', (err, data) => {
        if (err) {
            throw err;
        }

        database.addRdfData({
            database: 'testdb',
            graph: 'urn:gr',
            data: data
        }, (err) => {
            if (err) {
                throw err;
            }
        });
    });
});
