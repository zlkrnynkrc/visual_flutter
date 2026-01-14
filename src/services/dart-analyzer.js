const vscode = require('vscode');
const SdkFinder = require('./dart-sdk-finder');
const FileAnalyzer = require('./file-analyzer');
const { DartAnalysisServer } = require('./dart-analysis-server');
const { libPath } = require("../utils/path-provider");
const { assert } = require('console');

class DartAnalyzer {
    
    constructor() {
        this.analyzedProjectFiles = new Set();
        this.config = vscode.workspace.getConfiguration('widgetedit');
        this.sdkFinder = new SdkFinder();
        this.analysisServer = new DartAnalysisServer();
        this.fileAnalyzer = new FileAnalyzer(this.analysisServer, this.analyzedProjectFiles);
    }

    static serverMustStop = false;

    static getInstance() {
        if (!this.instance) {
            this.instance = new DartAnalyzer();
        }
        return this.instance;
    }

    async start() {
        if (this.analysisServer.isRunning()) { return; }

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
        vscode.window.showInformationMessage('analyzer server started\n')

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
        const response = await this.analysisServer.sendRequest(request);
        assert(response);
    }

    async analyzeProjectFiles(files) {
        return this.fileAnalyzer.analyzeProjectFiles(files);
    }

    async analyzeFile(filePath) {
        await this.fileAnalyzer.analyzeFile(filePath);
    }

    switchStartStopServerTag() {
        vscode.commands.executeCommand(
            'setContext', 
            'server:running',
            this.analysisServer.isRunning()
        );
    }

    registerSwitchCommands(context) {
        const start = vscode.commands.registerCommand(
            'analysisserver.start', async () => {
                DartAnalyzer.serverMustStop = false;
                await this.start();
                this.switchStartStopServerTag();
                setTimeout(() =>
                    vscode.window.showWarningMessage(
                        'In order to use Widget Properties ' +
                        'please reopen any docs you want to edit.'
                    ),
                    1000
                );
            }
        )
        const stop = vscode.commands.registerCommand(
            'analysisserver.stop', async () => {
                DartAnalyzer.serverMustStop = true;
                this.stop();
                this.switchStartStopServerTag();
            }
        );
        context.subscriptions.push(
            start,
            stop
        );
        this.switchStartStopServerTag();
    }

    stop() {
        vscode.window.showInformationMessage('analyzer server will stop\n')
        this.analysisServer.stop();
    }
}

module.exports = DartAnalyzer;