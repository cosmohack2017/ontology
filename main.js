'use strict';

const Database = require('./database');
const fs = require('fs');

const database = new Database();

const db = 'testdb';

database.connect({
    endpoint: 'http://localhost:5820',
    auth: {
        user: 'admin',
        pass: 'admin'
    }
}, (err) => {
    if (err) {
        throw err;
    }

    fs.readFile('./ontologies/wine.rdf', (err, data) => {
        if (err) {
            throw err;
        }

        database.addRdfData({
            database: db,
            graph: 'urn:graph1',
            data: data
        }, (err) => {
            if (err) {
                throw err;
            }

            fs.readFile('./ontologies/foaf.rdf', (err, data) => {
                if (err) {
                    throw err;
                }

                database.addRdfData({
                    database: db,
                    graph: 'urn:graph2',
                    data: data
                }, (err) => {
                    if (err) {
                        throw err;
                    }
                });
            });
        });
    });
});
