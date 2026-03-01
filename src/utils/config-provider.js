const vscode = require('vscode');

class ConfigProvider {
    
    static config () {
        return vscode.workspace.getConfiguration('visualFlutter');
    }

    static configByProperty (property, defaultValue) {
        const inspection = this.config().inspect(property);
        const defaultPropertyValue = inspection.defaultValue;
        const value = inspection.workspaceValue
                   ?? inspection.globalValue;
        const result = value !== undefined
                    && value !== defaultPropertyValue ?
            value : defaultValue;
        
        return result;
    }

    static configBySystem (property) {
        return vscode.workspace.getConfiguration().get(property);
    }
}

module.exports = ConfigProvider;