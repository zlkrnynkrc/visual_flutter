const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { DOMParser } = require('@xmldom/xmldom');
const { manifestPath } = require("../utils/path-provider");


class ManifestService {

    readPermissions() {
        if (!this.isvalidPath) {
            return;
        }
        const content = fs.readFileSync(manifestPath(), 'utf-8');
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/xml');
        const permissions = Array.from(doc.getElementsByTagName('uses-permission'));
        return permissions.map((node) => node.getAttribute('android:name') || '');

    }

    addPermission(permission) {
        if (!this.isvalidPath) {
            return;
        }
        let content = fs.readFileSync(manifestPath(), 'utf-8');
        if (content.includes(permission)) {
            vscode.window.showWarningMessage('Permission already exists.');
            return;
        }
        const insertPosition = content.indexOf('</manifest>');
        const newPermission = `    <uses-permission android:name="${permission}" />\n`;
        content = content.slice(0, insertPosition) + newPermission + content.slice(insertPosition);
        fs.writeFileSync(manifestPath(), content, 'utf-8');
        vscode.window.showInformationMessage(`Added permission: ${permission}`);
    }

    removePermission(permission) {
        if (!this.isvalidPath) {
            return;
        }
        let content = fs.readFileSync(manifestPath(), 'utf-8');
        const regex = new RegExp(`\\s*<uses-permission android:name="${permission}" />\\s*`, 'g');
        if (!regex.test(content)) {
            vscode.window.showWarningMessage('Permission not found.');
            return;
        }
        content = content.replace(regex, '');
        fs.writeFileSync(manifestPath(), content, 'utf-8');
        vscode.window.showInformationMessage(`Removed permission: ${permission}`);
    }
    isvalidPath() {
        if (!fs.existsSync(manifestPath())) {
            vscode.window.showErrorMessage('AndroidManifest.xml not found.');
            return false;
        }
        return false;
    }
}
module.exports = ManifestService;
