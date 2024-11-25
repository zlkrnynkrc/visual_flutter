const vscode = require('vscode');
const WorkspaceCommand = require('./create-workspace/workspace-command');

class CommandManager {
    constructor(context) {
        this.context = context;
    }

    registerCommands() {
        const perabi = vscode.commands.registerCommand('flutter.per.abi', this.flutterPerAbi);
        const adddependency = vscode.commands.registerCommand('dependencies.add', this.addDependency);

        const createAndApply = vscode.commands.registerCommand(
            "flutter.createWorkspace", WorkspaceCommand.createAndApply);

        this.context.subscriptions.push(
            adddependency,
            perabi,
            createAndApply,
        );

    }

    addDependency() {
        vscode.commands.executeCommand('dart.addDependency');
    }

    flutterPerAbi() {
        const terminal = vscode.window.createTerminal({ name: 'List Update Dependencies' });
        terminal.show();
        terminal.sendText('flutter build apk --split-per-abi');
    }


}


module.exports = CommandManager;