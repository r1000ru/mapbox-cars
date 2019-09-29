/**
 * Конструктор объекта Request
 * Объект отвечает за отправку запросов и получение ответов
 */
const Request = function (config, session, lang) {
    this._url = config.url_real;
    this._session = session;
    this._lang = lang || 'ru';


    this._params = {
        browser: {
            name: navigator.vendor,
            os: navigator.platform
        },
        lk_id: session.profile.profile_id,
        session_id: session.session_id,
        api_version: config.api_version,
        language_iso_code: this._lang.toUpperCase()
    }

    this._xhr = null;
}

Request.prototype.send = function (method, params, callback, options) {
    options = options || {};

    if (typeof (params) === 'function') {
        callback = params;
        params = {};
    }

    if (!params) {
        params = {}
    };

    if (!callback) {
        callback = function (response) { console.info(response); };
    }

    if (this._xhr && !options.multi) {
        this._xhr.abort();
    }

    Object.assign(params || {}, this._params)

    this._xhr = new XMLHttpRequest();
    this._xhr.open("POST", this._url + '/' + method);

    if (options.onUpload) {
        this._xhr.upload.onprogress = (e) => {
            options.onUpload(e.loaded, e.total);
        }
    }

    if (options.onDownload) {
        this._xhr.onprogress = (e) => {
            options.onDownload(e.loaded, e.total);
        }
    }
    this._xhr.onload = () => {
        let response = this._xhr.response;
        this._xhr = null;
        if (response.result !== 'system.Ok') {
            callback({
                message: response.result
            })
            return;
        }
        callback(undefined, response);
    };

    this._xhr.onerror = (e) => {
        console.info(e);
        this._xhr = null;
        callback({
            message: e.message
        });
    };

    this._xhr.responseType = 'json';
    this._xhr.setRequestHeader('Accept', 'application/json');
    this._xhr.setRequestHeader('Content-Type', 'application/json');
    this._xhr.send(JSON.stringify(params));
    return this._xhr;
}

export { Request }