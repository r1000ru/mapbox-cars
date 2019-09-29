import { Events } from '../../events/events.js';

const GeoMap = function(element, config) {
    mapboxgl.accessToken = config.mapbox_token;
    this._car_layers = new Set();
    this._ready = false;

    this._map = new mapboxgl.Map({
        container: element,
        style: 'mapbox://styles/mapbox/streets-v11',
        zoom: 18,
        center: [0, 0],
        pitch:  0,
        antialias: true
    });
    
    this._map.on('style.load', () => {
        this._init();
        this._ready = true;
        this.emit('ready', this.getZoom());
    });
}


GeoMap.prototype.__proto__ = Events.prototype;

GeoMap.prototype._init = function() {
    // Add 3D building
    this._map.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
            'fill-extrusion-color': '#aaa',

            // use an 'interpolate' expression to add a smooth transition effect to the
            // buildings as the user zooms in
            'fill-extrusion-height': [
                "interpolate", ["linear"], ["zoom"],
                15, 0,
                15.05, ["get", "height"]
            ],
            'fill-extrusion-base': [
                "interpolate", ["linear"], ["zoom"],
                15, 0,
                15.05, ["get", "min_height"]
            ],
            'fill-extrusion-opacity': .6
        }
    }, 'building-number-label');

    this._map.on('zoom', ()=>{
        this._car_layers.forEach((layer)=>{
            layer.setScale(this._map.getZoom());
        })
    });
}


GeoMap.prototype.isReady = function() {
    return this._ready;
}

/**
 * Добавление слоя с новым автомобилем
 */
GeoMap.prototype.add = function(device_id, layer) {
    if (!this._ready) {
        return;
    }
    this._car_layers.add(layer);
    this._map.addLayer(layer);
    layer.setScale(this._map.getZoom());
}

/**
 * Получение информации о текущем масштабе карты
 */
GeoMap.prototype.getZoom = function() {
    return this._map.getZoom();
}

export { GeoMap }