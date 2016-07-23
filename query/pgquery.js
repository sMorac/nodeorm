'use strict';

var EventSystem = require(__base + 'utils/eventsystem.js');

class PgQuery extends EventSystem{
    constructor(queryString, values){
        super();
        this.queryString = queryString;
        this.values = values;
        // bindings
        this.onResult = this.onResult.bind(this); 
    }
    perform(){
        PgQuery.pool.query(this.queryString, this.values, this.onResult);
    }
    onResult(err, result){
        if(err) return this.onError(err); 
        this.emit('result', result.rows);
    }
    onError(err){
        console.error('[Error]: ', err);
        console.error('[Error]: query: '+this.queryString); 
        console.error('[Error]: values: '+this.values); 
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
