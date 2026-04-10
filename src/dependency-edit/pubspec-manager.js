const vscode = require('vscode');
const yaml = require('yaml');
const { getPubspecPath } = require('../utils/path-provider');

class PubspecManager {

    async readPubspec() {
        if (!getPubspecPath()) { return null; }

        try {
            const decoder = new TextDecoder('utf-8');
            const uint8Content =
                await vscode.workspace.fs.readFile(vscode.Uri.file(getPubspecPath()));

            return yaml.parse(decoder.decode(uint8Content));
        } catch (error) {
            vscode.window.showInformationMessage('Pubspec error: ' + error + '\n');
        }
    }

    async writePubspec(pubspec) {
        if (!getPubspecPath()) { return; }

        try {
            const encoder = new TextEncoder();
            const updatedContent = yaml.stringify(pubspec);
            await vscode.workspace.fs.writeFile(
                vscode.Uri.file(getPubspecPath()),
                encoder.encode(updatedContent)
            );
        } catch (error) {
            throw new Error(`Error writing to pubspec.yaml: ${error.message}`);
        }
    }
}

module.exports = PubspecManager;