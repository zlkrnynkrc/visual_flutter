const DartAnalyzer = require('../services/dart-analyzer');
const FileAnalyzer = require('../services/file-analyzer');

class ErrorHandler {

    constructor(error) {
        this._error=error;
        this.handleErrors(this._error)
    }
    async handleErrors(error) {
        switch (error) {
            case 'Analysis server not started': 
                await this.analyzerServerNotStartedHandler();
                break; 
            case 'Analysis server not started': 
                await this.analyzerServerNotStartedHandler();
                break; 
            default:
                break;
        }
    }
    async analyzerServerNotStartedHandler() {
        try {
            const dartAnalyzer = DartAnalyzer.getInstance();
            dartAnalyzer.start();
        } catch (error) {
            console.error('Cant start server:', error);
        }
    }
    async fileNotAnalyzedHandler(filePath) {
        try {
            const fileAnalyzer = FileAnalyzer.getInstance();
            fileAnalyzer.analyzeFile(filePath);
        } catch (error) {
            console.error('Cant start server:', error);
        }
    }
}