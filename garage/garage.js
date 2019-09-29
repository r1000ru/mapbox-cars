import { Events } from '../events/events.js';
import { Car } from '../car/car.js';

const Garage = function() {
    this._cars = new Map();
}

Garage.prototype.__proto__ = Events.prototype;

/**
 * Добавление автомобиля
 */
Garage.prototype.add = function(device_id, brand, model, color, coords) {
    if (this._cars.has(device_id)) {
        return;
    }

    let scale = this._calcScale();
    
    let car = new Car(device_id, brand, model, color, scale, coords);
    
    car.on('layer', (layer) => {
        this.emit('add', device_id, layer);
    })

    this._cars.set(device_id, car);
}

/**
 * Расчет масштаба авто в зависимости от масштаба карты
 */
Garage.prototype._calcScale = function() {
    let scale = Math.pow(1.85, 20 - this._zoom);
    if (scale < 1) {
        scale = 1;
    }

    return scale;
}

/**
 * Устанавливаем масштаб авто в зависимости от масштаба карты
 */
Garage.prototype.setScale = function(zoom) {
    this._zoom = zoom;
    let scale = this._calcScale();

    this._cars.forEach((car) => {
        car.setScale(scale);
    });
}

export { Garage }