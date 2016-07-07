'use strict';

var EventSystem = require('utils/eventsystem.js');

class PgQuery extends EventSystem{
    constructor(queryString, values){
        this.queryString = queryString;
        this.values = values;
        this.release = null;
        this.client = null; 
        // bindings
        this.onConnect = this.onConnect.bind(this); 
        this.onResult = this.onResult.bind(this); 
    }
    perform(){
        PgQuery.pool.connect(PgQuery.config, this.onConnect); 
    }
    onConnect(err, client, done){
        this.release = done; 
        if(err) return this.onError(err);
        this.client = client; 
        this.client = query(this.queryString, this.values, this.onResult); 
    }
    onResult(err, result){
        this.release(); 
        if(err) return this.onError(err); 
        this.emit('result', result.rows);
    }
    onError(err){
        console.error('[Error]: ', err);
    }
}

if(!process.env.PG_PASSWORD) throw "Password not found in environment variable PG_PASSWORD";

PgQuery.pool = require('pg').native;
PgQuery.config = {
    user: 'user',
    password: process.env.PG_PASSWORD, // Storing the password as environment variable
    database: 'db',
    host: 'host',
    port: 5432,
}

module.exports = PgQuery;
