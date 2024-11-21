const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

class PubspecManager {
  constructor(workspaceFolders) {
    this.workspaceFolders = workspaceFolders;
  }

  getPubspecPath() {
    if (!this.workspaceFolders) return null;
    return path.join(this.workspaceFolders[0].uri.fsPath, 'pubspec.yaml');
  }

  readPubspec() {
    const pubspecPath = this.getPubspecPath();
    if (!pubspecPath) return null;

    try {
      const fileContent = fs.readFileSync(pubspecPath, 'utf8');
      return yaml.parse(fileContent);
    } catch (error) {
      throw new Error(`Error reading pubspec.yaml: ${error.message}`);
    }
  }

  writePubspec(pubspec) {
    const pubspecPath = this.getPubspecPath();
    if (!pubspecPath) return;

    try {
      const updatedContent = yaml.stringify(pubspec);
      fs.writeFileSync(pubspecPath, updatedContent, 'utf8');
    } catch (error) {
      throw new Error(`Error writing to pubspec.yaml: ${error.message}`);
    }
  }
}

module.exports = PubspecManager;
