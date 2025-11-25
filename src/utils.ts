import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export async function getClosestDirectory(
  uri: vscode.Uri
): Promise<vscode.Uri> {
  const stat = await vscode.workspace.fs.stat(uri);

  let folderPath: string;

  if (stat.type & vscode.FileType.Directory) {
    folderPath = uri.fsPath;
  } else {
    folderPath = path.dirname(uri.fsPath);
  }

  return await vscode.Uri.file(path.normalize(folderPath));
}

export function componentDirExists(
  componentsRoot: vscode.Uri,
  componentName: string
): boolean {
  const componentUri = vscode.Uri.joinPath(componentsRoot, componentName);
  return fs.existsSync(componentUri.fsPath);
}

export async function getSelectedItemUri(
  baseUri: vscode.Uri
): Promise<vscode.Uri> {
  // make sure the file explorer has the focus
  await vscode.commands.executeCommand(
    'workbench.files.action.focusFilesExplorer'
  );

  // save original clipboard
  const originalClipBoard = await vscode.env.clipboard.readText();

  // copy the file path from the file explorer and save it to a variable
  await vscode.commands.executeCommand('copyFilePath');
  const selectedItem = await vscode.env.clipboard.readText();

  // replace the original clipboard.
  // NOTE: This will remove the rich state in some OS
  await vscode.env.clipboard.writeText(originalClipBoard);

  // if nothing is selected and opened on the editor, use the root directory
  const hasNoSelection = !(
    selectedItem.includes('/') || selectedItem.includes('\\')
  );

  // make the path Uri
  const selectedItemUri = hasNoSelection
    ? baseUri
    : await vscode.Uri.file(selectedItem);

  // skip if there is no directory selected
  if (!selectedItemUri) {
    await vscode.window.showErrorMessage('No valid directory selected.');
    return baseUri;
  }

  // clean up the path, if there are multiple selected files,
  // the path would have multiple paths
  // we just need to get the last selected file
  let lastSelectedItem = selectedItemUri;

  // if there are multiple selected items,
  // create a new Uri of the last selected item
  if (selectedItemUri.path.includes('\r\n')) {
    const selectedItems = selectedItemUri.path.split('\r\n');
    lastSelectedItem = await vscode.Uri.file(selectedItems.at(-1) as string);
  }

  return lastSelectedItem;
}
