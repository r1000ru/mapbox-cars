import { Events } from '../events/events.js';
import { MapBox } from '../mapbox/mapbox.js';
import { Car } from '../car/car.js';

const Garage = function(element, config) {
    this._map = new MapBox(element, config.mapbox_token);
    this._map.on('ready', () => {
        this.emit('ready');
    });
    this._map.on('zoom', (map_zoom)=>{
        this.setScale(map_zoom);
    });
    this._map.on('camera_position', (position)=>{
        console.log(position);
        this._cars.forEach((car)=>{
            car.setCameraPosition(position);
        })
    })
    this._cars = new Map();
}
Garage.prototype.__proto__ = Events.prototype;

Garage.prototype.add = function(device_id, brand, model, color) {
    if (this._cars.has(device_id)) {
        return;
    }
    let scale = this._calcScale(this._map.getZoom());
    let car = new Car(brand, model, color, scale);
    car.on('load', (scene) => {
        this._map.add(scene);
    })
    this._cars.set(device_id, car);
}
Garage.prototype._calcScale = function(map_zoom) {
    let scale = Math.pow(1.85, 20 - map_zoom);
    if (scale < 1) {
        scale = 1;
    }
    return scale
}
Garage.prototype.setScale = function(map_zoom) {
    let scale = this._calcScale(map_zoom);
    this._cars.forEach((car) => {
        car.setScale(scale);
    })
}

export { Garage }