const DartAnalyzer = require('../services/dart-analyzer');
const FileAnalyzer = require('../services/file-analyzer');
const LogService = require('../services/log-service');
const { serverNotStartedMessage } = require(
    '../services/dart-analysis-server'
);

class ErrorHandler {

    constructor(error) {
        this._error=error;
        this.handleErrors(this._error)
    }

    async handleErrors(error) {
        switch (error?.message) {
            case serverNotStartedMessage: 
                await this.analyzerServerNotStartedHandler();
                break;
            default:
                break;
        }
    }

    async analyzerServerNotStartedHandler() {
        try {
            if (!DartAnalyzer.serverMustStop) {
                const dartAnalyzer = DartAnalyzer.getInstance();
                await dartAnalyzer.start();
            }
        } catch (error) {
            LogService.error('Cant start server: ', error);
        }
    }

    async fileNotAnalyzedHandler(filePath) {
        try {
            const fileAnalyzer = FileAnalyzer.getInstance();
            DartAnalyzer.serverMustStop ?
                fileAnalyzer.rejectFile(filePath)
            :   await fileAnalyzer.analyzeFile(filePath);
        } catch (error) {
            LogService.error('Cant start server: ', error);
        }
    }
}

module.exports = ErrorHandler;