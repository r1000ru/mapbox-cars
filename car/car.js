import { Events } from '../events/events.js';
import { colors } from '../colors/colors.js';

const Car = function(brand, model, color) {
    this._gltf;
    var loader = new THREE.GLTFLoader();
    loader.load(`../car/${brand}/${model}.gltf`, ( (gltf)=> {
        this._gltf = gltf;
        this.setColor(color || 'blue');
        this.emit('load', this.getScene());
    }))
}

Car.prototype.__proto__ = Events.prototype;

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

    scene.rotation.fromArray([0, rad, 0]);
}

export { Car };