const vscode = require('vscode');
const { DependencyWebViewHtml, commands } = require('./dependency-html');
const { getEmptyHtml } = require('../utils/webview-validator');

class DependencyProvider {

    constructor(extensionUri, dependencyService, pubspecManager) {
        this.extensionUri = extensionUri;
        this.dependencyService = dependencyService;
        this.pubspecManager = pubspecManager;
        this.dependencies = [];
        this._cspSourceDefault = undefined;
        this._view = undefined;
    }

    async resolveWebviewView(webviewView) {
        this._view = webviewView;
        this._cspSourceDefault = webviewView.webview.cspSource;
        
        webviewView.webview.html = getEmptyHtml();
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.extensionUri]
        };
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
        await this.updateWebviewContent();
    }

    dispose() {
        this._view?.dispose();
    }

    async updateWebviewContent() {
        const pubspec = await this.pubspecManager.readPubspec();
        
        if (!pubspec) { return; }

        this.dependencies = await this.dependencyService.fetchDependencies(pubspec);
        const html = DependencyWebViewHtml.generate(this.dependencies, this._cspSourceDefault);

        if (this._view) {
            this._view.webview.html = html;
        }
    }

    addDependency() {
        vscode.commands.executeCommand('dart.addDependency')
                       .then(() => this.updateWebviewContent());
    }

    async removeDependency(dependencyName) {
        // Remove from the in-memory list
        const index = this.dependencies.findIndex((dep) => dep.name === dependencyName);

        if (index === -1) {
            vscode.window.showErrorMessage(`Dependency "${dependencyName}" not found.`);
            return;
        }
        this.dependencies.splice(index, 1);

        // Update pubspec.yaml file
        const pubspec = await this.pubspecManager.readPubspec();

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

    async refresh(dependency) {
        const pubspec = await this.pubspecManager.readPubspec();

        if (!pubspec) { return; }

        this.dependencies = pubspec.dependencies;
        pubspec.dependencies[dependency.name] = dependency.latest;
        this.updateWebviewContent();
    }

    updateDependency() {
        vscode.commands.executeCommand('flutter.packages.upgrade');
    }

    listOutdatedDependencies() {
        vscode.commands.executeCommand('flutter.packages.outdated');
    }
}

module.exports = DependencyProvider;