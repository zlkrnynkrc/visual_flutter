const vscode = require('vscode');
const SdkFinder = require('./dart-sdk-finder');
const DartAnalysisServer = require('./dart-analysis-server');
const FileAnalyzer = require('./file-analyzer');
const { join } = require('path');

class DartAnalyzer {
  constructor() {
    const workspaceFolders = vscode.workspace.workspaceFolders; if (workspaceFolders && workspaceFolders.length > 0) { const workspacePath = workspaceFolders[0].uri.fsPath; vscode.window.showInformationMessage(`Current workspace path: ${workspacePath}`); } else { vscode.window.showInformationMessage('No workspace folder found.'); }
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
    vscode.window.showInformationMessage('sdk fined:'+this.sdkFinder.dartSdkPath+'\n')
    vscode.window.showInformationMessage('sdk fined:'+this.sdkFinder.analysisServerSnapshot+'\n')

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
    vscode.window.showInformationMessage('server started\n')
    
    if (!this.analysisServer) {
      vscode.window.showInformationMessage('cant start server');
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