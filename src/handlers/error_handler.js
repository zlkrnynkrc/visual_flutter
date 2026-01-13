const DartAnalyzer = require('../services/dart-analyzer');
const FileAnalyzer = require('../services/file-analyzer');

export class ErrorHandler {

    constructor(error) {
        this._error=error;
        this.handleErrors(this._error)
    }

    async handleErrors(error) {
        switch (error?.message) {
            case 'Analysis server not started': 
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
            console.error('Cant start server: ', error);
        }
    }

    async fileNotAnalyzedHandler(filePath) {
        try {
            if (!DartAnalyzer.serverMustStop) {
                const fileAnalyzer = FileAnalyzer.getInstance();
                await fileAnalyzer.analyzeFile(filePath);
            }
        } catch (error) {
            console.error('Cant start server: ', error);
        }
    }
}