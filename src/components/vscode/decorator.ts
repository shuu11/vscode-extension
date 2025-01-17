import * as vscode from 'vscode';

let activeEditor = vscode.window.activeTextEditor;

// create a decorator type that we use to decorate small numbers
const smallNumberDecorationType = vscode.window.createTextEditorDecorationType({
	borderWidth: '1px',
	borderStyle: 'solid',
	overviewRulerColor: 'blue',
	overviewRulerLane: vscode.OverviewRulerLane.Right,
	light: {
		// this color will be used in light color themes
		borderColor: 'darkblue',
	},
	dark: {
		// this color will be used in dark color themes
		borderColor: 'lightblue',
	},
});

// create a decorator type that we use to decorate large numbers
const largeNumberDecorationType = vscode.window.createTextEditorDecorationType({
	cursor: 'crosshair',
	// use a themable color. See package.json for the declaration and default values.
	backgroundColor: { id: 'myextension.largeNumberBackground' },
});

export function decoraor() {
	if (!activeEditor) {
		return;
	}
	const regEx = /\d+/g;
	const text = activeEditor.document.getText();
	const smallNumbers: vscode.DecorationOptions[] = [];
	const largeNumbers: vscode.DecorationOptions[] = [];
	let match;
	while ((match = regEx.exec(text))) {
		const startPos = activeEditor.document.positionAt(match.index);
		const endPos = activeEditor.document.positionAt(match.index + match[0].length);
		const decoration = {
			range: new vscode.Range(startPos, endPos),
			hoverMessage: 'Number **' + match[0] + '**',
		};
		if (match[0].length < 3) {
			smallNumbers.push(decoration);
		} else {
			largeNumbers.push(decoration);
		}
	}
	activeEditor.setDecorations(smallNumberDecorationType, smallNumbers);
	activeEditor.setDecorations(largeNumberDecorationType, largeNumbers);
}
