const WorkspaceJsonCreater = require("./workspace-json-creater");
const { projectPath } = require("../utils/path-provider");


const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

class WorkspaceCommand {

    static async createAndApply() {

        if (!projectPath) {
            vscode.window.showErrorMessage("No folder is open in VS Code!");
            return;
        }
        const projectName = path.basename(projectPath);
        const workspaceFileName = `${projectName}.code-workspace`;
        const platforms = ["Android", "iOS", "macOS", "Linux", "Web", "Windows"];
        const selectedPlatform = await vscode.window.showQuickPick(platforms, {
            placeHolder: "Select the platform for your project",
        });

        if (!selectedPlatform) {
            vscode.window.showErrorMessage("No platform selected!");
            return;
        }

        let platformFolders =
            WorkspaceJsonCreater.getplatformFolders(selectedPlatform);
        const baseFolders = [
            {
                name: "Source Code",
                path: "../lib",
            },
            {
                name: "Configs",
                path: "..",
            },
        ];

        // Combine base folders with platform-specific folders
        const platformfile = "**/" + selectedPlatform.toLowerCase() + "";
        const workspaceConfig = {
            folders: [...baseFolders, ...platformFolders],
            settings: {
                "files.exclude": {
                    "**/.git": true,
                    "**/.vscode": true,
                    "**/*.tmp": true,
                    "**/lib": true,
                    [platformfile]: true,
                },
            },
        };

        // Write the workspace configuration to a file
        const workspaceFilePath = path.join(projectPath, ".vscode", workspaceFileName);
        fs.writeFileSync(workspaceFilePath, JSON.stringify(workspaceConfig, null, 2));

        // Open the generated workspace
        const uri = vscode.Uri.file(workspaceFilePath);
        await vscode.commands.executeCommand("vscode.openFolder", uri, false);
    }
}
module.exports = WorkspaceCommand;