const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
const vscode = require('vscode');
 
const isWin = process.platform === 'win32';
const isMac = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

 const executableNames = {
  dart: isWin ? 'dart.exe' : 'dart',
  flutter: isWin ? 'flutter.bat' : 'flutter',
  analysisServerSnapshot: 'analysis_server.dart.snapshot',
  flutterExecutable: isWin ? 'flutter.bat' : 'flutter',
};

 class SdkFinder {
  constructor() {
    this.dartSdk = null;
    this.flutterSdk = null;
    this.aSSnapshot = null;
  }

  detectSdkFromEnv() {
    const dartSdkFromEnv = process.env.DART_SDK;
    const flutterSdkFromEnv = process.env.FLUTTER_SDK;

    if (dartSdkFromEnv) {
      this.dartSdk = this.normalizeSdkPath(dartSdkFromEnv);
    }

    if (flutterSdkFromEnv) {
      this.flutterSdk = this.normalizeSdkPath(flutterSdkFromEnv);
      this.aSSnapshot = path.join(this.flutterSdk, 'cache/dart-sdk/bin/snapshots', executableNames.analysisServerSnapshot);
    }
  }

   detectSdkFromVscode() {
    const dartSdkFromVscode = vscode.workspace.getConfiguration().get('dart.sdkPath');
    const flutterSdkFromVscode = vscode.workspace.getConfiguration().get('flutter.sdkPath');

    if (dartSdkFromVscode) {
      this.dartSdk = this.normalizeSdkPath(dartSdkFromVscode);
    }

    if (flutterSdkFromVscode) {
      this.flutterSdk = this.normalizeSdkPath(flutterSdkFromVscode);
      this.aSSnapshot = path.join(this.flutterSdk, 'cache/dart-sdk/bin/snapshots', executableNames.analysisServerSnapshot);
    }
    
  }

  normalizeSdkPath(sdkPath) {
    if (!sdkPath) return null;

    const sdkBinPath = path.join(sdkPath, 'bin');
    if (fs.existsSync(sdkBinPath)) {
      return sdkPath;  
    }
 
    return sdkPath;  
  }
  async detectSdkUsingWhich() {
    try {
      const dartCmd = isWin ? 'where dart' : 'which dart';
      const flutterCmd = isWin ? 'where flutter' : 'which flutter';

      const dartSdk = await this.runCommand(dartCmd);
      const flutterSdk = await this.runCommand(flutterCmd);

      if (dartSdk) {
        this.dartSdk = this.normalizeSdkPath(path.dirname(dartSdk));
      }

      if (flutterSdk) {
        this.flutterSdk = this.normalizeSdkPath(path.dirname(flutterSdk));
        this.aSSnapshot = path.join(this.flutterSdk, 'cache/dart-sdk/bin/snapshots', executableNames.analysisServerSnapshot);
     
      }
    } catch (error) {
      console.error('Error while running `which`/`where` commands:', error);
    }
  }
 
  runCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error || stderr) {
          reject(error || stderr);
        } else {
          resolve(stdout.trim());
        }
      });
    });
  }
 
  checkDartSdk(sdkPath) {
    const dartPath = path.join(sdkPath, executableNames.dart);
    return fs.existsSync(dartPath);
  }
 
  checkFlutterSdk(sdkPath) {
    const flutterPath = path.join(sdkPath, executableNames.flutter);
    return fs.existsSync(flutterPath);
  }
 
  checkAnalysisServerSnapshot(sdkPath) {
    this.aSSnapshot = path.join(sdkPath, 'cache/dart-sdk/bin/snapshots', executableNames.analysisServerSnapshot);
    return fs.existsSync(this.aSSnapshot);
  }
 
  get dartSdkPath() {
    return this.dartSdk;
  }
  get dartSdkExecutable() {
    return path.join(this.dartSdk,executableNames.dart);
  }
 
  get flutterSdkPath() {
    return this.flutterSdk;
  }
  get flutterSdkExecutable() {
    return path.join(this.dartSdk,executableNames.flutter);
  }

  get analysisServerSnapshot() {
    return this.aSSnapshot;
  }

  // Method to initiate the SDK detection process
  async detectSdks() {
    this.detectSdkFromEnv();
    this.detectSdkFromVscode();
    await this.detectSdkUsingWhich(); 
  }
}
 
module.exports = SdkFinder;