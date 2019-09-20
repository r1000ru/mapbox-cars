import { config } from './config/config.js';
import { Map } from './map/map.js';

window.app = new Map('map', config.mapbox_token);