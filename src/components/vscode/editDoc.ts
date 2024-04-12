import * as vscode from 'vscode';

export function editDoc() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage('No editor is active');
		return;
	}

	const doc = editor.document;
	const selection = editor.selection;

	// const firstLine = doc.lineAt(0);
	// const lastLine = doc.lineAt(doc.lineCount - 1);
	// const textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
	// const fullText = doc.getText(textRange);

	const text = doc.getText(selection);

	editor.edit((editBuilder) => {
		editBuilder.replace(selection, text.toUpperCase());
	});
}
