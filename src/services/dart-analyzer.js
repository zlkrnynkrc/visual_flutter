const vscode = require('vscode');
const SdkFinder = require('./dart-sdk-finder');
const DartAnalysisServer = require('./dart-analysis-server');
const FileAnalyzer = require('./file-analyzer');
const { join } = require('path');

class DartAnalyzer {
  constructor() {
    const workspaceFolders = vscode.workspace.workspaceFolders; if (workspaceFolders && workspaceFolders.length > 0) { const workspacePath = workspaceFolders[0].uri.fsPath; console.log(`Current workspace path: ${workspacePath}`); } else { console.log('No workspace folder found.'); }
    this.analyzedProjectFiles = new Set();
    this.config = vscode.workspace.getConfiguration('widgetedit');
    this.sdkFinder = new SdkFinder();
    this.analysisServer = new DartAnalysisServer();
    this.fileAnalyzer = new FileAnalyzer(this.analysisServer, this.analyzedProjectFiles);
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new DartAnalyzer();
    }
    return this.instance;
  }

  async start() {
    if (this.analysisServer.isRunning()) return;

    await this.sdkFinder.detectSdks();
    const dartSdkPath = this.sdkFinder.dartSdkPath;
    const analyzerSnapshotPath = this.sdkFinder.analysisServerSnapshot;

    if (!dartSdkPath || !analyzerSnapshotPath) {
      vscode.window.showErrorMessage('Dart SDK or analysis server snapshot not found.');
      return;
    }

    this.analysisServer.start(
      this.sdkFinder.dartSdkExecutable,
      analyzerSnapshotPath
    );
    if (!this.analysisServer) {
      console.log('cant start server');
      return;
    }
    const projectPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath; 
    if (projectPath) { 
      await this.analyzeProjectFiles(join(projectPath, 'lib'));
    }
  }

  async updateContent(filePath, newContent) {
    const params = {
      files: {
        [filePath]: {
          type: 'add',
          content: newContent,
        },
      },
    };
    const request = {
      id: '4',
      method: 'analysis.updateContent',
      params,
    };
    await this.analysisServer.sendRequest(request);
  }

  async analyzeProjectFiles(projectPath) {
    return this.fileAnalyzer.analyzeProjectFiles(projectPath);
  }

  analyzeFile(filePath) {
    this.fileAnalyzer.analyzeFile(filePath);
  }
}

module.exports = DartAnalyzer;

/* const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const SdkFinder = require('./dart-sdk-finder');

class DartAnalyzer {
  constructor() {
    this.analyzedProjectFiles = new Set();
    this.dartSdkPath = null;
    this.analyzerSnapshotPath = null;
    this.responseHandlers = {};
    this.config = vscode.workspace.getConfiguration('widgetedit');
    this.sdkFinder = new SdkFinder();
  }
  static getInstance( ) {
    if (!this.instance) {
        this.instance = new DartAnalyzer( );
    } 
    return this.instance;
}

  async start() {
    if (this.dartAnalysisServer) return;

    await this.sdkFinder.detectSdks();
    this.dartSdkPath = this.sdkFinder.dartSdkPath;
    this.analyzerSnapshotPath = this.sdkFinder.analysisServerSnapshot;

    if (!this.dartSdkPath || !this.analyzerSnapshotPath) {
      vscode.window.showErrorMessage('Dart SDK or analysis server snapshot not found.');
      return;
    }

    const dartExecutablePath = this.sdkFinder.dartSdkExecutable;
    this.dartAnalysisServer = spawn(dartExecutablePath, [this.analyzerSnapshotPath]);
    this.listenDartAnalysisServer();
  }

  listenDartAnalysisServer() {
    this.dartAnalysisServer.stdout.on('data', (data) => {
      const response = JSON.parse(data.toString());
      const handler = this.responseHandlers[response.id];
      if (handler) {
        handler(response);
        delete this.responseHandlers[response.id];
      }
    });

    this.dartAnalysisServer.stderr.on('data', (data) => {
      console.error('Error: ' + data.toString());
    });

    this.dartAnalysisServer.on('close', (code) => {
      console.error(`Server process exited with code ${code}`);
    });
  }

  async updateContent(filePath, newContent) {
    const params = {
      files: {
        [filePath]: {
          type: 'add',
          content: newContent,
        },
      },
    };
    const request = {
      id: '4',
      method: 'analysis.updateContent',
      params: params,
    };
    await this.sendRequest(request);
  }

  async analyzeProjectFiles(projectPath) {
    try {
      const stats = fs.statSync(projectPath);

      if (stats.isFile() && projectPath.endsWith('.dart')) {
        this.analyzeFile(projectPath);
      } else if (stats.isDirectory()) {
        const files = fs.readdirSync(projectPath, { withFileTypes: true });
        for (const file of files) {
          if (file.isFile() && file.name.endsWith('.dart')) {
            const filePath = path.join(projectPath, file.name);
            this.analyzeFile(filePath);
          }
        }
      }
      return true;
    } catch (error) {
      console.error('Error analyzing project files:', error);
      return true;
    }
  }

  analyzeFile(filePath) {
    if (this.analyzedProjectFiles.has(filePath)) return;

    this.analyzedProjectFiles.add(filePath);
    const request = {
      id: '2',
      method: 'analysis.setAnalysisRoots',
      params: {
        included: [filePath],
        excluded: [],
      },
    };
    this.sendRequest(request);
    this.updateContent(filePath, fs.readFileSync(filePath, 'utf8'));
  }

  sendRequest(request) {
    return new Promise((resolve, reject) => {
      if (!this.dartAnalysisServer) {
        reject(new Error('Analysis server not started'));
        return;
      }

      this.responseHandlers[request.id] = resolve;
      this.dartAnalysisServer.stdin.write(JSON.stringify(request) + '\n');
    });
  }
}

module.exports = DartAnalyzer;
 */