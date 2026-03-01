const vscode = require('vscode');
const ConfigProvider = require ('../utils/config-provider');
const { assert } = require('console');

const bufferSize = 100;
const awareUser = 'aware';

class LogService {

    static _lastMessages = [];

    static _canLog = true;

    static _addMessage(message) {
        if (this._lastMessages.length > bufferSize) {
            this._lastMessages.splice(0, 1);
        }
        this._lastMessages.push(message);
    }
    
    static _showDialog(text, action) {
        const yes = 'Yes';
        vscode.window.showInformationMessage(text, yes, 'No')
            .then((answer) => {
                if (answer === yes && action) {
                    action();
                }
            });
    }

    static canLog() {
        const autolog = ConfigProvider.configByProperty('autolog', true);
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
        if (optionalParams.some((p) => p.toString() === awareUser))
        {
            const action = optionalParams.find((p) =>
                typeof p === 'function'
            );
            const info = 'Visual Flutter: some error detected. ' +
                'Stop Analysis Server?';
            this._showDialog(info, action);
        }
        this._addMessage(message);
        this.canLog() ? console.error(message, optionalParams) : {};
    }

    static assert(value, message, ...optionalParams) {
        this._addMessage(message);
        this.canLog() ? assert(value, message, optionalParams) : {};
    }
}

module.exports = { LogService, awareUser };