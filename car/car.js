import { Events } from '../events/events.js';
import { colors } from '../colors/colors.js';

const Car = function(brand, model, color, scale) {
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
        
    }));
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

    let directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0, -70, 100).normalize();
    scene.add(directionalLight);

    let directionalLight2 = new THREE.DirectionalLight(0xffffff);
    directionalLight2.position.set(0, 70, 100).normalize();
    scene.add(directionalLight2);
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



Car.prototype.projectToWorld = function(coords){
    const WORLD_SIZE = 1024000;
    const MERCATOR_A = 6378137.0;

    const PROJECTION_WORLD_SIZE = WORLD_SIZE / (MERCATOR_A * Math.PI * 2);
    const DEG2RAD = Math.PI / 180;

    let projected = [
        -MERCATOR_A * DEG2RAD * coords[0] * PROJECTION_WORLD_SIZE,
        -MERCATOR_A * Math.log(Math.tan((Math.PI*0.25) + (0.5 * DEG2RAD * coords[1]) )) * PROJECTION_WORLD_SIZE,
        0
    ];
    
    let result = new THREE.Vector3(projected[0], projected[1], projected[2]);
    console.log(result)
    return result;
}

Car.prototype.setCoords = function(coords) {
    //let coords = [geo_coords[0] / Math.PI, geo_coords[1] / Math.PI];
    console.log(coords);
    //let point = [coords[0] *  6371, 6371 * Math.log(Math.tan(Math.PI / 4 + coords[1]))

    let rLat = coords[1] * Math.PI/180;
    let rLong = coords[0] * Math.PI/180;
    let a = 6378137.0;
    let b = 6356752.3142;
    let f = (a - b) / a;
    let e = sqrt( 2 * f - Math.pow(f, 2));
    let X = a * rLong;
    let Y = a * Math.log(Math.tan(Math.PI/4 + rLat / 2) * ( (1 - e * Math.sin(rLat)) /  ( 1 + e * Math.sin(rLat) ))^(e / 2) );
    //scene.position.x = coords.x * 40075000 * scale;
    //scene.position.y = coords.y * 40075000 * scale;
    
    

    return;
    
}

export { Car };