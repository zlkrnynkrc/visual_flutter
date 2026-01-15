const LogService = require('../services/log-service');
const { spawn } = require('child_process');

class DartAnalysisServer {

    constructor() {
        this.serverProcess = null;
        this.responseHandlers = {};
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new DartAnalysisServer();
        }
        return this.instance;
    }
    
    start(dartExecutablePath, analyzerSnapshotPath) {
        this.serverProcess = spawn(dartExecutablePath, [analyzerSnapshotPath]);
        this._listen();
    }

    stop() {
        if (this.serverProcess) {
            this.serverProcess.kill();
            this.serverProcess = null;
        }
    }

    isRunning() {
        return !!this.serverProcess;
    }

    async sendRequest(request) {
        return new Promise((resolve, reject) => {
            if (!this.serverProcess) {
                reject(new Error(serverNotStartedMessage));
                return;
            }

            this.responseHandlers[request.id] = resolve;
            this.serverProcess.stdin.write(JSON.stringify(request) + '\n');
        });
    }

    _listen() {
        let buffer = '';
        this.serverProcess.stdout.on('data', (chunk) => {
            buffer += chunk.toString();
            let idx;
            while ((idx = buffer.indexOf('\n')) >= 0) {
                const line = buffer.slice(0, idx).trim();
                buffer = buffer.slice(idx + 1);

                if (!line) continue;

                const response = JSON.parse(line);
                const handler = this.responseHandlers[response.id];
                if (handler) {
                    handler(response);
                    delete this.responseHandlers[response.id];
                }
            }
        });

        this.serverProcess.stderr.on('data', (data) => {
            LogService.error('Error: ' + data.toString());
        });

        this.serverProcess.on('close', (code) => {
            LogService.error(`Server process exited with code ${code}`);
        });
    }
}

const serverNotStartedMessage = 'Analysis server not started';

const fileNotAnalyzed = 'FILE_NOT_ANALYZED';

module.exports = {
    DartAnalysisServer,
    serverNotStartedMessage,
    fileNotAnalyzed
};