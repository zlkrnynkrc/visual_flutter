const path = require('path');
const vscode = require('vscode');
const ProjectMainPath = require("../utils/project-path-finder");

let pubspecpath;
let projectpath;
let manifestpath;
let libpath;

async function findPaths() {
    projectpath = await ProjectMainPath.getPath()
    pubspecpath = projectpath ? path.join(projectpath, 'pubspec.yaml') : '';
    libpath = projectpath ? path.join(projectpath, 'lib') : null;
    manifestpath = projectpath ? path.join(projectpath,
        'android',
        'app',
        'src',
        'main',
        'AndroidManifest.xml')
    : '';
}
function pubspecPath() {
    return pubspecpath;
}
function projectPath() {
    return projectpath;
}
function libPath() {
    return libpath;
}
function manifestPath() {
    return manifestpath;
}

async function fileStat(filePath) {
    return await vscode.workspace.fs.stat(vscode.Uri.file(filePath));
}

async function fileExists(filePath) {
    try {
        await fileStat(filePath);

        return true;
  } catch (err) {
    if (err instanceof vscode.FileSystemError && err.code === 'FileNotFound') {
      return false;
    }
    throw err;
  }
}

module.exports = { fileExists, fileStat, findPaths, pubspecPath, projectPath, libPath, manifestPath };