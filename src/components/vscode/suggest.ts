import * as vscode from 'vscode';

export const suggest1 = {
	provideCompletionItems(
		document: vscode.TextDocument,
		position: vscode.Position,
		token: vscode.CancellationToken,
		context: vscode.CompletionContext
	) {
		const simpleCompletion = new vscode.CompletionItem('Hello World!');

		const snippetCompletion = new vscode.CompletionItem('Good part of the day');

		snippetCompletion.insertText = new vscode.SnippetString(
			'Good ${1|morning,afternoon,evening|}. It is ${1}, right?'
		);
		const docs: any = new vscode.MarkdownString(
			'Inserts a snippet that lets you select [link](x.ts).'
		);

		snippetCompletion.documentation = docs;
		docs.baseUri = vscode.Uri.parse('http://example.com/a/b/c/');

		const commitCharacterCompletion = new vscode.CompletionItem('console');
		commitCharacterCompletion.commitCharacters = ['.'];
		commitCharacterCompletion.documentation = new vscode.MarkdownString(
			'Press `.` to get `console.`'
		);

		const commandCompletion = new vscode.CompletionItem('new');
		commandCompletion.kind = vscode.CompletionItemKind.Keyword;
		commandCompletion.insertText = 'new ';
		commandCompletion.command = {
			command: 'editor.action.triggerSuggest',
			title: 'Re-trigger completions...',
		};

		return [simpleCompletion, snippetCompletion, commitCharacterCompletion, commandCompletion];
	},
};

export const suggest2 = {
	provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
		const linePrefix = document.lineAt(position).text.slice(0, position.character);

		if (!linePrefix.endsWith('console.')) {
			return undefined;
		}

		return [
			new vscode.CompletionItem('log', vscode.CompletionItemKind.Method),
			new vscode.CompletionItem('warn', vscode.CompletionItemKind.Method),
			new vscode.CompletionItem('error', vscode.CompletionItemKind.Method),
		];
	},
};
