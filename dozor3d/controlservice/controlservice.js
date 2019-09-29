import { Events } from '../../events/events.js';
import { Request } from './request/request.js';
import { Signal } from './signal/signal.js';

const ControlService = function(config, session) {
    this._signal = new Signal(config, session);
    this._request = new Request(config, session, 'ru');
    this._init();
}

ControlService.prototype.__proto__ = Events.prototype;

ControlService.prototype._init = function() {
    this._signal.on('states', (device_id, states)=>{
        this.emit('states', device_id, states);
    });

    this._signal.on('registration', (registration)=>{
        this.emit('registration', registration);
    });

    this._signal.on('connect', ()=>{
        console.log('connected')
        this._signal.command('ConnectKeepOffline', []);
    })

    this._signal.start();
}

ControlService.prototype.req = function(method, params, callback, options) {
    this._request.send(method, params, callback, options);
}

ControlService.prototype.connect = function() {
    this._signal.command('ConnectKeepOffline', []);
}

ControlService.prototype.disconnect = function() {
    this._signal.disconnect();
}

ControlService.prototype.command = function(command, params, callback) {
    this._signal.command(command, params, callback)
}

export { ControlService }