const vscode = require('vscode');
const { DOMParser } = require('@xmldom/xmldom');
const { manifestPath, fileExists } = require("../utils/path-provider");

class ManifestService {
    
    async readPermissions() {
        if (! await this.isValidPath()) { return; }

        const decoder = new TextDecoder('utf-8');
        const uint8Content =
            await vscode.workspace.fs.readFile(vscode.Uri.file(manifestPath()));
        const content = decoder.decode(uint8Content);
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/xml');
        const permissions = Array.from(doc.getElementsByTagName('uses-permission'));
        
        return permissions.map((node) => node.getAttribute('android:name') || '');
    }

    async addPermission(permission) {
        if (! await this.isValidPath()) { return; }

        const decoder = new TextDecoder('utf-8');
        const uint8Content =
                await vscode.workspace.fs.readFile(vscode.Uri.file(manifestPath()));
        let content = decoder.decode(uint8Content);

        if (content.includes(permission)) {
            vscode.window.showWarningMessage('Permission already exists.');
            return;
        }
        const insertPosition = content.indexOf('</manifest>');
        const newPermission = `    <uses-permission android:name="${permission}" />\n`;
        content = content.slice(0, insertPosition) + newPermission + content.slice(insertPosition);

        const encoder = new TextEncoder();
        await vscode.workspace.fs.writeFile(
            vscode.Uri.file(manifestPath()),
            encoder.encode(content)
        );
        vscode.window.showInformationMessage(`Added permission: ${permission}`);
    }

    async removePermission(permission) {
        if (! await this.isValidPath()) { return; }

        const decoder = new TextDecoder('utf-8');
        const uint8Content =
                await vscode.workspace.fs.readFile(vscode.Uri.file(manifestPath()));
        let content = decoder.decode(uint8Content);
        const regex = new RegExp(`\\s*<uses-permission android:name="${permission}" />\\s*`, 'g');
        
        if (!regex.test(content)) {
            vscode.window.showWarningMessage('Permission not found.');
            return;
        }
        content = content.replace(regex, '');

        const encoder = new TextEncoder();
        await vscode.workspace.fs.writeFile(
            vscode.Uri.file(manifestPath()),
            encoder.encode(content)
        );
        vscode.window.showInformationMessage(`Removed permission: ${permission}`);
    }

    async isValidPath() {
        const path = manifestPath();
        const existingManifest = path.trim() !== '' && await fileExists(path);

        if (!existingManifest) {
            if (vscode.workspace.workspaceFolders?.length > 0) {
                vscode.window.showErrorMessage('AndroidManifest.xml not found.');
            }
            return false;
        }
        return true;
    }
}

module.exports = ManifestService;