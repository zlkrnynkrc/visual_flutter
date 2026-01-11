export function getNonce() {
    let text = "";
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export function setOnDidChangeVisibility(webview, onInvisible) {
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
