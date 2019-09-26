import { Garage } from '../garage/garage.js';
import { GeoMap } from '../geo-map/geo-map.js';

const App = function(map_element, config) {
    this._garage = new Garage();
    this._geomap = new GeoMap(map_element, config.mapbox_token);
    
    this._init();
}

App.prototype._init = function() {
    this._garage.on('add', (scene)=>{
        this._geomap.add(scene);
    });

    this._geomap.on('ready', (zoom)=>{
        this._garage.setScale(zoom);
        this._garage.add(1, 'mitsubishi', 'lancer', 'yellow', {lat: 0, lng: 0});
        this._garage.add(2, 'mitsubishi', 'lancer', 'red', {lat: 55, lng: 37});
    });

    this._geomap.on('zoom', (zoom) => {
        this._garage.setScale(zoom);
    })
}

export { App }
