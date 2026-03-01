const path = require('path');
const vscode = require('vscode');

let libPath;
let manifestPath;
let pubspecPath;
let projectPath;
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

        const pubspecExists = fileExists(pubspecPath, false);
        const libExists = fileExists(libPath, false);

        const results = await Promise.all([pubspecExists, libExists]);
        return results.every(Boolean);
    }
}

function getPubspecPath() {
    return pubspecPath;
}

function getProjectPath() {
    return projectPath;
}

function getLibPath() {
    return libPath;
}

function getManifestPath() {
    return manifestPath;
}

async function findPaths() {
    projectPath = await ProjectMainPath.getPath();
    pubspecPath = projectPath ? path.join(projectPath, 'pubspec.yaml') : '';
    libPath = projectPath ? path.join(projectPath, 'lib') : null;
    manifestPath = projectPath ? path.join(projectPath,
        'android',
        'app',
        'src',
        'main',
        'AndroidManifest.xml')
        : '';
}

async function fileExists(filePath, throwable = true) {
    try {
        await fileStat(filePath);
        
        return true;
    } catch (err) {
        if (err instanceof vscode.FileSystemError && err.code === 'FileNotFound') {
            return false;
        }
        if (throwable) { throw err; }
        else { return false; }
    }
}

async function fileStat(filePath) {
    return await vscode.workspace.fs.stat(vscode.Uri.file(filePath));
}

module.exports = { fileExists, fileStat, findPaths, getPubspecPath, getProjectPath, getLibPath, getManifestPath };