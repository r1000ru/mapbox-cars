import { config } from './config/config.js';
import { Garage } from './garage/garage.js';

const garage = new Garage('map', config);
garage.on('ready', ()=>{
    console.log('ready')
    garage.add(1, 'mitsubishi', 'lancer', 'yellow');
});

window.garage = garage;
