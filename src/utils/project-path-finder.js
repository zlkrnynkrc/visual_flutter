const vscode = require('vscode');
const path = require('path');

let cachedPath = null;

class ProjectMainPath {
    // Async method to find the main project path
    static async getPath() {
        // If path is already cached, return it
        if (cachedPath) {
            return cachedPath;
        }

        const folders = vscode.workspace.workspaceFolders;
        if (!folders || folders.length === 0) {
            return null;
        }

        for (let folder of folders) {
            const projectPath = await this.testPath(folder.uri.fsPath);
            if (projectPath) {
                cachedPath = projectPath;  // Cache the found path
                return projectPath;
            }
        }

        return null;
    }

    // Getter for projectpath that returns the cached path or calls getPath
    static get projectpath() {
        if (cachedPath) {
            return cachedPath;
        }
        return this.getPath();  // If not cached, find the path
    }

    // Recursively checks the parent folders to find a valid Dart project
    static async testPath(folderPath) {
        const isValid = await this.isValidDartProject(folderPath);
        if (isValid) {
            return folderPath;  // Return valid project path
        }

        // Check the parent folder if the current folder is not valid
        const parentFolder = folderPath.split(require('path').sep).slice(0, -1).join(require('path').sep);
        if (parentFolder === folderPath) {
            return null;  // Root folder reached, no valid project
        }

        return this.testPath(parentFolder);  // Recursively check the parent folder
    }
    static async isValidDartProject(projectPath) {
        const pubspecPath = path.join(projectPath, 'pubspec.yaml');
        const libPath = path.join(projectPath, 'lib');

        const pubspecExists = this._fileExists(pubspecPath);
        const libExists = this._fileExists(libPath);

        const results = await Promise.all([pubspecExists, libExists]);
        return results.every(Boolean);
    }

    static async _fileExists(filePath) {
        try {
            return vscode.workspace.fs.stat(vscode.Uri.file(filePath))
                .then(() => true, () => false)
        } catch (e) {
            return false;
        }
    }
}

module.exports = ProjectMainPath;
