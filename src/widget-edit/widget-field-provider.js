const vscode = require('vscode');
const DartAnalyzer = require('../services/dart-analyzer');
const { getHtml, getWebviewContent } = require('./widget-field-html');
class WidgetFieldProvider {

    constructor(extensionUri) {
        this.extensionUri = extensionUri;
        this._view = null;
        this.isUpdatingProperty = false;
        this.widgetInfo;
        this.disposeMesager;
        this.isautosave = true;
    }

    static getInstance(extensionUri) {
        if (!this.instance) {
            this.instance = new WidgetFieldProvider(extensionUri);
        }
        const config = vscode.workspace.getConfiguration('widgetedit');
        this.instance.isautosave = config.get('autosave');
        return this.instance;
    }

    resolveWebviewView(webviewView) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.extensionUri]
        };
        webviewView.webview.html = getHtml();

        this.disposeMesager = webviewView.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'updateProperty':
                    await this.updateWidgetProperty(message);
                    break;
                case 'colorProperty':
                    await this.updateWidgetProperty(message);
                    break;
                case 'getSuggestions':
                    await this.getSuggestions(message);
                    break;
                case 'moveToWidget':
                    this.findFirstOccurrenceFromOffset(message.name, this.widgetInfo?.offset);
                    break;
                default:
                    vscode.window.showErrorMessage('Error:' + message.newValue);
                    break;
            }
        });

    }

    updateWebview(widgetInfo) {
        if (!widgetInfo || !this._view) return;
        this.widgetInfo = widgetInfo;
        this._view.webview.html = getWebviewContent(widgetInfo, this._view.webview, this.extensionUri);
    }

    async updateWidgetProperty(message) {
        const prop = this.widgetInfo?.result.properties.find(i => i.name === message.propertyName);
        if (this.isUpdatingProperty) return;

        const widgetRange = await this.getWidgetConstructorRange();
        if (!widgetRange) {
            console.error('Failed to determine widget range');
            return;
        }

        const widgetCode = vscode.window.activeTextEditor?.document;
        if (!widgetCode) return;

        let widgetText = widgetCode.getText(widgetRange);
        let newCode = widgetText;
        this.isUpdatingProperty = true;

        if (widgetText.includes(message.propertyName)) {
            newCode = this.replaceExistingProperty(widgetText, message, prop);
        } else {
            const insertPosition = this.findInsertPositionForNewProperty(widgetText);
            const startLine = widgetRange.start.line;
            const lineText = widgetCode.lineAt(startLine).text;
            const lineIndentMatch = lineText.match(/^\s*/);
            const indentation = lineIndentMatch ? lineIndentMatch[0] : '  ';
            newCode = this.insertPropertyAtPosition(widgetText, insertPosition, message.propertyName, message.newValue, indentation);
        }
        await this.applyEdit(widgetCode, widgetRange, newCode);

        if (this.isautosave) {
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor) {
                const document = activeEditor.document;
                document.save();
            }
        } else {
            DartAnalyzer.getInstance().updateContent(widgetCode.uri.fsPath, vscode.window.activeTextEditor?.document.getText());
        }
        this.isUpdatingProperty = false;
    }

    replaceExistingProperty(widgetText, message, prop) {
        const propertyPattern = new RegExp(`(\\s*)${prop.name}\\s*:\\s*[^,()]+(\\([^)]*\\))?(,)?`, 'gm');

        if (message.newValue === "") {
            return widgetText.replace(propertyPattern, '');
        } else {
            const newstr = `$1${prop.name}: ${message.newValue}`;
            return widgetText.replace(propertyPattern, `${newstr},`);
        }
    }

    async applyEdit(document, range, newText) {
        const edit = new vscode.WorkspaceEdit();
        edit.replace(document.uri, range, newText);
        await vscode.workspace.applyEdit(edit);
    }

    async getWidgetConstructorRange() {
        const document = vscode.window.activeTextEditor?.document;
        if (!document || !this.widgetInfo?.offset) return null;

        const startPosition = document.positionAt(this.widgetInfo.offset);
        let currentPosition = document.offsetAt(startPosition) + this.widgetInfo.end.character - this.widgetInfo.start.character;

        let parenDepth = 0;
        while (currentPosition < document.getText().length) {
            const char = document.getText().charAt(currentPosition);
            if (char === '(') {
                parenDepth++;
            } else if (char === ')') {
                parenDepth--;
                if (parenDepth === 0) {
                    return new vscode.Range(startPosition, document.positionAt(currentPosition + 1));
                }
            }
            currentPosition++;
        }
        return null;
    }

    findInsertPositionForNewProperty(widgetText) {
        const match = widgetText.match(/\w+\s*\(/);
        return match ? match.index + match[0].length : 0;
    }

    insertPropertyAtPosition(widgetText, position, property, value, indentation) {
        return `${widgetText.slice(0, position)}\n  ${indentation}${property} : ${value},${widgetText.slice(position)}`;
    }

    findFirstOccurrenceFromOffset(searchText, offset) {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showErrorMessage('No active editor found.');
            return;
        }

        const document = editor.document;
        const documentText = document.getText();
        const textFromOffset = this.getTextFromOffset(documentText, offset);
        const indexInSubstring = this.findTextIndex(textFromOffset, searchText);

        if (indexInSubstring === -1) {
            vscode.window.showInformationMessage(`Text "${searchText}" not found from offset ${offset}.`);
            return;
        }

        this.moveToWidgetName(editor, document, textFromOffset, offset, indexInSubstring, searchText);
    }

    getTextFromOffset(documentText, offset) {
        return documentText.substring(offset);
    }

    findTextIndex(text, searchText) {
        return text.indexOf(searchText);
    }

    moveToWidgetName(editor, document, textFromOffset, offset, indexInSubstring, searchText) {
        let positionInDocument = offset + indexInSubstring + searchText.length;
        const remainingText = textFromOffset.substring(indexInSubstring + searchText.length);

        const widgetName = this.extractWidgetName(remainingText);
        if (widgetName) {
            this.moveCursorToPosition(editor, document, positionInDocument, remainingText, widgetName);
        }
    }

    extractWidgetName(text) {
        const widgetNameRegex = /\bconst\s+([A-Za-z_]\w*)\b|\b([A-Za-z_]\w*)\b/g;
        const match = widgetNameRegex.exec(text);
        return match ? (match[1] || match[2]) : null;
    }

    moveCursorToPosition(editor, document, positionInDocument, text, widgetName) {
        const widgetNameIndex = text.indexOf(widgetName);

        if (widgetNameIndex !== -1) {
            positionInDocument += widgetNameIndex + 1;
            const position = document.positionAt(positionInDocument);

            editor.selection = new vscode.Selection(position, position);
            editor.revealRange(new vscode.Range(position, position));
            vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup');
        }
    }

    async getSuggestions(message) {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const position = editor.selection.active;
            const document = editor.document;

            const completionList = await vscode.commands.executeCommand(
                'vscode.executeCompletionItemProvider',
                document.uri,
                position
            );
            if (message.value?.trim().length === 0) {
                return;
            }
            if (completionList && completionList['items']) {
                return;
            }
            const suggestions = completionList['items']
                .filter(item => {
                    const label = item.label.toString().toLowerCase();
                    const value = message.value.toLowerCase();
                    return label.startsWith(value);
                })
                .map(item => item.label.toString());

            this.updateSuggestions(suggestions, message.datalistid);
        }
    }

    updateSuggestions(suggestions, datalistid) {
        if (this._view) {
            this._view.webview.postMessage({ command: 'updateSuggestions', suggestions, inputId: datalistid });
        }
    }

    disposeProvider() {
        this.dispose();
    }

    dispose() {
        this._view.dispose();
    }

    showInvalidProjectMessage() {
        this._view.webview.html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Widget Properties</title>
        </head>
        <body> 
            <h3>Not valid dart project</h3>
        </body>
        </html`;
    }
}

module.exports = WidgetFieldProvider;