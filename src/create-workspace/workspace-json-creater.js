class WorkspaceJsonCreater {

    static getplatformFolders(selectedPlatform) {
        let platformFolders;
        let fname;
        let fpath;
        let cname;
        let cpath;
        switch (selectedPlatform) {
            case "Android":
                fname = "Android Files";
                fpath = "../android";
                cname = "Android Configs";
                cpath = "../android/app/src/main";
                break;
            case "iOS":
                fname = "iOS Files";
                fpath = "../ios";
                cname = "iOS Configs";
                cpath = "../ios/Runner";
                break;
            case "Web":
                fname = "Web Files";
                fpath = "../web";
                cname = "icons";
                cpath = "../icons";
                break;
            case "Linux":
                fname = "Linux Files";
                fpath = "../linux";
                cname = "Linux Flutter";
                cpath = "../linux/flutter";
                break;
            case "Windows":
                fname = "Windows Files";
                fpath = "../windows";
                cname = "Windows Runner";
                cpath = "../windows/runner";
                break;
            case "macOS":
                fname = "macOS Files";
                fpath = "../macos";
                cname = "macOS Runner";
                cpath = "../macos/runner";
                break;
            default:
                platformFolders = [];
                return platformFolders;
        }
        platformFolders = [
            {
                name: fname,
                path: fpath,
            },
            {
                name: cname,
                path: cpath,
            },
        ];
        return platformFolders;

    }
    static getSettings(selectedPlatform) {
        let settings;
        let fname;
        switch (selectedPlatform) {
            case "Android":
                fname = "**/" + selectedPlatform + "}";
                break;
            case "iOS":
                fname = "iOS Files";
                break;
            case "Web":
                fname = "Web Files";
                break;
            case "Linux":
                fname = "Linux Files";
                break;
            case "Windows":
                fname = "Windows Files";
                break;
            case "macOS":
                fname = "macOS Files";
                break;
            default:
                settings = [];
                return settings;
        }
        settings = {
            "files.exclude": {
                "**/.git": true,
                "**/.vscode": true,
                "**/*.tmp": true,
                "**/lib": true,
                fname: true,
            },
        };
        return settings;

    }
}
module.exports = WorkspaceJsonCreater;