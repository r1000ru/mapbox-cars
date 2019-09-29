import { Events } from '../../../events/events.js';
import { Model3D } from './model3d/model3d.js';

const Device = function(device_info) {
    this._device_id = device_info.device_id;

    this._info = {
        name: device_info.null,
        color: device_info.color || 'blue',
        image_id: device_info.image_id || null
    }


    this._states = {};
}

Device.prototype.__proto__ = Events.prototype;

Device.prototype.setInfo = function(device_info) {
    this._info.name = device_info.name || this._info.name;
    this._info.color = device_info.color || 'blue';
    this._info.image_id = device_info.image_id || null;
}

Device.prototype.setStates = function(states) {
    console.log(states);
}

export { Device }