'use strict';
var PgQuery = require('query/pgquery.js'); 

class PgModel{
    constructor(tableName){
        this.tableName = tableName; 
    }
    find(id, instanciation){
        var dbQuery = new PgQuery('SELECT * FROM ' + this.tableName + ' WHERE id = $1;',[aId]);
        dbQuery.on('result', instanciation); 
        dbQuery.perform();    
    }
    all(callback){
        var dbQuery = new PgQuery('SELECT * FROM '+ this.tableName +' ORDER BY ID;',null);
        dbQuery.on('result', callback); 
        dbQuery.perform();
    }
    initFromRow(row){
	    for (var key in row) this[key] = row[key];
    }
    save(callback){
        var dbQuery,
            inlineFields = this.inlineFields();
        inlineFields[0] += ', updated_at';
        inlineFields[1] += ', localtimestamp';
        if(this.id)
            dbQuery = new PgQuery('UPDATE '+this.tableName+' SET ('+inlineFields[0]+') = ('+inlineFields[1]+') WHERE id = '+this.id+';'); 
        else{
            inlineFields[0] += ', created_at';
            inlineFields[1] += ', localtimestamp';
            dbQuery = new PgQuery('INSERT INTO '+this.tableName+' ('+inlineFields[0]+') VALUES('+inlineFields[1]+') RETURNING *;');
        }
        dbQuery.on('result',aCallback);
        dbQuery.perform();
    }
    delete(callback){
        var dbQuery = new PgQuery('DELETE FROM '+this.tableName+' WHERE id = $1;',[this.id]);
        dbQuery.on('result',aCallback);
        dbQuery.perform();
    }
    inlineFields(){
        var result = [], 
            keys = '', 
            values = ''; 
        for(let key in this){
            if((this[key] != null)&&(this[key].constructor.name == 'Function')) continue;
            if((key=='id')|| (key=='updated_at') || (key=='created_at')) continue;
            keys += key+', '
            if((this[key] != null)&&(this[key].constructor.name == 'String'))
                values += '\''+this[key]+'\', ';
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
