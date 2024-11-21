
const WidgetFieldProvider = require('./widget-edit/widget-field-provider');
const WidgetInfoHandler = require('./handlers/widget-info-handler');
const DocumentSaveHandler = require('./handlers/document-save-handler');
const DartAnalyzer = require('./services/dart-analyzer');
const vscode = require('vscode');

class EventManager {
    constructor(context, dartAnalysisServer, providersManager) {
        this.context = context;
        this.dartAnalysisServer = dartAnalysisServer;
        this.providersManager = providersManager;
    }

    registerEventListeners() {
        this._registerEditorChangeListener();
        this._registerTextSelectionChangeListener();
        this._registerSaveDocumentListener();
        this._registerDisposeListener();
    }

    _registerEditorChangeListener() {
        const disposable = vscode.window.onDidChangeActiveTextEditor(async (editor) => {
            if (editor) {
                const dartAnalyzer = DartAnalyzer.getInstance();
                const isFileAnalyzed = await dartAnalyzer.analyzeProjectFiles(editor.document.uri.fsPath);
                if (!isFileAnalyzed) {
                    console.log(`File is not analyzable: ${editor.document.uri.fsPath}`);
                }
            }
        });
        this.context.subscriptions.push(disposable);
    }

    _registerTextSelectionChangeListener() {
        const disposable = vscode.window.onDidChangeTextEditorSelection(async (event) => {
            const editor = event.textEditor;
            const position = editor.selection.active;
            const widgetInfo = await WidgetInfoHandler.getWidgetDescription(editor.document.uri.fsPath, position.line, position.character);
            WidgetFieldProvider.getInstance(this.context.extensionUri).updateWebview(widgetInfo);
        });
        this.context.subscriptions.push(disposable);
    }

    _registerSaveDocumentListener() {
        const disposable = vscode.workspace.onDidSaveTextDocument(async (document) => {
            await DocumentSaveHandler.onDocumentSave(document);
        });
        this.context.subscriptions.push(disposable);
    }

    _registerDisposeListener() {
        this.context.subscriptions.push({
            dispose: () => {
                this.dartAnalysisServer?.kill();
                this.providersManager.listProvider.disposeProvider();
                this.providersManager.fieldProvider.disposeProvider();
            }
        });
    }
}

module.exports = EventManager;