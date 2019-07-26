import { workspace, Uri, window } from 'vscode';
import * as fse from 'fs-extra';
import * as fs from 'fs';
import * as path from 'path';
import { pascalCase } from 'change-case';
import { Observable } from 'rxjs';

export class FileHelper {
    private static assetRootDir: string = path.join(__dirname, '../../assets');

    private static createFile = <(file: string, data: string) => Observable<{}>>Observable.bindNodeCallback(fse.outputFile);

    public static createComponentDir(uri: any, componentName: string): string {
        let contextMenuSourcePath;

        if (uri && fs.lstatSync(uri.fsPath).isDirectory()) {
            contextMenuSourcePath = uri.fsPath;
        } else if (uri) {
            contextMenuSourcePath = path.dirname(uri.fsPath);
        } else {
            contextMenuSourcePath = workspace.rootPath;
        }

        const componentDir = `${contextMenuSourcePath}/${this.setName(componentName)}`;
        fse.mkdirsSync(componentDir);

        return componentDir;
    }

    public static createComponent(componentDir: string, componentName: string, suffix: string = '-container'): Observable<string> {
        let templateFileName = this.assetRootDir + `/templates/component${suffix}.template`;

        const compName = this.setName(componentName);

        let componentContent = fs.readFileSync( templateFileName ).toString().replace(/{componentName}/g, compName)

        let filename = `${componentDir}/${compName}.js`;

        return this.createFile(filename, componentContent).map(result => filename);
    };

    public static createCSS(componentDir: string, componentName: string): Observable<string> {
      let templateFileName = `${this.assetRootDir}/templates/css.template`;

      const compName = this.setName(componentName);
      let cssContent = fs.readFileSync( templateFileName ).toString()
        .replace(/{componentName}/g, compName)

      let filename = `${componentDir}/${compName}.scss`;
      return this.createFile(filename, cssContent).map(result => filename);
    };

    public static resolveWorkspaceRoot = (path: string): string => path.replace('${workspaceFolder}', workspace.rootPath)

    public static setName = (name: string) => pascalCase(name)
}

export function logger(type: 'success'|'warning'|'error', msg: string = '') {
    switch (type) {
    case 'success':
        return window.setStatusBarMessage(`Success: ${msg}`, 5000);
        // return window.showInformationMessage(`Success: ${msg}`);
    case 'warning':
        return window.showWarningMessage(`Warning: ${msg}`);
    case 'error':
        return window.showErrorMessage(`Failed: ${msg}`);
    }
  }

export default function getConfig(uri?: Uri) {
    return workspace.getConfiguration('ACReactComponentGenerator', uri) as any;
}

export function removeBetweenTags(remainTag, removedtag, content) {
  const escapeRegExp = s => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  const regexPattern = RegExp(`${escapeRegExp(`<${removedtag}>`)}([\\S\\s]+?)${escapeRegExp(`</${removedtag}>`)}`, "gi");
  const removeOnlyTagsPattern = new RegExp(`<(${escapeRegExp(remainTag)}|/${escapeRegExp(remainTag)})[^>]{0,}>`, "gi");

  return content.replace(regexPattern, '').replace(removeOnlyTagsPattern, '');
}
