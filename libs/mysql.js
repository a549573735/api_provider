/**
 * Created by lukaijie on 16/5/11.
 */
var Pool = require('generic-pool').Pool;
var mysql = require('mysql');

var pool = new Pool({
    name: 'mysql',
    create: function (callback) {
        var c = mysql.createConnection({
            host     : 'localhost',
            user: 'root',
            password: '6821544',
            database: 'test1'
        });

        callback(null, c);
    },
    destroy: function (client) {
        client.end();
    },
    max: 10,
    idleTimeoutMillis: 10000,
    log: false
})

module.exports = pool;