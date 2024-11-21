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

  isRunning() {
    return !!this.serverProcess;
  }

  sendRequest(request) {
    return new Promise((resolve, reject) => {
      if (!this.serverProcess) {
        reject(new Error('Analysis server not started'));
        return;
      }

      this.responseHandlers[request.id] = resolve;
      this.serverProcess.stdin.write(JSON.stringify(request) + '\n');
    });
  }

  _listen() {
    this.serverProcess.stdout.on('data', (data) => {
      const response = JSON.parse(data.toString());
      const handler = this.responseHandlers[response.id];
      if (handler) {
        handler(response);
        delete this.responseHandlers[response.id];
      }
    });

    this.serverProcess.stderr.on('data', (data) => {
      console.error('Error: ' + data.toString());
    });

    this.serverProcess.on('close', (code) => {
      console.error(`Server process exited with code ${code}`);
    });
  }

  stop() {
    if (this.serverProcess) {
      this.serverProcess.kill();
      this.serverProcess = null;
    }
  }
}

module.exports = DartAnalysisServer;