
import { Events } from '../events/events.js';
import { ControlService } from './controlservice/controlservice.js';
import { Garage } from './garage/garage.js';
import { GeoMap } from './geo-map/geo-map.js';

const Dozor3D = function(config, session) {
    this._cs = new ControlService(config, session);
    this._garage = new Garage();
    this._geomap = new GeoMap('geomap', config);

    this._init();
}

Dozor3D.prototype.__proto__ = Events.prototype;

Dozor3D.prototype._init = function() {
    this._garage.on('layer', (device_id, layer) => {
        this._geomap.add(device_id, layer);
    })

    this._geomap.on('ready', ()=>{
        this._load();
    });
}

Dozor3D.prototype._load = function() {
    this._cs.req('GetDevices', {
        registrations: true,
        extended_info: true
    }, (err, res)=>{
        if (err) {
            console.log(err);
            return;
        }

        res.devices.forEach((device_info) => {
            this._garage.add(device_info);
        });

        this._cs.connect()
        console.log(res);
    });
}



export { Dozor3D }