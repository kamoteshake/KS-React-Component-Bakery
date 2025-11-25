import * as vscode from 'vscode';
import { getClosestDirectory, getSelectedItemUri } from './utils';
import { promptForComponentConfig } from './promptForComponentConfig';
import { createComponent } from './componentGenerator';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'ks-react-component-bakery.addComponent',
    async (uri: vscode.Uri) => {
      // if there is no uri (using the button or the command palette)
      // or the uri is the workspace directory, try to get the
      // selected item's uri, if none, use the workspace directory
      let baseUri = await getSelectedItemUri(uri);

      const closestDir = await getClosestDirectory(baseUri);

      const result = await promptForComponentConfig(closestDir);

      if (!result) {
        // user cancelled at some point
        return;
      }

      const { name, options } = result;

      // generate the component directory and files
      try {
        await createComponent(closestDir, name, options);

        vscode.window.showInformationMessage(
          `Created component "${name}" (${[
            options.typescript ? 'TS' : 'JS',
            options.react18 ? 'React 18+' : 'React < 18',
            options.testFile ? 'with test' : 'no test',
          ].join(', ')})`
        );
      } catch (err: any) {
        vscode.window.showErrorMessage(
          `Failed to create component: ${err?.message ?? String(err)}`
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
