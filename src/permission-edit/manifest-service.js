const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { DOMParser } = require('@xmldom/xmldom');

class ManifestService {
    constructor() {
        this.manifestPath = path.join(
            vscode.workspace.rootPath || '',
            'android',
            'app',
            'src',
            'main',
            'AndroidManifest.xml'
        );
    }

    readPermissions() {
        if (!fs.existsSync(this.manifestPath)) {
            vscode.window.showErrorMessage('AndroidManifest.xml not found.');
            return [];
        }
        const content = fs.readFileSync(this.manifestPath, 'utf-8');
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/xml');
        const permissions = Array.from(doc.getElementsByTagName('uses-permission'));
        return permissions.map((node) => node.getAttribute('android:name') || '');
    }

    addPermission(permission) {
        if (!fs.existsSync(this.manifestPath)) {
            vscode.window.showErrorMessage('AndroidManifest.xml not found.');
            return;
        }
        let content = fs.readFileSync(this.manifestPath, 'utf-8');
        if (content.includes(permission)) {
            vscode.window.showWarningMessage('Permission already exists.');
            return;
        }
        const insertPosition = content.indexOf('</manifest>');
        const newPermission = `    <uses-permission android:name="${permission}" />\n`;
        content = content.slice(0, insertPosition) + newPermission + content.slice(insertPosition);
        fs.writeFileSync(this.manifestPath, content, 'utf-8');
        vscode.window.showInformationMessage(`Added permission: ${permission}`);
    }

    removePermission(permission) {
        if (!fs.existsSync(this.manifestPath)) {
            vscode.window.showErrorMessage('AndroidManifest.xml not found.');
            return;
        }
        let content = fs.readFileSync(this.manifestPath, 'utf-8');
        const regex = new RegExp(`\\s*<uses-permission android:name="${permission}" />\\s*`, 'g');
        if (!regex.test(content)) {
            vscode.window.showWarningMessage('Permission not found.');
            return;
        }
        content = content.replace(regex, '');
        fs.writeFileSync(this.manifestPath, content, 'utf-8');
        vscode.window.showInformationMessage(`Removed permission: ${permission}`);
    }
}
module.exports = ManifestService;
