
const SignalLight = function (url, services) {
    this._url = document.createElement('a');
    this._url.href = url;
    this._client_protocol = '1.5';
    this._services = [];
    this._connection_token = null;
    this._connection_id = null;
    this._socket;
    this._tid = 0;
    this._cid = 0;
    this._events = {};

    for (let i in services) {
        this._services.push({ name: services[i] });
    }
}

SignalLight.prototype.emit = function (event, args) {
    if (this._events && this._events[event] && typeof this._events[event] === 'function') {
        this._events[arguments[0]].apply(null, Array.prototype.slice.call(arguments, 1));
    }
}

SignalLight.prototype.on = function (event, callback) {
    this._events = this._events || {};
    this._events[event] = callback;
}

SignalLight.prototype.handshake = function (callback) {
    this._negotiate(() => {
        this._start(() => {
            if (callback) {
                callback();
            }
        });
    });
}

SignalLight.prototype._negotiate = function (callback) {
    let services = encodeURIComponent(JSON.stringify(this._services));

    const xhr = new XMLHttpRequest();
    let url = `${this._url.href}/negotiate?clientProtocol=${this._client_protocol}&connectionData=${services}&_=${Date.now()}`
    url = url.replace(/([^:])(\/\/+)/g, '$1/');

    xhr.open('GET', url);

    xhr.onload = () => {
        if (!xhr.response || !xhr.response.ConnectionToken || !xhr.response.TryWebSockets) {
            this.emit('error', 'SignalR negotiating failed', xhr.response);
            return;
        }

        this._connection_id = xhr.response.ConnectionId;
        this._connection_token = xhr.response.ConnectionToken;
        if (callback) {
            callback();
        }
    };

    xhr.onerror = (e) => {
        this.emit('error', 'SignalR negotiating error', e);
    }


    xhr.responseType = 'json';
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();
}

SignalLight.prototype._start = function (callback) {
    let token = encodeURIComponent(this._connection_token);
    let services = encodeURIComponent(JSON.stringify(this._services));

    const xhr = new XMLHttpRequest();
    let url = `${this._url.href}/start?transport=webSockets&clientProtocol=${this._client_protocol}&connectionToken=${token}&connectionData=${services}&_=${Date.now()}`;
    url = url.replace(/([^:])(\/\/+)/g, '$1/');
    xhr.open('GET', url);
    xhr.onload = () => {
        if (!xhr.response || xhr.response.Response !== 'started') {
            this.emit('error', 'SignalR starting failed', xhr.response);
            return;
        }

        if (callback) {
            callback();
        }
    }
    xhr.onerror = () => {
        this.emit('error', 'SignalR starting error', e);
    }
    xhr.responseType = 'json';
    xhr.send();
}

SignalLight.prototype.connect = function () {
    if (this._socket) {
        this.emit('error', 'SignalR connecting error:  connection is opened');
        return;

    }


    let scheme = this._url.protocol === 'https:' ? 'wss:' : 'ws:';
    let url = `${scheme}//${this._url.host}${this._url.pathname}`;

    let token = encodeURIComponent(this._connection_token);
    let services = encodeURIComponent(JSON.stringify(this._services));

    url += `/connect?transport=webSockets&clientProtocol=${this._client_protocol}&connectionToken=${token}&connectionData=${services}&tid=${this._tid}`;
    url = url.replace(/([^:])(\/\/+)/g, '$1/');

    this._socket = new WebSocket(url);

    this._socket.onopen = () => {
        this.emit('connect')
    };

    this._socket.onclose = (e) => {
        this._socket = null;
        this.emit('close', e);
    };

    this._socket.onmessage = (message) => {
        let data = {};
        try {
            data = JSON.parse(message.data);
        } catch (e) {
            this.emit('error', 'Parsing error', message.data);
            return;
        }

        if (!data.M) {
            return;
        }

        for (let m in data.M) {
            for (let a in data.M[m].A) {
                this.emit('message', data.M[m].H, data.M[m].M, data.M[m].A[a], data.C);
            }
        }
    };

    this._tid++;

}

SignalLight.prototype.send = function (service, method, params) {
    if (!this._socket) {
        this.emit('error', 'SignalR connection is closed');
        return;
    }

    this._socket.send(JSON.stringify({
        H: service,
        M: method,
        A: params,
        I: this._cid
    }));

    this._cid++;
}

SignalLight.prototype.close = function () {
    if (this._socket) {
        this._socket.close();
        this._socket = null;
    }
}

export { SignalLight };