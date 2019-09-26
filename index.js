import { config } from './config/config.js';
import { Garage } from './garage/garage.js';

const garage = new Garage('map', config);
garage.on('ready', ()=>{
    garage.add(1, 'mitsubishi', 'lancer', 'yellow', {lat: 0, lng: 0});
    garage.add(2, 'mitsubishi', 'lancer', 'red', {lat: 55, lng: 37});
});

window.garage = garage;
