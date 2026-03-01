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

function getCSP(nonce, cspSource, unsafeStyle = true) {
    return [
    `default-src 'none'`,
    `script-src 'nonce-${nonce}' ${cspSource}`,
    unsafeStyle ?
        `style-src 'nonce-${nonce}' ${cspSource} 'unsafe-inline'`
    :   `style-src ${cspSource}`,
    `img-src ${cspSource} blob: data: https:`,
    `frame-src ${cspSource} blob: data:`,
    `worker-src blob: ${cspSource}`,
    `connect-src ${cspSource} https: http://localhost:* http://127.0.0.1:*`
  ].join("; ");
}

module.exports = { getNonce, getCSP, setOnDidChangeVisibility };
