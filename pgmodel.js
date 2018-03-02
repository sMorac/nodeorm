'use strict';
/*jshint esversion: 6 */
/*jshint node: true */
/* globals __dbpool */

class PgModel{
    static makeFromRow(result){
        return new Promise( (resolve, reject) => {
            var res = null;
            var rows = result.rows;
            if (rows.length === 0){ reject('no record matching'); return; }
            var models = []; 
            var model = null;
            for(let row of rows){
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
    static find(id){
        return __dbpool.query('SELECT * FROM ' + this.tableName + ' WHERE id = $1;',[id]) 
            .then(this.makeFromRow.bind(this))
            .catch( (e) => { console.error(e); }); 
    }
    save(){
        var query,
            inlineFields = this.inlineFields();
        inlineFields[0] += ', updated_at';
        inlineFields[1] += ', localtimestamp';
        if(this.id)
            query =  __dbpool.query('UPDATE '+this.constructor.tableName+' SET ('+inlineFields[0]+') = ('+inlineFields[1]+') WHERE id = '+this.id+' RETURNING *;', inlineFields[2]); 
        else{
            inlineFields[0] += ', created_at';
            inlineFields[1] += ', localtimestamp';
            query = __dbpool.query('INSERT INTO '+this.constructor.tableName+' ('+inlineFields[0]+') VALUES('+inlineFields[1]+') RETURNING *;', inlineFields[2]);
        }
        return query
            .then(this.constructor.makeFromRow.bind(this.constructor))
            .catch( (e) => { console.error(e); }); 
    }
    delete(callback){
        return __dbpool.query('DELETE FROM '+this.constructor.tableName+' WHERE id = $1;',[this.id])
            .then(this.constructor.makeFromRow.bind(this.constructor))
            .catch( (e) => { console.error(e); });
    }
    inlineFields(){
        var result = [], 
            keys = '', 
            placeholders = '',
            values = [],
            count = 1;
        var safe_keys = this.constructor.safe_keys;
        for(var key in this){
            if((this[key]) && (this[key].constructor.name == 'Function' || this[key].constructor.name == 'AsyncFunction')) continue;
            if(safe_keys.has(key)) continue;
            keys += key+', ';
            placeholders += '$'+count+', ';
            values.push(this[key]);
            count++;
        }
        keys = keys.substring(0,(keys.length -2));
        placeholders = placeholders.substring(0, (placeholders.length-2));    
        result[0] = keys;
        result[1] = placeholders;
        result[2] = values;
        return result; 
    }  
}
PgModel.tableName = '<dummy>';
PgModel.safe_keys = new Set(['id','tableName', 'updated_at', 'created_at']);

module.exports = PgModel;
