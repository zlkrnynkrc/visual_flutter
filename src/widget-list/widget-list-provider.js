const vscode = require('vscode');
const { getNonce, setOnDidChangeVisibility } = require( '../utils/webview-validator');
const { getFlutterWidgetsList } = require('../utils/widget-list');

class WidgetListProvider {

    constructor(extensionUri) {
        this._extensionUri = extensionUri;
        this._view = undefined;
    }

    async resolveWebviewView(webviewView) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = await this._getHtmlContent(webviewView.webview);

        setOnDidChangeVisibility(webviewView, () => this.dispose());
    }

    async _getHtmlContent(webview) {
        const nonce = getNonce();
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'styles.css'));
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'script_list.js'));
        const flutterWidgets = await getFlutterWidgetsList();
        
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy">
            <title>Flutter Widget List</title>
            <link href="${styleUri}" rel="stylesheet">
        </head>
        <body>
            <input type="text" oninput="filterWidgets('widget-item', this.value)" id="searchInput" placeholder="Search widgets..." />
         
            ${flutterWidgets.map(widget => `
                <li class="widget-item" draggable="true" data-widget="${widget.name}" data-template="${widget.template}" title="${widget.template}">
                    <span class="widget-name">${widget.name}</span>
                    <span class="widget-icon">${widget.icon}</span>
                </li>
            `).join('')}
            <script nonce='${nonce}' src="${scriptUri}"></script>
        </body>
        </html>`;
    }

    disposeProvider() {
        this.dispose();
    }

    dispose() {
        this._view?.dispose();
    }

    showInvalidProjectMessage() {
        if (this._view) {
            this._view.webview.html = `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy">
                <title>Widget Properties</title>
            </head>
            <body>
                <h3>Not valid dart project</h3>
            </body>
            </html>`;
        }
    }
}

module.exports = WidgetListProvider;
