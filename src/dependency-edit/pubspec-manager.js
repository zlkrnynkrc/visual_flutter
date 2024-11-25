const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const { pubspecPath } = require("../utils/path-provider");


class PubspecManager {

  async readPubspec() {
    if (!pubspecPath()) return null;

    try {
      const fileContent = fs.readFileSync(pubspecPath(), 'utf8');
      return yaml.parse(fileContent);
    } catch (error) {
      vscode.window.showInformationMessage('Pubspec error:' + error + '\n')
    }
  }

  async writePubspec(pubspec) {
    if (!pubspecPath()) return;

    try {
      const updatedContent = yaml.stringify(pubspec);
      fs.writeFileSync(pubspecPath(), updatedContent, 'utf8');
    } catch (error) {
      throw new Error(`Error writing to pubspec.yaml: ${error.message}`);
    }
  }
}

module.exports = PubspecManager;
