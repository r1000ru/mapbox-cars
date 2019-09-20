import { Car } from "../car/car.js";

const Map = function(element, token) {
    mapboxgl.accessToken = token;

    this._map = new mapboxgl.Map({
        container: element,
        style: 'mapbox://styles/mapbox/streets-v11',
        zoom: 18,
        center: [37.835, 55.80828],
        pitch: 60,
        antialias: true // create the gl context with MSAA antialiasing, so custom layers are antialiased
    });

    this._car_layer;

    this._map.on('style.load', () => {
        this._init();
    });
}

Map.prototype._init = function() {

    // parameters to ensure the model is georeferenced correctly on the map
    var modelOrigin = [37.835, 55.80828];
    var modelAltitude = 0;
    var modelRotate = [Math.PI / 2, Math.PI / 2, 0];

    var modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude);

    // transformation parameters to position, rotate and scale the 3D model onto the map
    var modelTransform = {
        translateX: modelAsMercatorCoordinate.x,
        translateY: modelAsMercatorCoordinate.y,
        translateZ: modelAsMercatorCoordinate.z,
        rotateX: modelRotate[0],
        rotateY: modelRotate[1],
        rotateZ: modelRotate[2],

        scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
    };

    this._car_layer = {
        id: '3d-model',
        type: 'custom',
        renderingMode: '3d',
        onAdd:  (map, gl) =>{
            this.camera = new THREE.Camera();
            this.scene = new THREE.Scene();

            // create two three.js lights to illuminate the model
            var directionalLight = new THREE.DirectionalLight(0xffffff);
            directionalLight.position.set(0, -70, 100).normalize();
            this.scene.add(directionalLight);

            var directionalLight2 = new THREE.DirectionalLight(0xffffff);
            directionalLight2.position.set(0, 70, 100).normalize();
            this.scene.add(directionalLight2);

            
            // use the Mapbox GL JS map canvas for three.js
            this.renderer = new THREE.WebGLRenderer({
                canvas: map.getCanvas(),
                context: gl,
                antialias: true
            });

            this.renderer.autoClear = false;
        },
        
        render: (gl, matrix) =>{
            var m = new THREE.Matrix4().fromArray(matrix);
            var l = new THREE.Matrix4().makeTranslation(modelTransform.translateX, modelTransform.translateY, modelTransform.translateZ)
                .scale(new THREE.Vector3(modelTransform.scale, -modelTransform.scale, modelTransform.scale))
                .multiply(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), modelTransform.rotateX))
                .multiply(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), modelTransform.rotateY))
                .multiply(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), modelTransform.rotateZ));

            this.camera.projectionMatrix.elements = matrix;
            this.camera.projectionMatrix = m.multiply(l);
            this.renderer.state.reset();
            this.renderer.render(this.scene, this.camera);
            this._map.triggerRepaint();
        }
    }
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

    this._map.addLayer(this._car_layer, '3d-buildings');
    
    
    this._car1 = new Car('mitsubishi', 'lancer', 'yellow');
    this._car1.on('load', (scene)=>{
        this.scene.add(scene)
    })
/*
    this._car2 = new Car('mitsubishi', 'lancer', 'lime');
    this._car2.on('load', (scene)=>{
        this.scene.add(scene)
    })
*/
    
    
}

export { Map }