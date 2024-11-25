const vscode = require('vscode');
const DartAnalyzer = require('./services/dart-analyzer');
const CommandManager = require('./command-manager');
const ProvidersManager = require('./providers-manager');
const EventManager = require('./event-manager');
const { findPaths, projectPath, pubspecPath } = require("./utils/path-provider");

let dartAnalysisServer;
let disposable;

async function activate(context) {
    console.log("Visual Flutter extension is activated");
    await findPaths();
    const commandManager = new CommandManager(context);
    commandManager.registerCommands();

    const providersManager = new ProvidersManager(context);
    providersManager.registerProviders();
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
