const path = require('path');
const vscode = require('vscode');
const { libPath, fileStat } = require("../utils/path-provider");

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
        const isFile = (statType) => statType === vscode.FileType.File;
        const isDirectory = (statType) => statType === vscode.FileType.Directory;

        if (! await this.checkLibPath(projectPath)) {
            return false;
        }
        const stat = await fileStat(projectPath);

        if (isFile(stat.type) && projectPath.endsWith('.dart')) {
            this.analyzeFile(projectPath);
        } else if (isDirectory(stat.type)) {
            const files = await vscode.workspace.fs.readDirectory(vscode.Uri.file(projectPath));

            for (const [filename, filetype] of files) {
                if (isFile(filetype) && filename.endsWith('.dart')) {
                    const filePath = path.join(projectPath, filename);
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

    async analyzeFile(filePath) {
        try {
            if (this.analyzedProjectFiles.has(filePath)) { return; }

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

            const decoder = new TextDecoder('utf-8');
            const uint8Content =
                await vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
            const fileContent = decoder.decode(uint8Content);

            this.analysisServer.sendRequest({
                id: '3',
                method: 'analysis.updateContent',
                params: {
                    files: {
                        [filePath]: { type: 'add', content: fileContent },
                    },
                },
            });
        } catch {
            vscode.window.showInformationMessage('Analyzing Eror path: ' + filePath);
        }
    }
}

module.exports = FileAnalyzer;