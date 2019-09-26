import { Events } from '../events/events.js';
import { colors } from '../colors/colors.js';

const Car = function(brand, model, color, scale) {
    this._camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
    this._coords = mapboxgl.MercatorCoordinate.fromLngLat([0 ,0], 0);
    this._scale = this._coords.meterInMercatorCoordinateUnits();

    this._gltf;
    var loader = new THREE.GLTFLoader();
    
    
    this._layer_coords;
    this._layer_scale;

    loader.load(`../car/${brand}/${model}.gltf`, ( (gltf)=> {
        this._gltf = gltf;
        this._setLight();
        this.setColor(color || 'blue');
        this.setAngle(0);
        this.setScale(scale || 1);
        this.emit('load', this.getScene());
        console.log(this);
    }));

    this._coords = {
        lat: 0,
        lng: 0
    };
    this._position_position ={
        x: 0,
        y: 0,
        z: 0
    };
}

Car.prototype.__proto__ = Events.prototype;

Car.prototype.setLayerCoords = function(coords) {
    this._layer_coords = coords;
    this._layer_scale = this._layer_coords.meterInMercatorCoordinateUnits();
}

Car.prototype._setLight = function() {
    let scene = this.getScene();
    if (!scene) {
        return;
    }

    let hemiLight = new THREE.HemisphereLight('#aaaaaa');
    hemiLight.position.set( 0, 50, 0 );
    scene.add( hemiLight );
}

Car.prototype.getScene = function() {
    if (!this._gltf) {
        return;
    }
    return this._gltf.scene;
}

Car.prototype.setColor = function(color) {
    let scene = this.getScene();
    if (!scene) {
        return;
    }
    let rgb = colors[color] || colors['lime'];
    scene.children[42].children[0].material.color = rgb;
}

Car.prototype.setAngle = function(rad) {
    let scene = this.getScene();
    if (!scene) {
        return;
    }

    scene.rotation.fromArray([Math.PI/2, rad, 0]);
}

Car.prototype.setScale = function(scale) {
    let scene = this.getScene();
    if (!scene) {
        return;
    }

    scene.scale.set(scale, scale, scale);
}


Car.prototype.degrees2meters = function(coords, alt) {
    const radius = 20037508.34;

    let yCoef = Math.log(Math.tan((90 + coords.lat) * Math.PI / 360)) / (Math.PI / 180);

    let point = {
        x: Math.ceil(coords.lng * radius / 180),
        y: Math.ceil(yCoef * radius / 180),
        z: alt || 0
    }

    return point;
}


Car.prototype.setCoords = function(coords) {
    let scene = this.getScene();
    if (!scene) {
        return;
    }
    let point = this.degrees2meters(coords)
    scene.position.set(point.x , point.y, point.z);
}

export { Car };