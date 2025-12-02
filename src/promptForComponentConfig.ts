import * as vscode from 'vscode';
import { componentDirExists } from './utils';

export interface ComponentOptions {
  typescript: boolean;
  react18: boolean;
  testFile: boolean;
  namedExport: boolean;
  exportAll: boolean;
}

interface OptionItem extends vscode.QuickPickItem {
  id: 'typescript' | 'react18' | 'testFile' | 'namedExport' | 'exportAll';
}

export async function promptForComponentConfig(
  baseDir: vscode.Uri
): Promise<{ name: string; options: ComponentOptions } | undefined> {
  // prompt for the component name
  const name = await vscode.window.showInputBox({
    title: 'Component Name',
    prompt: 'Enter the component name (PascalCase, no spaces or symbols)',
    placeHolder: 'MyComponent',
    validateInput: (value: string) => {
      const trimmed = value.trim();

      if (!trimmed) {
        return 'Name is required.';
      }

      // spaces check
      if (/\s/.test(trimmed)) {
        return 'No spaces allowed.';
      }

      // special character check
      if (!/^[A-Za-z0-9]+$/.test(trimmed)) {
        return 'Only letters and numbers are allowed.';
      }

      // case check
      if (!/^[A-Z][A-Za-z0-9]*$/.test(trimmed)) {
        return 'Must be PascalCase (e.g., MyComponent, UserCard).';
      }

      // check if the component exists in the selected directory
      if (componentDirExists(baseDir, trimmed)) {
        return `Component ${trimmed} already exists in ${baseDir.fsPath}`;
      }

      return null;
    },
  });

  if (!name) {
    // user hit Esc / cancelled
    return undefined;
  }

  // prompt for component options
  const optionItems: OptionItem[] = [
    {
      id: 'typescript',
      label: 'Use TypeScript',
      picked: true,
      description: 'Generate .tsx / .ts instead of .jsx / .js',
    },
    {
      id: 'react18',
      label: 'Target React 18+',
      picked: true,
      description: 'Use patterns suitable for React 18+',
    },
    {
      id: 'testFile',
      label: 'Generate test file',
      picked: false,
      description: 'Create a basic test file next to the component',
    },
    {
      id: 'namedExport',
      label: 'Named Export',
      picked: false,
      description: 'Export component as named instead of default',
    },
    {
      id: 'exportAll',
      label: 'Export All',
      picked: false,
      description:
        'Use export * from "./ComponentName" (only valid with Named Export)',
    },
  ];

  // setup quick pick
  const qp = vscode.window.createQuickPick<OptionItem>();
  qp.title = `Options for ${name}`;
  qp.canSelectMany = true;
  qp.ignoreFocusOut = true;
  qp.items = optionItems;
  qp.placeholder = 'Select what you want to generate';

  // initial selection
  qp.selectedItems = optionItems.filter((item) => item.picked);

  // track selection explicitly
  let selectedIds = new Set(qp.selectedItems.map((item) => item.id));

  const results = await new Promise<
    { name: string; options: ComponentOptions } | undefined
  >((resolve) => {
    qp.onDidChangeSelection((selection) => {
      const newSelected = new Set(selection.map((item) => item.id));

      const hadNamedExportBefore = selectedIds.has('namedExport');
      const hasNamedExportNow = newSelected.has('namedExport');

      const hadExportAllBefore = selectedIds.has('exportAll');
      const hasExportAllNow = newSelected.has('exportAll');

      // if Named Export is unselected but Export All is selected,
      // silently unselect Export ALl
      if (hadNamedExportBefore && !hasNamedExportNow && hasExportAllNow) {
        newSelected.delete('exportAll');

        selectedIds = newSelected;
        qp.selectedItems = optionItems.filter((item) =>
          newSelected.has(item.id)
        );

        return;
      }

      // if Export All is selected but Named Export is not, disable and revert
      if (hasExportAllNow && !hasNamedExportNow && !hadExportAllBefore) {
        vscode.window.showInformationMessage(
          'Export All requires Named Export to be enabled.'
        );

        newSelected.delete('exportAll');

        selectedIds = newSelected;
        qp.selectedItems = optionItems.filter((item) =>
          newSelected.has(item.id)
        );

        return;
      }

      // if Named Export was just selected, auto-select Export All
      if (!hadNamedExportBefore && hasNamedExportNow && !hasExportAllNow) {
        newSelected.add('exportAll');

        selectedIds = newSelected;
        qp.selectedItems = optionItems.filter((item) =>
          newSelected.has(item.id)
        );

        return;
      }

      // normal path: just track selection and update description
      selectedIds = newSelected;
    });

    qp.onDidAccept(() => {
      const finalIds = new Set(qp.selectedItems.map((item) => item.id));

      const options: ComponentOptions = {
        typescript: finalIds.has('typescript'),
        react18: finalIds.has('react18'),
        testFile: finalIds.has('testFile'),
        namedExport: finalIds.has('namedExport'),
        // Export All only makes sense if namedExport is true
        exportAll: finalIds.has('namedExport') && finalIds.has('exportAll'),
      };

      qp.hide();
      resolve({ name, options });
    });

    qp.onDidHide(() => {
      qp.dispose();
      resolve(undefined);
    });

    qp.show();
  });

  return results;
}
