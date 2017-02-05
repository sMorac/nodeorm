'use strict';
/*jshint esversion: 6 */
/*jshint node: true */
/* globals __base */
var PgQuery = require(__base + 'models/query/pgquery.js'); 

class PgModel{
    static _find(tableName, id, instanciation){
        var dbQuery = new PgQuery('SELECT * FROM ' + tableName + ' WHERE id = $1;',[id]);
        dbQuery.on('result', instanciation); 
        dbQuery.perform();
    }
    save(callback){
        var dbQuery,
            inlineFields = this.inlineFields();
        inlineFields[0] += ', updated_at';
        inlineFields[1] += ', localtimestamp';
        if(this.id)
            dbQuery = new PgQuery('UPDATE '+this.tableName+' SET ('+inlineFields[0]+') = ('+inlineFields[1]+') WHERE id = '+this.id+' RETURNING *;'); 
        else{
            inlineFields[0] += ', created_at';
            inlineFields[1] += ', localtimestamp';
            dbQuery = new PgQuery('INSERT INTO '+this.tableName+' ('+inlineFields[0]+') VALUES('+inlineFields[1]+') RETURNING *;');
        }
        dbQuery.on('result', callback);
        dbQuery.perform();
    }
    delete(callback){
        var dbQuery = new PgQuery('DELETE FROM '+this.tableName+' WHERE id = $1;',[this.id]);
        dbQuery.on('result', callback);
        dbQuery.perform();
    }
    initFromRow(row){
        if (row.length === 0) return console.error('no user matching');
        if (row.length > 1) return console.error('multiple users matching');
	    row = row[0];
        for (var key in row) this[key] = row[key];
    }
    inlineFields(){
        var result = [], 
            keys = '', 
            values = '';
        var safe_keys = new Set(['id','tableName', 'updated_at', 'created_at']);
        for(var key in this){
            if((this[key]) && (this[key].constructor.name == 'Function')) continue;
            if(safe_keys.has(key)) continue;
            keys += key+', ';
            if(this[key] && (this[key].constructor.name == 'String'))
            
                values += '\''+this[key]+'\', ';
            else if((this[key]) && (this[key].constructor.name == 'Object'))
                values += '$$'+JSON.stringify(this[key])+'$$, ';
            else
                values += this[key]+', ';
        }
        keys = keys.substring(0,(keys.length -2));
        values = values.substring(0, (values.length-2));    
        result[0] = keys;
        result[1] = values;
        return result; 
    }  
}

module.exports = PgModel;
