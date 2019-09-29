import { config } from './config/config.js';
import { Dozor3D } from './dozor3d/dozor3d.js';

const passport = new tec.passport.App({
    demo: false,
    autoclose: true,
    multiprofiles: true
});





passport.on('login', (session) => {
    window.dozor3d = new Dozor3D(config, session);
    window.dozor3d.on('logout', () => {
        passport.logout();
        document.location.href = '/';
    });
});

passport.on('logout', (e)=>{
    passport.login();
});

passport.run();

