
import { Events } from '../../../events/events.js'
import { SignalLight } from '../signallight/signallight.js';

const Signal = function (config, session) {
    this._session = session;
    this._sl = new SignalLight(config.url_signal_r, ['ControlService']);

    this._sl.on('message', (service, method, data) => {
        if (service !== 'ControlService' || method !== 'Event') {
            return;
        }
        this._onMessage(data);
    })

    this._sl.on('error', (message, err) => {
        console.log(message, err)
        this.emit('error', message, err);
    });

    this._sl.on('connect', () => {
        this.emit('connected');
    })
}

Signal.prototype.__proto__ = Events.prototype;

Signal.prototype.start = function () {
    this._sl.handshake(() => {
        this._sl.connect();
    });
}
Signal.prototype.wakeUp = function (devices_ids) {
    this.command('ConnectKeepOffline', devices_ids || [])
}

Signal.prototype.command = function (method, params, callback) {
    console.log(method, params)
    params = params || {};
    let req = [];
    if (Array.isArray(params)) {
        req.push(this._session.session_id);
        req.push(params);
        //req.push(true)
    } else if (typeof (params) === 'object') {
        params.session_id = this._session.session_id;
        params.lk_id = this._session.profile.profile_id;
        req.push(params);
    } else {
        console.log('Wrong SignalR params: ', method, params);
        return;
    }

    this._sl.send('ControlService', method, req);
}

Signal.prototype._onMessage = function (message) {
    let data = null;
    try {
        data = JSON.parse(message);
    } catch (e) {
        console.log('Wrong JSON on SignalR', message);
        return;
    }

    if (data.device_id && data.device_state) {
        if (Object.keys(data.device_state).length > 0) {
            this.emit('states', data.device_id, data.device_state);
        }
    } else if (data.lk_id && data.registration) {
        console.log('REG MESS: ', data)
        this.emit('registration', data.registration);
    } else {
        this.emit('message', data);
    }

}

Signal.prototype.stop = function () {
    this._sl.close();
}

export { Signal };