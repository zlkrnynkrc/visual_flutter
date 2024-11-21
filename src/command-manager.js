const vscode = require('vscode');
class CommandManager {
    constructor(context) {
        this.context = context;
    }

    registerCommands() {
        const perabi = vscode.commands.registerCommand('flutter.per.abi', this.flutterPerAbi);
        const adddependency = vscode.commands.registerCommand('dependencies.add', this.addDependency);
        const disposable = vscode.commands.registerCommand('extension.widgeteditCommand', () => {
            vscode.window.showInformationMessage('Widget Edit Command executed!');
        });
        this.context.subscriptions.push(disposable, adddependency, perabi);
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