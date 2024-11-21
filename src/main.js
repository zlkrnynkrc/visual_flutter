const vscode = require('vscode'); 
const DartAnalyzer = require('./services/dart-analyzer');
const ProjectValidator = require('./utils/project-validator');
const CommandManager = require('./command-manager');
const ProvidersManager = require('./providers-manager');
const EventManager = require('./event-manager');

let dartAnalysisServer;
let disposable;

async function activate(context) {
    const commandManager = new CommandManager(context);
    commandManager.registerCommands();

    const providersManager = new ProvidersManager(context);
    providersManager.registerProviders();

    const projectPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!projectPath || !(await ProjectValidator.isValidDartProject(projectPath))) {
        providersManager.showInvalidProjectMessages();
        return;
    }

    await DartAnalyzer.getInstance().start();
    dartAnalysisServer = DartAnalyzer.getInstance().analysisServer;

    const eventManager = new EventManager(context, dartAnalysisServer, providersManager);
    eventManager.registerEventListeners();
}

function deactivate() {
    dartAnalysisServer?.kill();
    disposable?.dispose();
}

module.exports = {
    activate,
    deactivate
};