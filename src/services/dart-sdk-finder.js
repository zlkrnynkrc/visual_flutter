const path = require('path');
const exec = require('child_process').exec;
const ConfigProvider = require ('../utils/config-provider');
const { LogService } = require('../services/log-service');
const { fileExists } = require('../utils/path-provider');

const isWin = process.platform === 'win32';
const executableNames = {
    dart: isWin ? 'dart.exe' : 'dart',
    flutter: isWin ? 'flutter.bat' : 'flutter',
    analysisServerSnapshot: 'analysis_server.dart.snapshot',
    flutterExecutable: isWin ? 'flutter.bat' : 'flutter',
};

class SdkFinder {

    constructor() {
        this.dartSdk = null;
        this.dartFromFlutterSDK = null;
        this.flutterSdk = null;
        this.aSSnapshot = null;
    }

    async detectSdkFromEnv() {
        const dartSdkFromEnv = process.env.DART_SDK;
        const flutterSdkFromEnv = process.env.FLUTTER_SDK;

        if (dartSdkFromEnv) {
            this.dartSdk ??= await this.normalizeDartSdkPath(dartSdkFromEnv);
        }

        if (flutterSdkFromEnv) {
            this.flutterSdk ??= await this.normalizeSdkPath(flutterSdkFromEnv);
            this.dartFromFlutterSDK ??= await this.normalizeDartSdkPath(flutterSdkFromEnv);
            this.aSSnapshot ??= path.join(this.flutterSdk,
                'cache/dart-sdk/bin/snapshots',
                executableNames.analysisServerSnapshot
            );
        }
    }

    async detectSdkFromVscode() {
        const dartSdkFromVscode =
            ConfigProvider.configBySystem('dart.sdkPath')
         ?? ConfigProvider.configByProperty('dartPath');

        const flutterSdkFromVscode = ConfigProvider.configBySystem('flutter.sdkPath');

        if (dartSdkFromVscode) {
            this.dartSdk ??= await this.normalizeDartSdkPath(dartSdkFromVscode);
        }

        if (flutterSdkFromVscode) {
            this.flutterSdk ??= await this.normalizeSdkPath(flutterSdkFromVscode);
            this.dartFromFlutterSDK ??= await this.normalizeDartSdkPath(flutterSdkFromVscode);
            this.aSSnapshot ??= await this.normalizeSnapshotsPath();
        }
    }

    async normalizeSdkPath(sdkPath) {
        if (!sdkPath) { return null; }

        const sdkBinPath = path.join(sdkPath, 'bin');

        if (await fileExists(sdkBinPath)) {
            return sdkPath;
        }

        return sdkPath;
    }

    async normalizeSnapshotsPath() {
        if (!this.dartFromFlutterSDK) {
            const path = ConfigProvider.configByProperty('dartSnapshot') ?? '_';
            
            return await fileExists(path) ? path : null; 
        }

        const snapPath = path.join(this.dartFromFlutterSDK,
            'snapshots',
            executableNames.analysisServerSnapshot
        );

        if (await fileExists(snapPath)) {
            return snapPath;
        }

        return path.join(this.dartSdk, 'snapshots', executableNames.analysisServerSnapshot);
    }

    async normalizeDartSdkPath(sdkPath) {
        if (!sdkPath) { return null; }

        const singleBinPath = sdkPath
            .split(/\r?\n/)
            .map(line => line.trim())
            .sort((a, b) => {
                const aHasOpt = a.includes('opt');
                const bHasOpt = b.includes('opt');
                if (aHasOpt && !bHasOpt) { return -1; }
                if (!aHasOpt && bHasOpt) { return 1; }
                return 0;
            })
            .map(line => {
                const lastBinIndex = line.lastIndexOf('bin');
                if (lastBinIndex !== -1) {
                    return line.slice(0, lastBinIndex + 'bin'.length);
                }
                return line;
            })[0];

        const sdkBinPath = path.join(singleBinPath, '/cache/dart-sdk/bin');

        if (await fileExists(sdkBinPath)) {
            return sdkBinPath;
        }

        return singleBinPath;
    }

    async detectSdkUsingWhich() {
        try {
            const dartCmd = isWin ? 'where dart' : 'which dart';
            const flutterCmd = isWin ? 'where flutter' : 'which flutter';

            const dartSdk = await this.runCommand(dartCmd);
            const flutterSdk = await this.runCommand(flutterCmd);

            if (dartSdk) {
                this.dartSdk ??= await this.normalizeDartSdkPath(path.dirname(dartSdk));
            }

            if (flutterSdk) {
                this.flutterSdk ??= await this.normalizeSdkPath(path.dirname(flutterSdk));
                this.dartFromFlutterSDK ??= await this.normalizeDartSdkPath(flutterSdk);
                this.aSSnapshot ??= await this.normalizeSnapshotsPath();
            }
        } catch (error) {
            LogService.error('Error while running `which`/`where` commands: ', error);
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

    async checkDartSdk(sdkPath) {
        const dartPath = path.join(sdkPath, executableNames.dart);
        return await fileExists(dartPath);
    }

    async checkFlutterSdk(sdkPath) {
        const flutterPath = path.join(sdkPath, executableNames.flutter);
        return await fileExists(flutterPath);
    }

    async checkAnalysisServerSnapshot(sdkPath) {
        this.aSSnapshot = path.join(sdkPath, 'cache/dart-sdk/bin/snapshots', executableNames.analysisServerSnapshot);
        return await fileExists(this.aSSnapshot);
    }

    get dartSdkPath() {
        return this.dartSdk;
    }
    get dartSdkExecutable() {
        return path.join(this.dartSdk, executableNames.dart);
    }

    get flutterSdkPath() {
        return this.flutterSdk;
    }
    get flutterSdkExecutable() {
        return path.join(this.dartSdk, executableNames.flutter);
    }

    get analysisServerSnapshot() {
        return this.aSSnapshot;
    }

    // Method to initiate the SDK detection process
    async detectSdks() {
        await this.detectSdkFromEnv();
        await this.detectSdkFromVscode();
        await this.detectSdkUsingWhich();
    }
}

module.exports = SdkFinder;