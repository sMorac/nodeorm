'use strict';

var MysqlQuery = require('query/mysqlquery.js'); 

class MysqlModel{
    constructor(tableName){
        this.tableName = tableName;
    }
    find(id, instanciation){
        let dbQuery = new MysqlQuery('SELECT * FROM ?? WHERE id = ?',[this.tableName,id]);
        dbQuery.on('result', instanciation);
        dbQuery.perform();   
    }
    all(callback){
        let dbQuery = new MysqlQuery('SELECT * FROM ??;',this.tableName);
        dbQuery.on('result', callback);
        dbQuery.perform();
    }
    initFromRow(row){
	    for (var key in row) this[key] = row[key];
    }
    save(callback){
        let dbQuery; 
        if(this.id)
            dbQuery = new MysqlQuery('UPDATE ?? SET '+this.inlineFieldsForUpdate()+' WHERE id = '+this.id+';',this.tableName); 
        else{
            var inlineFileds = this.inlineFieldsForInsert(); 
            dbQuery = new MysqlQuery('INSERT INTO ?? ('+inlineFileds[0]+') VALUES('+inlineFileds[1]+');',this.tableName);
        }
        dbQuery.on('result', callback);
        dbQuery.perform();
    }
    delete(callback){
        var dbQuery = new MysqlQuery('DELETE FROM ?? WHERE id = ?;',[this.tableName, this.id]);
        dbQuery.on('result', callback);
        dbQuery.perform();
    }

    inlineFieldsForUpdate(){
        var result = '';
        for(var key in this){
            if((this[key] != null)&&(this[key].constructor.name == 'Function')) continue;
            if(key=='id') continue;
            if((this[key] != null)&&(this[key].constructor.name == 'String'))
                result += key+' = \''+this[key]+'\', ';
            else
                result += key+' = '+this[key]+', ';

        }
        result = result.substring(0,(result.length - 2));
        return result; 
    }
    inlineFieldsForInsert(){
        var result = [], 
            keys = '', 
            values = ''; 
        for(let key in this){
            if((this[key] != null) && (this[key].constructor.name == 'Function')) continue;
            if(key=='id') continue;
            keys += key+', '
            if((this[key] != null) && (this[key].constructor.name == 'String'))
                values += '\''+this[key]+'\', ';
            else
                values += this[key]+', ';
        }
        keys = keys.substring(0, (keys.length -2));
        values = values.substring(0, (values.length-2));    
        result[0] = keys;
        result[1] = values;
        return result; 
    }
}

module.exports = MysqlModel;

