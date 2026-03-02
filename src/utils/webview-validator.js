function getNonce() {
    let text = "";
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function setOnDidChangeVisibility(webview, onInvisible) {
    let visible = false;
    let timeout = 100;

    webview.onDidChangeVisibility(() =>
        setTimeout(() => {
            if (webview && visible !== webview.visible) {
                visible = webview.visible;
                if (!visible) {
                    onInvisible?.();
                }
            }
        }, timeout)
    );
}

function getCSP(nonce, cspSource, unsafeScript = false) {
    return [
        `default-src 'none'`,
        unsafeScript ?
            `script-src ${cspSource} 'unsafe-inline'`
        :   `script-src 'nonce-${nonce}' ${cspSource}`,
        `style-src 'nonce-${nonce}' ${cspSource} 'unsafe-inline'`,
        `img-src ${cspSource} blob: data: https:`,
        `frame-src ${cspSource} blob: data:`,
        `worker-src blob: ${cspSource}`,
        `connect-src ${cspSource} https: http://localhost:* http://127.0.0.1:*`
    ].join("; ");
}

function getEmptyHtml() {
    const nonce = getNonce();
    const csp = getCSP(nonce, this._cspSourceDefault, false);

    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="${csp}">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Widget Properties</title>
        </head>
        <body>
            <h3> </h3>
        </body>
        </html>`;
}

const resourceRoots = 'media';

module.exports = { getNonce, getCSP, setOnDidChangeVisibility, getEmptyHtml, resourceRoots };
