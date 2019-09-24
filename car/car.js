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
        console.log(this);
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
    let yCoef = Math.log(Math.tan((90 + coords[0]) * Math.PI / 360)) / (Math.PI / 180);

    let x = Math.ceil(coords[1] * radius / 180);
    let y = Math.ceil(yCoef * radius / 180);
    return {x: x, y: y}
}

Car.prototype.setCoords = function(coords) {
    let scene = this.getScene();
    if (!scene) {
        return;
    }
    
    let point = this.degrees2meters(coords);
    console.log(point, scene)
    scene.position.set(point.x, point.y, 0);
    
}

export { Car };