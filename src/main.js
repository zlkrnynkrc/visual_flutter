const DartAnalyzer = require('./services/dart-analyzer');
const CommandManager = require('./command-manager');
const ProvidersManager = require('./providers-manager');
const EventManager = require('./event-manager');
const LogService = require('./services/log-service');
const { findPaths } = require("./utils/path-provider");
const vscode = require('vscode');

let dartAnalysisServer;

async function activate(context) {
    LogService.log(
        "Visual Flutter extension is activated (workspace: " 
        + vscode.workspace.name + ")"
    );
    await findPaths();

    const commandManager = new CommandManager(context);
    commandManager.registerCommands();

    const providersManager = new ProvidersManager(context);
    providersManager.registerProviders();

    await DartAnalyzer.getInstance().start();
    DartAnalyzer.getInstance().registerSwitchCommands(context);
    dartAnalysisServer = DartAnalyzer.getInstance().analysisServer;

    const eventManager = new EventManager(context, dartAnalysisServer, providersManager);
    eventManager.registerEventListeners();
}

function deactivate() {
    dartAnalysisServer?.stop();
}

module.exports = {
    activate,
    deactivate
};