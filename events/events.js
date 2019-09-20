var Events = function() {
    this._microevents_callbacks = {};
}

Events.prototype.on = function(event, callback) {
    this._microevents_callbacks = this._microevents_callbacks || {};
    this._microevents_callbacks[event] = callback;
}

Events.prototype.emit = function(event, data) {
    if (this._microevents_callbacks && this._microevents_callbacks[event] && typeof this._microevents_callbacks[event] === 'function') {
        this._microevents_callbacks[arguments[0]].apply(null, Array.prototype.slice.call(arguments, 1));
    }
}

export { Events };