/* const vscode = require('vscode');
const DartAnalyzer = require('../services/dart-analyzer');
const { getHtml, getWebviewContent } = require('../utils/document-formatter');

class WidgetFieldsProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
        this.isUpdatingProperty = false;
    }

    static getInstance(_extensionUri) {
        if (!this.instance) {
            this.instance = new WidgetFieldsProvider(_extensionUri);
        }
        return this.instance;
    }

    resolveWebviewView(webviewView) {
        this.sidebarWebview = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };

        this.sidebarWebview.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'updateProperty') {
                await this.updateWidgetProperty(message);
            }
            if (message.command === 'moveToWidget') {
                this.findFirstOccurrenceFromOffset(message.name, this.widgetInfo?.offset);
            }
        });

        webviewView.webview.html = getHtml();
    }

    updateWebview(widgetInfo) {
        if (!widgetInfo) {
            throw new Error('Method not implemented.');
        }
        this.widgetInfo = widgetInfo;
        this.sidebarWebview.webview.html = getWebviewContent(widgetInfo, this.sidebarWebview.webview, this._extensionUri);
    }

    async updateWidgetProperty(message) {
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
            newCode = this.replaceExistingProperty(widgetText, message);
        } else {
            const insertPosition = this.findInsertPositionForNewProperty(widgetText);
            newCode = this.insertPropertyAtPosition(widgetText, insertPosition, message.propertyName, message.newValue);
        }

        await this.applyEdit(widgetCode, widgetRange, newCode);
        this.isUpdatingProperty = false;
    }

    replaceExistingProperty(widgetText, message) {
        const regex = new RegExp(`${message.propertyName}:\\s*[^,]+`);
        if (message.newValue.length === 0) {
            return widgetText.replace(regex, '');
        } else {
            return widgetText.replace(regex, `${message.propertyName}: ${message.newValue}`);
        }
    }

    async applyEdit(document, range, newText) {
        const edit = new vscode.WorkspaceEdit();
        edit.replace(document.uri, range, newText);

        await vscode.workspace.applyEdit(edit);
        await vscode.commands.executeCommand('editor.action.formatDocument');

        const newDocumentText = document.getText();
        DartAnalyzer.getInstance().updateContent(document.uri.fsPath, newDocumentText);
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

    insertPropertyAtPosition(widgetText, position, property, value) {
        return `${widgetText.slice(0, position)}\n  ${property}: ${value},${widgetText.slice(position)}`;
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
}

module.exports = WidgetFieldsProvider;
 */