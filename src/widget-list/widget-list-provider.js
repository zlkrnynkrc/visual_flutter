const vscode = require('vscode');
const { getNonce, setOnDidChangeVisibility, getCSP, getEmptyHtml, resourceRoots } = require( '../utils/webview-validator');
const { getFlutterWidgetsList } = require('../utils/widget-list');

class WidgetListProvider {

    constructor(extensionUri) {
        this._extensionUri = extensionUri;
        this._cspSourceDefault = undefined;
        this._view = undefined;
    }

    async resolveWebviewView(webviewView) {
        this._view = webviewView;
        this._cspSourceDefault = webviewView.webview.cspSource;

        webviewView.webview.html = getEmptyHtml();
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = await this._getHtmlContent(webviewView.webview);

        setOnDidChangeVisibility(webviewView, () => this.dispose());
    }

    async _getHtmlContent(webview) {
        const nonce = getNonce();
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, resourceRoots, 'styles.css'));
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, resourceRoots, 'script_list.js'));
        const flutterWidgets = await getFlutterWidgetsList();
        const csp = getCSP(nonce, this._cspSourceDefault, false);
        
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
            <input type="text" id="searchInput" placeholder="Search widgets..." />
         
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
            const csp = getCSP(nonce, this._cspSourceDefault);

            this._view.webview.html = `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="${csp}">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
