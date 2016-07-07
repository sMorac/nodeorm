'use strict'; 

class EventSystem{
    constructor(){
    }
    on(event, callback){
        this._callbacks = (typeof this._callbacks !== 'undefined')? this._callbacks: {};
        this._callbacks[event] = (typeof this._callbacks[event] !== 'undefined')? this._callbacks[event]:[];
        this._callbacks[event].push(callback);
    }
    off(event, callback){
        this._callbacks = (typeof this._callbacks !== 'undefined')? this._callbacks: {};
        let event_callbacks = this._callbacks[event];
        if(event_callbacks == undefined) return;
        for (let i=event_callbacks.length-1; i>=0; i--){
            if(event_callbacks[i] == callback){
                event_callbacks.splice(i,1);
                break;
            }
        }
    }
    emit(event, args){
        this._callbacks = (typeof this._callbacks !== 'undefined')? this._callbacks: {};
        let event_callbacks = this._callbacks[event];
        if(event_callbacks == undefined) return; 
        for (let i=event_callbacks.length-1; i>=0; i--)
            event_callbacks[i].apply(this, Array.prototype.slice.call(arguments, 1));
    }
};
