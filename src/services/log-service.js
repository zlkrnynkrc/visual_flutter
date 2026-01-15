const vscode = require('vscode');
const { assert } = require('console');

const bufferSize = 100;

class LogService {

    static _lastMessages = [];
    
    static _canLog = true;
    static _config () {
        return vscode.workspace.getConfiguration('visual_flutter');
    }

    static _addMessage(message) {
        if (this._lastMessages.length > bufferSize) {
            this._lastMessages.splice(0, 1);
        }
        this._lastMessages.push(message);
    }

    static canLog() {
        const autolog = this._config().get('autolog', true);
        return autolog || this._canLog;
    }

    static setCanLog(value) {
        this._canLog = value;
    }

    static log(message) {
        this._addMessage(message);
        this.canLog() ? console.log(message) : {};
    }

    static error(message, ...optionalParams) {
        this._addMessage(message);
        this.canLog() ? console.error(message, optionalParams) : {};
    }

    static assert(value, message, ...optionalParams) {
        this._addMessage(message);
        this.canLog() ? assert(value, message, optionalParams) : {};
    }
    
}

module.exports = LogService;