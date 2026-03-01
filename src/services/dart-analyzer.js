const vscode = require('vscode');
const SdkFinder = require('./dart-sdk-finder');
const FileAnalyzer = require('./file-analyzer');
const ConfigProvider = require ('../utils/config-provider');
const { LogService } = require('./log-service');
const { DartAnalysisServer } = require('./dart-analysis-server');
const { getLibPath: libPath } = require("../utils/path-provider");

class DartAnalyzer {
    
    constructor() {
        this.analyzedProjectFiles = new Set();
        this.sdkFinder = new SdkFinder();
        this.analysisServer = new DartAnalysisServer();
        this.fileAnalyzer = new FileAnalyzer(this.analysisServer, this.analyzedProjectFiles);
    }

    static serverMustStop = false;

    static commands = {
        start: 'analysisserver.start',
        stop: 'analysisserver.stop'
    };

    static getInstance() {
        if (!this.instance) {
            this.instance = new DartAnalyzer();
        }
        return this.instance;
    }

    async autostart() {
        const canRun = ConfigProvider.configByProperty('autostart', false);
        
        if(canRun) {
            await this.start();
        } else {
            DartAnalyzer.serverMustStop = true;
        }
    }

    async start() {
        if (this.analysisServer.isRunning()) { return; }

        await this.sdkFinder.detectSdks();

        const dartSdkPath = this.sdkFinder.dartSdkPath;
        const analyzerSnapshotPath = this.sdkFinder.analysisServerSnapshot;

        if (!dartSdkPath || !analyzerSnapshotPath) {
            vscode.window.showErrorMessage(
                'Dart SDK or analysis server snapshot not found.'
            );
            return;
        }

        this.analysisServer.start(
            this.sdkFinder.dartSdkExecutable,
            analyzerSnapshotPath
        );
        vscode.window.showInformationMessage('analyze server started\n');

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
        LogService.assert(response);
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
            DartAnalyzer.commands.start, async () => {
                await this._server(must.Start);
                setTimeout(() =>
                    vscode.window.showWarningMessage(
                        'To use Widget Properties ' +
                        'you may reopen active docs.'
                    ),
                    1000
                );
            }
        );
        const stop = vscode.commands.registerCommand(
            DartAnalyzer.commands.stop,
            () => this._server(must.Stop)
        );
        context.subscriptions.push(
            start,
            stop
        );
        this.switchStartStopServerTag();
    }

    stop() {
        vscode.window.showInformationMessage('analyze server will stop\n');
        this.analysisServer.stop();
    }

    async _server(_must) {
        switch (_must) {
            case must.Stop:
                this.stop();
                DartAnalyzer.serverMustStop = true;
                LogService.setCanLog(false);
                break;
            case must.Start:
            default:
                DartAnalyzer.serverMustStop = false;
                LogService.setCanLog(true);
                await this.start();
                break;
        }
        this.switchStartStopServerTag();
    }
}

const must = Object.freeze({
  Start: 'KOS',
  Stop:  'DUR'
});

module.exports = DartAnalyzer;