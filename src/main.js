const vscode = require('vscode');
const DartAnalyzer = require('./services/dart-analyzer'); 
const CommandManager = require('./command-manager');
const ProvidersManager = require('./providers-manager');
const EventManager = require('./event-manager');
const path = require('path');

let dartAnalysisServer;
let disposable;

async function activate(context) { 
    console.log("Visual Flutter extension is activated");
    vscode.window.showInformationMessage('Activating...');

    const commandManager = new CommandManager(context);
    commandManager.registerCommands(); 
    vscode.window.showInformationMessage('Registered commands');

    const providersManager = new ProvidersManager(context);
    providersManager.registerProviders(); 
    vscode.window.showInformationMessage('Registered providers');

    const projectPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (projectPath) {
        try {
            const pubspecPath = path.join(projectPath, 'pubspec.yaml');
            const exists = await vscode.workspace.fs.stat(vscode.Uri.file(pubspecPath));
            if (exists) {
                vscode.commands.executeCommand('setContext', 'flutterProject', true);
            } else {
                vscode.commands.executeCommand('setContext', 'flutterProject', false);
                providersManager.showInvalidProjectMessages();
            }
        } catch (error) {
            console.error('Error checking pubspec.yaml:', error);
            vscode.commands.executeCommand('setContext', 'flutterProject', false);
            providersManager.showInvalidProjectMessages();
        }
    }

    await DartAnalyzer.getInstance().start(); 
    vscode.window.showInformationMessage('DartAnalyzer started');
    dartAnalysisServer = DartAnalyzer.getInstance().analysisServer;

    const eventManager = new EventManager(context, dartAnalysisServer, providersManager);
    eventManager.registerEventListeners(); 
    vscode.window.showInformationMessage('Registered event listeners');
}

function deactivate() {
    dartAnalysisServer?.kill();
    disposable?.dispose();
}

module.exports = {
    activate,
    deactivate
};
