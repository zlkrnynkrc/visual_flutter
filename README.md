# Visual Flutter properties README

This extension enhances the Flutter development experience in VS Code by allowing you to drag and drop widgets directly into the editor as text. When the cursor is placed on a widget name, the extension displays all the properties of the widget, which can be easily edited in the sidebar. To ensure changes are accurately reflected, the file must be saved after manual edits before using the showing and editing features.

## Features

- **Drag and Drop Widgets from sidebar:** Easily drag and drop Flutter widgets into your editor as text.
![Demo](https://github.com/zlkrnynkrc/flutterwidgetlistedit/blob/main/widget_list.gif?raw=true) 
- **Search custom widgets and show on sidebar:** Searches project and list stateless widgets whoose name ends with "*CW" list on sidebar. drag and drop custom widgets into your editor as text as well.
- **Edit dependency from sidebar:** The extension automatically gets pubspec.yml file and can edit without opening file.If you use not standart pubspec not works.Also show current version and latest version of dependecies.* some dependencies may not works with latest other dependencies or flutter current version.
- **Edit permisions from sidebar:** The extension gets android manifest file shows wihch permissions tha app uses and edit from sidebar. you can search and select permissions from list.If you use not standart manifest may conflits.
- **Widget Fiels Display:** When your cursor is on a widget name, all its properties are displayed in the sidebar.
- **Sidebar Editing:** Edit widget properties directly from the sidebar.
![Demo](https://github.com/zlkrnynkrc/flutterwidgetlistedit/blob/main/widget_prop.gif?raw=true) 
- **Auto-Detection:** The extension automatically detects the Dart SDK location, prompting the user to specify it if not found.
- **Builds per abi command:** Added flutter per abi command for build.
- **Simplify Workspace command:** Added Simplify Workspace command. Simplfy file explorer for selected platform. You can edit or delete from "your_project_path/.vscode/your_project_name.code-workspace".
- **Both visible on explorer and self bar:** 

## Requirements

This extension requires the following dependencies:

- **Dart SDK:** The Dart SDK must be added to your system's environment variables. The extension will prompt you to specify its location if it's not detected.
- **Dart Analysis Server:** Ensure that the Dart Analysis Server is installed for the extension to function correctly.

## Extension Settings

This extension contributes the following settings:



## Known Issues

- The file must be saved after manual edits for the extension's property display and editing features to work correctly.
- Specify the path to the Dart SDK and Dart snapshot file. 
- Need to save after editing on texteditor.
- Some property are not supported,e.g: styes,key. 

## Release Notes

### 0.0.3
- fixed cant find project folder when custom workspace.(multi workspace may not supported)
- Added Simplify Workspace command. Simplfy file explorer for selected platform. You can edit or delete from "your_project_path/.vscode/your_project_name.code-workspace".
### 0.0.2
- Fixed package issue
### 0.0.1

Update flutter widgets list and edit
- Color picker need to press enter after selected color.
- Fixed edgeinsets
- Added settings for autosave, dart path,dart snapshot path.
Run the command using the Command Palette (press Ctrl+Shift+P or Cmd+Shift+P on macOS),then type widgetedit. If no command type below to settings.json
    "visual_flutter.autosave": true, //true for autosave
    "visual_flutter.dartpath": "/path/to/dart-sdk", // where dart sdk path is
    "visual_flutter.dartsnapshot": "/path/to/dart-snapshot", // where dart snapshot path is

Initials

- Drag from list and drop Flutter widgets as text.
- Display and edit widget properties in the sidebar.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**