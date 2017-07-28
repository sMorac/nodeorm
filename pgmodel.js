'use strict';
/*jshint esversion: 6 */
/*jshint node: true */
/* globals __dbpool */

class PgModel{
    static makeFromRow(result){
        return new Promise( (resolve) => {
            var res = null;
            if (rows.length === 0) return __log.error('no record matching');
            var models = []; 
            var model = null
            for(let row in rows){
                model = new this();
                for (var key in row) model[key] = row[key];
                models.push(model);
            }
            if(models.length == 1)
                resolve(models[0]);
            else
                resolve(models); 
            });
    }
    static find(tableName, id){
        return __dbpool.query('SELECT * FROM ' + this.tableName + ' WHERE id = $1;',[id]) 
            .then(this.makeFromRow(result.rows))
            .catch( (e) => { winston.error(e) }); 
    }
    save(){
        var query,
            inlineFields = this.inlineFields();
        inlineFields[0] += ', updated_at';
        inlineFields[1] += ', localtimestamp';
        if(this.id)
            query =  __dbpool.query('UPDATE '+this.tableName+' SET ('+inlineFields[0]+') = ('+inlineFields[1]+') WHERE id = '+this.id+' RETURNING *;'); 

        else{
            inlineFields[0] += ', created_at';
            inlineFields[1] += ', localtimestamp';
            query = __dbpool.query('INSERT INTO '+this.tableName+' ('+inlineFields[0]+') VALUES('+inlineFields[1]+') RETURNING *;');
        }
        return query
            .then(this.makeFromRow(result.rows))
            .catch( (e) => { winston.error(e) }); 
    }
    delete(callback){
        return __dbpool.query('DELETE FROM '+this.tableName+' WHERE id = $1;',[this.id])
            .then(this.makeFromRow(result.rows))
            .catch( (e) => { winston.error(e) });
    }
    inlineFields(){
        var result = [], 
            keys = '', 
            values = '';
        var safe_keys = this.constructor.safe_keys;
        console.log(safe_keys)
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
PgModel.tableName = '<dummy>';
PgModel.safe_keys = new Set(['id','tableName', 'updated_at', 'created_at']);

module.exports = PgModel;
