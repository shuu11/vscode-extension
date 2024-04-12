import * as vscode from 'vscode';
import { Codelens } from './components/vscode/codelens';
import { suggest1, suggest2 } from './components/vscode/suggest';
import { Emojizer } from './components/vscode/codeaction';
import { editDoc } from './components/vscode/editDoc';
import { decoraor } from './components/vscode/decorator';
import { inline } from './components/vscode/inline';

const registerCommand = 'test.helloWorld';

let activeEditor = vscode.window.activeTextEditor;

let disposables: vscode.Disposable[] = [];

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "test" is now active!');

	/**
	 * codelens
	 */
	vscode.languages.registerCodeLensProvider('*', new Codelens());

	vscode.commands.registerCommand('codelens-sample.enableCodeLens', () => {
		vscode.workspace.getConfiguration('codelens-sample').update('enableCodeLens', true, true);
	});

	vscode.commands.registerCommand('codelens-sample.disableCodeLens', () => {
		vscode.workspace.getConfiguration('codelens-sample').update('enableCodeLens', false, true);
	});

	vscode.commands.registerCommand('codelens-sample.codelensAction', (args: any) => {
		vscode.window.showInformationMessage(`CodeLens action clicked with args=${args}`);
	});

	/**
	 *	suggest
	 */
	vscode.languages.registerCompletionItemProvider('plaintext', suggest1);
	vscode.languages.registerCompletionItemProvider('plaintext', suggest2, '.');

	/**
	 * codeaction
	 */
	vscode.languages.registerCodeActionsProvider('plaintext', new Emojizer(), {
		providedCodeActionKinds: Emojizer.providedCodeActionKinds,
	});

	/**
	 * editDoc
	 */
	vscode.commands.registerCommand('test.editDoc', () => {
		editDoc();
	});

	/**
	 * decorator
	 */
	if (activeEditor) {
		decoraor();
	}

	vscode.window.onDidChangeActiveTextEditor((editor) => {
		activeEditor = editor;
		if (editor) {
			decoraor();
		}
	}, null);

	vscode.workspace.onDidChangeTextDocument((event) => {
		if (activeEditor && event.document === activeEditor.document) {
			decoraor();
		}
	}, null);

	/**
	 * inline
	 */
	vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, inline);

	/**
	 * command
	 */
	vscode.commands.registerCommand(registerCommand, () => {
		vscode.window.showInformationMessage('Hello World from test!');
	});

	vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
		vscode.commands.executeCommand(registerCommand);
	});
}

export function deactivate() {
	if (disposables) {
		disposables.forEach((item) => item.dispose());
	}
	disposables = [];
}
