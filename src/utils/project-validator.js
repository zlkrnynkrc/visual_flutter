const { join } = require('path');
const vscode = require('vscode');

class ProjectValidator {
    static async isValidDartProject(projectPath) {
        const pubspecPath = join(projectPath, 'pubspec.yaml');
        const libPath = join(projectPath, 'lib');

        const pubspecExists = ProjectValidator._fileExists(pubspecPath);
        const libExists = ProjectValidator._fileExists(libPath);

        const results = await Promise.all([pubspecExists, libExists]);
        return results.every(Boolean);
    }

    static async _fileExists(filePath) {
        try {
            return vscode.workspace.fs.stat(vscode.Uri.file(filePath))
                .then(() => true)
        } catch (e) {
            return false;
        }
    }
}
module.exports = ProjectValidator;