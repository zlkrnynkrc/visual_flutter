const vscode = require('vscode');
const SdkFinder = require('./dart-sdk-finder');
const DartAnalysisServer = require('./dart-analysis-server');
const FileAnalyzer = require('./file-analyzer');
const { libPath } = require("../utils/path-provider");


class DartAnalyzer {
  constructor() {
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
    vscode.window.showInformationMessage('anaylzer server started\n')

    if (!this.analysisServer) {
      vscode.window.showErrorMessage('cant start server');
      return;
    }
    await this.analyzeProjectFiles(libPath());
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

  async analyzeProjectFiles(files) {
    return this.fileAnalyzer.analyzeProjectFiles(files);
  }

  analyzeFile(filePath) {
    this.fileAnalyzer.analyzeFile(filePath);
  }
}

module.exports = DartAnalyzer;