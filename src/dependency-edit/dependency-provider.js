const vscode = require('vscode');
const { DependencyWebViewHtml, commands } = require('./dependency-html');
const { setOnDidChangeVisibility } = require('../utils/webview-validator');

class DependencyProvider {

    constructor(extensionUri, dependencyService, pubspecManager) {
        this.extensionUri = extensionUri;
        this.dependencyService = dependencyService;
        this.pubspecManager = pubspecManager;
        this.cspSourceDefault = undefined;
        this._view = undefined;
        this.dependencies = [];
    }

    async resolveWebviewView(webviewView) {
        this._view = webviewView;
        this.cspSourceDefault = webviewView.webview.cspSource;
        webviewView.webview.options.localResourceRoots = [this.extensionUri];

        await this.updateWebviewContent();

        webviewView.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                case commands.refresh:
                    this.updateWebviewContent();
                    break;
                case commands.add:
                    this.addDependency();
                    break;
                case commands.remove:
                    this.removeDependency(message.dependency);
                    break;
                case commands.update:
                    this.updateDependency();
                    break;
                case commands.outdated:
                    this.listOutdatedDependencies();
                    break;
            }
        });
        webviewView.webview.options.enableScripts = true;

        setOnDidChangeVisibility(webviewView, () => this.dispose());
    }

    dispose() {
        this._view?.dispose();
    }

    async updateWebviewContent() {
        const pubspec = await this.pubspecManager.readPubspec();
        
        if (!pubspec) { return; }

        this.dependencies = await this.dependencyService.fetchDependencies(pubspec);
        const html = DependencyWebViewHtml.generate(this.dependencies, this.cspSourceDefault);

        if (this._view) {
            this._view.webview.html = html;
        }
    }

    addDependency() {
        vscode.commands.executeCommand('dart.addDependency')
                       .then(() => this.updateWebviewContent());
    }

    removeDependency(dependencyName) {
        // Remove from the in-memory list
        const index = this.dependencies.findIndex((dep) => dep.name === dependencyName);

        if (index === -1) {
            vscode.window.showErrorMessage(`Dependency "${dependencyName}" not found.`);
            return;
        }
        this.dependencies.splice(index, 1);

        // Update pubspec.yaml file
        const pubspec = this.pubspecManager.readPubspec();

        if (!pubspec || !pubspec.dependencies) {
            vscode.window.showErrorMessage('Failed to load pubspec.yaml.');
            return;
        }
        delete pubspec.dependencies[dependencyName];
        this.pubspecManager.writePubspec(pubspec);

        // Refresh the webview with updated in-memory data
        const htmlContent = DependencyWebViewHtml.generate(this.dependencies);
        this._view.webview.html = htmlContent;

        vscode.window.showInformationMessage(`Removed dependency "${dependencyName}".`);
    }

    refresh(dependency) {
        const pubspec = this.pubspecManager.readPubspec();

        if (!pubspec) { return; }

        this.dependencies = pubspec.dependencies;
        pubspec.dependencies[dependency.name] = dependency.latest;
        this.updateWebviewContent();
    }

    updateDependency() {
        vscode.commands.executeCommand('flutter.packages.upgrade');
        /* const terminal = vscode.window.createTerminal({ name: 'List Update Dependencies' });
        terminal.show();
        terminal.sendText('dart pub update'); */
    }

    listOutdatedDependencies() {
        vscode.commands.executeCommand('flutter.packages.outdated');
        /* const terminal = vscode.window.createTerminal({ name: 'List Outdated Dependencies' });
        terminal.show();
        terminal.sendText('dart pub outdated'); */
    }
}

module.exports = DependencyProvider;