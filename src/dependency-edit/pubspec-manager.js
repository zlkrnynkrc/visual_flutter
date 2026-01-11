const vscode = require('vscode');
const yaml = require('yaml');
const { pubspecPath } = require('../utils/path-provider');

class PubspecManager {

    async readPubspec() {
        if (!pubspecPath()) { return null; }

        try {
            const decoder = new TextDecoder('utf-8');
            const uint8Content =
                await vscode.workspace.fs.readFile(vscode.Uri.file(pubspecPath()));

            return yaml.parse(decoder.decode(uint8Content));
        } catch (error) {
            vscode.window.showInformationMessage('Pubspec error: ' + error + '\n')
        }
    }

    async writePubspec(pubspec) {
        if (!pubspecPath()) { return; }

        try {
            const encoder = new TextEncoder();
            const updatedContent = yaml.stringify(pubspec);
            await vscode.workspace.fs.writeFile(
                vscode.Uri.file(pubspecPath()),
                encoder.encode(updatedContent)
            );
        } catch (error) {
            throw new Error(`Error writing to pubspec.yaml: ${error.message}`);
        }
    }
}

module.exports = PubspecManager;