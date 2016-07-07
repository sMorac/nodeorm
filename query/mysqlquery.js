'use strict';

var EventSystem = require('utils/eventsystem.js');

class MysqlQuery extends EventSystem{
    constructor(queryString, values){
        this.queryString = queryString; 
        this.values = values; 
        this.connection = null; 
        // bindings
        this.onConnect = this.onConnect.bind(this);
        this.onResult = this.onResult.bind(this); 
    }
    perform(){
        MysqlQuery.pool.getConnection(this.onConnect);
    }
    onConnect(err, connection){
        if(err) return this.onError(err);
        this.connection = connection; 
        let query = this.connection.query(this.queryString, this.values, this.onResult);
    }
    onResult(err, rows){
        this.connection.release(); 
        if(err) return this.onError(err);
        this.emit('result', rows);
    }
    onError(err){
        console.error('[Error]: ', err);     
    }
}

if(!process.env.MYSQL_PASSWORD) throw "Password not found in environment variable MYSQL_PASSWORD";

MysqlQuery.pool = require('mysql').createPool({
    connectionLimit : 10,
    user     : 'user',
    password : process.env.MYSQL_PASSWORD, // Storing the password as environment variable 
    database : 'db',
    host     : 'host',
    port: 3306,
});

module.exports = MysqlQuery;
