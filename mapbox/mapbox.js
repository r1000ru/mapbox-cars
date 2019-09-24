import { Events } from '../events/events.js';

const MapBox = function(element, token) {
    mapboxgl.accessToken = token;

    this._map = new mapboxgl.Map({
        container: element,
        style: 'mapbox://styles/mapbox/streets-v11',
        zoom: 18,
        center: [0, 0],
        pitch:  0,
        antialias: true // create the gl context with MSAA antialiasing, so custom layers are antialiased
    });
// https://github.com/mapbox/mapbox-gl-js/issues/7395
    this._camera = new THREE.PerspectiveCamera();
    console.log(this._camera);
    this._scene = new THREE.Scene();
    this._renderer = new THREE.WebGLRenderer({
        canvas: this._map.getCanvas(),
        antialias: true
    });
    this._renderer.autoClear = false;

    this._coords = mapboxgl.MercatorCoordinate.fromLngLat([0 ,0], 0);
    this._scale = this._coords.meterInMercatorCoordinateUnits();
    
    this._map.on('style.load', () => {
        this._init();
    });
}


MapBox.prototype.__proto__ = Events.prototype;
MapBox.prototype._init = function() {
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

    this._map.addLayer({
        id: '3d-model',
        type: 'custom',
        renderingMode: '3d',
        render: (gl, matrix) =>{
            let m = new THREE.Matrix4().fromArray(matrix);

            let l = new THREE.Matrix4().makeTranslation(this._coords.x, this._coords.y, this._coords.z).scale(new THREE.Vector3(this._scale, -this._scale, this._scale));
            this._camera.projectionMatrix.elements = matrix;
            this._camera.projectionMatrix = m.multiply(l);
           
            this._renderer.state.reset();
            this._renderer.render(this._scene, this._camera);
            this._map.triggerRepaint();
        }
    });
    this._map.on('zoom', ()=>{
        this.emit('zoom', this.getZoom());
    });

    this.emit('ready');

}

MapBox.prototype.add = function(scene) {
    this._scene.add(scene);
}

MapBox.prototype.getZoom = function() {
    return this._map.getZoom();
}

export { MapBox }