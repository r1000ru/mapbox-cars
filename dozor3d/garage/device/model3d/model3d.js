import { Events } from '../../../../events/events.js';
import { colors } from './colors/colors.js';
import { Model3DLayer} from './model3d-layer/model3d-layer.js';

const Model3D = function (device_id, brand, model, color, scale, coords) {
    this._device_id = device_id;
    this._coords = coords || { lat: 0, lng: 0 };

    this._layer = new Model3DLayer(this._device_id);
    this._gltf;
    this._renderer;

    

    let loader = new THREE.GLTFLoader();
    loader.load(`../car/${brand}/${model}.gltf`, ((gltf) => {
        this._gltf = gltf;
        this._layer.setModelScene(this._gltf.scene);
        this.setCoords(coords, 0);

        this._setLight();
        this.setColor(color || 'blue');
        this.setAngle(0);
        this._layer.setScale(scale || 1);

        this.emit('layer', this._layer);
    }));

}

Model3D.prototype.__proto__ = Events.prototype;


Model3D.prototype.getScene = function () {
    if (!this._gltf) {
        return;
    }
    
    return this._gltf.scene;
}

Model3D.prototype._setLight = function () {
    let scene = this.getScene();
    if (!scene) {
        return;
    }

    let light = new THREE.DirectionalLight(0xFFFFFF);
    light.position.set(0, 50, 20);
    scene.add(light);
}

Model3D.prototype.setColor = function (color) {
    let scene = this.getScene();
    if (!scene) {
        return;
    }
    let rgb = colors[color] || colors['lime'];
    scene.children[42].children[0].material.color = rgb;
}

Model3D.prototype.setAngle = function (rad) {
    let scene = this.getScene();
    if (!scene) {
        return;
    }

    scene.rotation.fromArray([Math.PI / 2, rad, 0]);
}

/*
Car.prototype.degrees2meters = function (coords, alt) {
    const radius = 20037508.34;

    let yCoef = Math.log(Math.tan((90 + coords.lat) * Math.PI / 360)) / (Math.PI / 180);

    let point = {
        x: Math.ceil(coords.lng * radius / 180),
        y: Math.ceil(yCoef * radius / 180),
        z: alt || 0
    }

    return point;
}
*/


Model3D.prototype.setCoords = function (coords, altitude) {
    if (!this._layer) {
        return;
    }

    let modelRotate = [0, 0, 0];
    let modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(coords, altitude);

    let modelTransform = {
        translateX: modelAsMercatorCoordinate.x,
        translateY: modelAsMercatorCoordinate.y,
        translateZ: modelAsMercatorCoordinate.z,
        rotateX: modelRotate[0],
        rotateY: modelRotate[1],
        rotateZ: modelRotate[2],
        scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
    };

    this._layer.setModelTransform(modelTransform);
}

export { Model3D };