import * as vscode from 'vscode';
import { componentDirExists } from './utils';

export interface ComponentOptions {
  typescript: boolean;
  react18: boolean;
  namedExport: boolean;
  testFile: boolean;
}

interface OptionItem extends vscode.QuickPickItem {
  id: 'typescript' | 'react18' | 'namedExport' | 'testFile';
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
      id: 'namedExport',
      label: 'Named Export',
      picked: false,
      description: 'Export component as named instead of default',
    },
    {
      id: 'testFile',
      label: 'Generate test file',
      picked: false,
      description: 'Create a basic test file next to the component',
    },
  ];

  const selected = await vscode.window.showQuickPick(optionItems, {
    title: `Options for ${name}`,
    canPickMany: true,
    ignoreFocusOut: true,
    placeHolder: 'Select what you want to generate',
  });

  if (!selected) {
    // user cancelled here
    return undefined;
  }

  const selectedIds = new Set(selected.map((s) => s.id));

  const options: ComponentOptions = {
    typescript: selectedIds.has('typescript'),
    react18: selectedIds.has('react18'),
    namedExport: selectedIds.has('namedExport'),
    testFile: selectedIds.has('testFile'),
  };

  return { name, options };
}
