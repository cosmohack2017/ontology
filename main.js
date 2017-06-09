'use strict';

const fs = require('fs');
const Database = require('./database');

const database = new Database();

database.connect({
    endpoint: 'http://localhost:5820',
    auth: {
        user: 'admin',
        pass: '9324w1d53'
    }
}, (err) => {
    if (err) {
        throw err;
    }

    fs.readFile('./ontologies/foaf.rdf', (err, data) => {
        if (err) {
            throw err;
        }

        database.addRdfData({
            database: 'testdb',
            graph: 'urn:graph',
            data: data
        }, (err) => {
            if (err) {
                throw err;
            }
        });
    });
});
