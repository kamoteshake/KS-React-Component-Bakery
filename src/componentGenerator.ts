import * as vscode from 'vscode';
import dedent from 'ts-dedent';
import { ComponentOptions } from './promptForComponentConfig';

export async function createComponent(
  dir: vscode.Uri,
  componentName: string,
  options: ComponentOptions
) {
  console.log(dir);
  // setup the component directory Uri
  const componentDir = vscode.Uri.joinPath(dir, componentName);

  // create the component directory
  await vscode.workspace.fs.createDirectory(componentDir);

  // setup file parameters
  const ext = options.typescript ? 'ts' : 'js';
  const reactImport = `import React from 'react'`;
  const encoder = new TextEncoder();

  // setup the component file
  const componentFile = vscode.Uri.joinPath(
    componentDir,
    `${componentName}.${ext}x`
  );

  const componentContent = dedent`
    ${options.react18 ? '' : reactImport}

    ${options.namedExport ? 'export ' : ''}const ${componentName}${
    options.typescript ? ': React.FC' : ''
  } = () => {
      return <div>${componentName}</div>
    }

    ${!options.namedExport ? `export default ${componentName}` : ''}
  `;

  // create component file
  await vscode.workspace.fs.writeFile(
    componentFile,
    encoder.encode(componentContent.trimStart().trimEnd() + '\n')
  );

  // setup index file
  const indexFile = vscode.Uri.joinPath(componentDir, `index.${ext}`);

  const exportComponent = `{ ${
    options.namedExport ? componentName : 'default'
  } }`;

  const indexContent = dedent`
    export ${
      options.exportAll ? '*' : exportComponent
    } from './${componentName}'

  `;

  // create index file
  await vscode.workspace.fs.writeFile(indexFile, encoder.encode(indexContent));

  // create test file if it is selected in the options
  if (options.testFile) {
    // setup test file
    const testFile = vscode.Uri.joinPath(
      componentDir,
      `${componentName}.spec.${ext}x`
    );

    const testContent = dedent`
      ${options.react18 ? '' : reactImport}
      import { render, screen } from '@testing-library/react'

      import ${
        options.namedExport ? `{ ${componentName} }` : componentName
      } from './${componentName}'

      describe(<${componentName} />, () => {
        it('renders', () => {
          // TODO: add real test
          render(<${componentName} />)

          expect(screen.getByText('${componentName}')).toBeInTheDocument()
        });
      })

    `;

    // create test file
    await vscode.workspace.fs.writeFile(testFile, encoder.encode(testContent));
  }

  // open the component file
  const doc = await vscode.workspace.openTextDocument(componentFile);
  await vscode.window.showTextDocument(doc);
}
