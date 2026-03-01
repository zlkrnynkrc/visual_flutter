const vscode = require('vscode');
const { getNonce, setOnDidChangeVisibility, getCSP } = require( '../utils/webview-validator');
const { getFlutterWidgetsList } = require('../utils/widget-list');

class WidgetListProvider {

    constructor(extensionUri) {
        this._extensionUri = extensionUri;
        this.cspSourceDefault = undefined;
        this._view = undefined;
    }

    async resolveWebviewView(webviewView) {
        this._view = webviewView;
        this.cspSourceDefault = webviewView.webview.cspSource;

        webviewView.webview.options.localResourceRoots = [this._extensionUri];
        webviewView.webview.options.enableScripts = true;
        webviewView.webview.html = await this._getHtmlContent(webviewView.webview);

        setOnDidChangeVisibility(webviewView, () => this.dispose());
    }

    async _getHtmlContent(webview) {
        const nonce = getNonce();
        const folder = 'media';
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, folder, 'styles.css'));
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, folder, 'script_list.js'));
        const flutterWidgets = await getFlutterWidgetsList();
        const csp = getCSP(nonce, this.cspSourceDefault, false);
        
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="${csp}">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
            const nonce = getNonce();
            const csp = getCSP(nonce, this.cspSourceDefault);

            this._view.webview.html = `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="${csp}">
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
