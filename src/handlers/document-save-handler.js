const DartAnalyzer = require('../services/dart-analyzer');

class DocumentSaveHandler {
    static async onDocumentSave(document) {
        const dartAnalyzer = DartAnalyzer.getInstance();
        dartAnalyzer.updateContent(document.uri.fsPath, document.getText());
    }
}

module.exports = DocumentSaveHandler;