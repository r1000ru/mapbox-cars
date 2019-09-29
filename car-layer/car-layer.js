const CarLayer = function(device_id) {
    this.id = `car-3d-${device_id}`;
    this.type = 'custom';
    this.renderingMode = '3d';
    
    this._camera = new THREE.Camera();
    this._scene = new THREE.Scene();
    this._model_scene;

    this._modelTransform;
    this._renderer;
    this._map;
}

CarLayer.prototype.onAdd = function(map, gl) {
    this._renderer = new THREE.WebGLRenderer({
        canvas: map.getCanvas(),
        context: gl,
        antialias: true
    });
    this._renderer.autoClear = false;
    this._map = map;
}

CarLayer.prototype.setCoords

CarLayer.prototype.render = function(gl, matrix) {
    if (!this._modelTransform) {
        return;
    }

    var m = new THREE.Matrix4().fromArray(matrix);
    var l = new THREE.Matrix4().makeTranslation(this._modelTransform.translateX, this._modelTransform.translateY, this._modelTransform.translateZ)
        .scale(new THREE.Vector3(this._modelTransform.scale, -this._modelTransform.scale, this._modelTransform.scale))
        .multiply(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), this._modelTransform.rotateX))
        .multiply(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), this._modelTransform.rotateY))
        .multiply(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), this._modelTransform.rotateZ));

    this._camera.projectionMatrix.elements = matrix;
    this._camera.projectionMatrix = m.multiply(l);
    this._renderer.state.reset();
    this._renderer.render(this._scene, this._camera);
    this._map.triggerRepaint();
}

CarLayer.prototype.setModelScene = function(scene) {
    this._model_scene = scene;
    this._scene.add(this._model_scene);
}

CarLayer.prototype.setScale = function(zoom) {
    if (!this._model_scene) {
        return;
    }
    let scale = Math.pow(1.85, 20 - zoom);
    if (scale < 1) {
        scale = 1;
    }

    this._model_scene.scale.set(scale, scale, scale);
}

CarLayer.prototype.setModelTransform = function(modelTransform) {
    this._modelTransform = modelTransform;
}

export { CarLayer }