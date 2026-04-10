const path = require("path");
const vscode = require("vscode");
const WorkspaceJsonCreater = require("./workspace-json-creater");
const { getProjectPath } = require("../utils/path-provider");

const platforms = ["Android", "iOS", "macOS", "Linux", "Web", "Windows"];

class WorkspaceCommand {
    static async createAndApply() {
        const projPath = getProjectPath();

        if (!projPath) {
            vscode.window.showErrorMessage("No folder is opened in VS Code!");
            return;
        }
        const projectName = path.basename(projPath);
        const workspaceFileName = `${projectName}.code-workspace`;
        const selectedPlatform = await vscode.window.showQuickPick(platforms, {
            placeHolder: "Select the platform for your project",
        });

        if (!selectedPlatform) {
            vscode.window.showErrorMessage("No platform selected!");
            return;
        }

        let platformFolders =
            WorkspaceJsonCreater.getPlatformFolders(selectedPlatform);
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
        const workspaceFilePath = path.join(projPath, ".vscode", workspaceFileName);
        const encoder = new TextEncoder();
        const content = JSON.stringify(workspaceConfig, null, 2);
        await vscode.workspace.fs.writeFile(
            vscode.Uri.file(workspaceFilePath),
            encoder.encode(content)
        );
        // Open the generated workspace
        const uri = vscode.Uri.file(workspaceFilePath);
        await vscode.commands.executeCommand("vscode.openFolder", uri, false);
    }
}
module.exports = WorkspaceCommand;