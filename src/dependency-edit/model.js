const vscode = require('vscode');
 
 
 class Dependency extends vscode.TreeItem {
   constructor(label, currentVersion, collapsibleState, details = null, latestVersion = null) {
     super(label, collapsibleState);
     this.tooltip = `${label} - Current: ${currentVersion}, Latest: ${latestVersion || 'Fetching...'}`;
     this.description = `Current: ${currentVersion}, Latest: ${latestVersion || '...'}`;
     this.details = details;
    }
  }
  
  module.exports = Dependency;