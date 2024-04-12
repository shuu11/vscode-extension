import * as vscode from 'vscode';

const EMOJI_MENTION = 'emoji_mention';
const COMMAND = 'code-actions-sample.command';

const EMOJI = 'emoji';

/**
 * Analyzes the text document for problems.
 * This demo diagnostic problem provider finds all mentions of 'emoji'.
 * @param doc text document to analyze
 * @param emojiDiagnostics diagnostic collection
 */
export function refreshDiagnostics(
	doc: vscode.TextDocument,
	emojiDiagnostics: vscode.DiagnosticCollection
): void {
	const diagnostics: vscode.Diagnostic[] = [];

	for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
		const lineOfText = doc.lineAt(lineIndex);
		if (lineOfText.text.includes(EMOJI)) {
			diagnostics.push(createDiagnostic(doc, lineOfText, lineIndex));
		}
	}

	emojiDiagnostics.set(doc.uri, diagnostics);
}

function createDiagnostic(
	doc: vscode.TextDocument,
	lineOfText: vscode.TextLine,
	lineIndex: number
): vscode.Diagnostic {
	// find where in the line of that the 'emoji' is mentioned
	const index = lineOfText.text.indexOf(EMOJI);

	// create range that represents, where in the document the word is
	const range = new vscode.Range(lineIndex, index, lineIndex, index + EMOJI.length);

	const diagnostic = new vscode.Diagnostic(
		range,
		"When you say 'emoji', do you want to find out more?",
		vscode.DiagnosticSeverity.Information
	);
	diagnostic.code = EMOJI_MENTION;
	return diagnostic;
}

export function subscribeToDocumentChanges(
	context: vscode.ExtensionContext,
	emojiDiagnostics: vscode.DiagnosticCollection
): void {
	if (vscode.window.activeTextEditor) {
		refreshDiagnostics(vscode.window.activeTextEditor.document, emojiDiagnostics);
	}
	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor((editor) => {
			if (editor) {
				refreshDiagnostics(editor.document, emojiDiagnostics);
			}
		})
	);

	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument((e) =>
			refreshDiagnostics(e.document, emojiDiagnostics)
		)
	);

	context.subscriptions.push(
		vscode.workspace.onDidCloseTextDocument((doc) => emojiDiagnostics.delete(doc.uri))
	);
}

/**
 * Provides code actions for converting :) to a smiley emoji.
 */
export class Emojizer implements vscode.CodeActionProvider {
	public static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix];

	public provideCodeActions(
		document: vscode.TextDocument,
		range: vscode.Range
	): vscode.CodeAction[] | undefined {
		if (!this.isAtStartOfSmiley(document, range)) {
			return;
		}

		const replaceWithSmileyCatFix = this.createFix(document, range, '😺');

		const replaceWithSmileyFix = this.createFix(document, range, '😀');
		// Marking a single fix as `preferred` means that users can apply it with a
		// single keyboard shortcut using the `Auto Fix` command.
		replaceWithSmileyFix.isPreferred = true;

		const replaceWithSmileyHankyFix = this.createFix(document, range, '💩');

		const commandAction = this.createCommand();

		return [
			replaceWithSmileyCatFix,
			replaceWithSmileyFix,
			replaceWithSmileyHankyFix,
			commandAction,
		];
	}

	private isAtStartOfSmiley(document: vscode.TextDocument, range: vscode.Range) {
		const start = range.start;
		const line = document.lineAt(start.line);
		return line.text[start.character] === ':' && line.text[start.character + 1] === ')';
	}

	private createFix(
		document: vscode.TextDocument,
		range: vscode.Range,
		emoji: string
	): vscode.CodeAction {
		const fix = new vscode.CodeAction(`Convert to ${emoji}`, vscode.CodeActionKind.QuickFix);
		fix.edit = new vscode.WorkspaceEdit();
		fix.edit.replace(
			document.uri,
			new vscode.Range(range.start, range.start.translate(0, 2)),
			emoji
		);
		return fix;
	}

	private createCommand(): vscode.CodeAction {
		const action = new vscode.CodeAction('Learn more...', vscode.CodeActionKind.Empty);
		action.command = {
			command: COMMAND,
			title: 'Learn more about emojis',
			tooltip: 'This will open the unicode emoji page.',
		};
		return action;
	}
}
