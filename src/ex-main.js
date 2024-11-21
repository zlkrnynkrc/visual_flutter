 import DependencyEditor from './dependency-edit/dependency-service';

const vscode = require('vscode');
const { join } = require('path');
const DartAnalyzer = require('./services/dart-analyzer');
const WidgetListProvider = require('./widget-list/provider/widget-list-provider');
const WidgetFieldProvider = require('./widget-edit/widget-field-provider');

let dartAnalysisServer;
let widgetFieldProvider;
const dartAnalyzer = DartAnalyzer.getInstance();
let disposable;
async function activate(context) {
    disposable = vscode.commands.registerCommand('extension.widgeteditCommand', () => {
        vscode.window.showInformationMessage('Widget Edit Command executed!');
    });

    const listprovider = new WidgetListProvider(context.extensionUri);
    widgetFieldProvider = new WidgetFieldProvider(context.extensionUri);
    
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('widget-fields-sidebar', widgetFieldProvider)
    );
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('flutter-widget-list', listprovider)
    );
  // var editor=new DependencyEditor();
  //editor.initalize();
    const projectPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!projectPath || !(await isValidDartProject(projectPath))) {
        widgetFieldProvider.showInvalidProjectMessage();
        listprovider.showInvalidProjectMessage();
        return;
    }
    await dartAnalyzer.start();
    dartAnalysisServer = dartAnalyzer.analysisServer;
    try {
        const projectPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        let disposeMesager;
        if (projectPath) {
            const isfoldercompleted = await dartAnalyzer.analyzeProjectFiles(join(projectPath, 'lib'));
            if (!isfoldercompleted) {
                console.log(`Project path:"${join(projectPath, "lib")}" not found. Waiting:"projectpath/lib"`);
                return;
            }
            disposeMesager = vscode.window.onDidChangeActiveTextEditor(async (editor) => {
                if (editor) {
                    const isfileanalyzed = await dartAnalyzer.analyzeProjectFiles(editor.document.uri.fsPath);
                    if (!isfileanalyzed) {
                        console.log(`file is not analyzeble: ${editor.document.uri.fsPath}`);
                    }
                }
            });
            context.subscriptions.push(disposeMesager);
        }

        const changeTextDocumentDisposable = vscode.window.onDidChangeTextEditorSelection(async (event) => {
            const editor = event.textEditor;
            const position = editor.selection.active;
            await getWidgetDescription(editor.document.uri.fsPath, position.line, position.character);
        });
        context.subscriptions.push(changeTextDocumentDisposable);

        let saveTimeout;
        const saveTextDocumentDisposable = vscode.workspace.onDidSaveTextDocument(async (document) => {
            if (saveTimeout) {
                clearTimeout(saveTimeout);
            }
            saveTimeout = setTimeout(() => {
                onDocumentSave(document);
            }, 500);
            await onDocumentSave(document);
        });
        context.subscriptions.push(saveTextDocumentDisposable);

        context.subscriptions.push({
            dispose: () => {
                dartAnalysisServer?.kill();
                disposeMesager?.dispose();
                saveTextDocumentDisposable.dispose();
                listprovider?.disposeProvider();
                widgetFieldProvider?.disposeProvider();
                changeTextDocumentDisposable.dispose();
            }
        });
    } catch (error) {
        console.error(error);
    }
}

async function isValidDartProject(projectPath) {
    const pubspecPath = join(projectPath, 'pubspec.yaml');
    const libPath = join(projectPath, 'lib');

    const pubspecExists = Promise.resolve(vscode.workspace.fs.stat(vscode.Uri.file(pubspecPath)))
        .then(() => true)
        .catch(() => false);

    const libExists = Promise.resolve(vscode.workspace.fs.stat(vscode.Uri.file(libPath)))
        .then(() => true)
        .catch(() => false);

    const results = await Promise.all([pubspecExists, libExists]);
    return results.every(exists => exists);
}

async function onDocumentSave(document) {
    dartAnalyzer.updateContent(document.uri.fsPath, document.getText());
}

async function getWidgetDescription(filePath, line, column) {
    const params = { file: filePath, offset: getOffset(line, column) };
    const request = { id: '1', method: 'flutter.getWidgetDescription', params };

    try {
        const widgetInfo = await dartAnalyzer.sendRequest(request);
        if (widgetInfo.id === '1' && widgetInfo.result) {
            const editor = vscode.window.activeTextEditor;
            const widgetDetail = await getHoverInfo(editor.document, editor.selection.active);
            if (widgetDetail) {
                mergeProperties(widgetInfo, widgetDetail);
                widgetFieldProvider.updateWebview(widgetInfo);
            }
        }
    } catch (err) {
        console.error('Error getting widget description:', err);
    }
}

async function getHoverInfo(document, position) {
    const hoverResponse = await vscode.commands.executeCommand('vscode.executeHoverProvider', document.uri, position);
    console.log(hoverResponse['length']);
    if (!hoverResponse['length']) return null;
    if (Array.isArray(hoverResponse)) {
        console.log(hoverResponse.length);
        if (!hoverResponse.length) return null;
        const hover = hoverResponse[0];
        const range = hover.range;
        for (const hover of hoverResponse) {
            for (const content of hover.contents) {
                const dartString = content instanceof vscode.MarkdownString ? content.value : typeof content === 'string' ? content : null;
                if (dartString) {
                    const widgetDetail = parseWidgetProperties(dartString);
                    if (!widgetDetail) {
                        return null;
                    }
                    if (range) {
                        widgetDetail.start = range.start;
                        widgetDetail.end = range.end;
                    }
                    if (widgetDetail) return widgetDetail;
                }
            }
        }
    }
    return null;
}

function parseWidgetProperties(code) {
    const widgetNameMatch = code.match(/(\w+)\s+(\w+)\(/);
    if (!widgetNameMatch) return null;

    const widgetName = widgetNameMatch[2];
    const properties = [];
    const paramsString = code.match(/\{\s*([^}]*)\}/)?.[1] || '';
    const properties1 = paramsString.split(',').map(param => param.trim());
    properties1.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        const isRequired = trimmedLine.startsWith('required');
        const [nameType, value] = trimmedLine.split('=').map(part => part.trim());
        const [name, type] = nameType.replace('required', '').trim().split(' ').reverse();
        if (name) {
            properties.push({
                required: isRequired,
                name: name,
                type: type,
                value: value?.replace(/^const\s+/, '') ?? null
            });
        }
    });
    return {
        widgetName: widgetName,
        start: null,
        end: null,
        properties
    };
}

function mergeProperties(widgetInfo, widgetDetail) {
    widgetInfo.start = widgetDetail.start;
    widgetInfo.end = widgetDetail.end;
    widgetInfo.name = widgetDetail.widgetName;
    widgetInfo.offset = getOffset(widgetDetail.start.line, widgetDetail.start.character);

    widgetInfo.result.properties.forEach(widget => {
        const matchingDetailProp = widgetDetail.properties.find(prop => prop.name === widget.name);
        if (matchingDetailProp) {
            widget.type = matchingDetailProp.type;
            widget.defvalue = matchingDetailProp.value;
        }
    });
}

function getOffset(line, column) {
    const fileContent = vscode.window.activeTextEditor.document.getText();
    if (!fileContent) throw new Error('File content not found');
    return fileContent.split('\n').slice(0, line).reduce((offset, lineContent) => offset + lineContent.length + 1, 0) + column;
}

function deactivate() {
    if (dartAnalysisServer) {
        dartAnalysisServer.kill();
        disposable.dispose();
    }
}

module.exports = {
    activate,
    deactivate
}; 