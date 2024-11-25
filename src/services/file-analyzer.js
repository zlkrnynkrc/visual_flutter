const fs = require('fs');
const path = require('path');
const vscode = require('vscode');
const { libPath } = require("../utils/path-provider");


class FileAnalyzer {
  constructor(analysisServer, analyzedProjectFiles) {
    this.analysisServer = analysisServer;
    this.analyzedProjectFiles = analyzedProjectFiles;
  }
  static getInstance() {
    if (!this.instance) {
      this.instance = new FileAnalyzer();
    }
    return this.instance;
  }
  async analyzeProjectFiles(projectPath) {
    if (!this.checkLibPath(projectPath)) {
      return false;
    }
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
  }
  async checkLibPath(projectPath) {
    if (!libPath()) {
      return false;
    }
    if (projectPath.startsWith(libPath())) { return true; }
  }
  analyzeFile(filePath) {
    try {
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
      this.analysisServer.sendRequest(request);

      const fileContent = fs.readFileSync(filePath, 'utf8');
      this.analysisServer.sendRequest({
        id: '3',
        method: 'analysis.updateContent',
        params: {
          files: {
            [filePath]: { type: 'add', content: fileContent },
          },
        },
      });
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      vscode.window.showInformationMessage('Analyzing Eror path:' + filePath);
    }
  }
}

module.exports = FileAnalyzer;