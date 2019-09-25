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
    //hemiLight.color.setHSL( 0.6, 1, 0.6 );
    //hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    hemiLight.position.set( 0, 50, 0 );
    scene.add( hemiLight );
    let hemiLightHelper = new THREE.HemisphereLightHelper( hemiLight, 10 );
    //scene.add( hemiLightHelper );
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


Car.prototype.degrees2meters = function(coords) {
    const radius = 20037508.34;

    let yCoef = Math.log(Math.tan((90 + coords.lat) * Math.PI / 360)) / (Math.PI / 180);

    let point = {
        x: Math.ceil(coords.lng * radius / 180),
        y: Math.ceil(yCoef * radius / 180)
    }
    console.log(point)
    return point;
}

Car.prototype.setCameraPosition = function(position) {
    this._camera_position = position;
    this._setPosition();
}

Car.prototype.setCoords = function(coords) {
    this._coords = mapboxgl.MercatorCoordinate.fromLngLat(coords, 0);
    this._scale = this._coords.meterInMercatorCoordinateUnits();
    
}

Car.prototype._setPosition = function() {
    console.log(this._coords, this._coords_camera)
    let scene = this.getScene();
    if (!scene) {
        return;
    }
    
    let point = this.degrees2meters(this._coords);

    scene.position.set(point.x , point.y, 0);
}

export { Car };