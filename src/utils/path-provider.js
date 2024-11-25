const path = require('path');
const ProjectMainPath = require("../utils/project-path-finder");
let pubspecpath;
let projectpath;
let manifestpath;
let libpath;
async function findPaths() {
    projectpath = await ProjectMainPath.getPath()
    pubspecpath = path.join(projectpath, 'pubspec.yaml');
    libpath = path.join(projectpath, 'lib');
    manifestpath = path.join(projectpath,
        'android',
        'app',
        'src',
        'main',
        'AndroidManifest.xml');

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

module.exports = { findPaths, pubspecPath, projectPath, libPath, manifestPath };