import * as vscode from 'vscode';

declare module 'vscode' {
	// https://github.com/microsoft/vscode/issues/124024 @hediet

	export namespace languages {
		/**
		 * Registers an inline completion provider.
		 *
		 * Multiple providers can be registered for a language. In that case providers are asked in
		 * parallel and the results are merged. A failing provider (rejected promise or exception) will
		 * not cause a failure of the whole operation.
		 *
		 * @param selector A selector that defines the documents this provider is applicable to.
		 * @param provider An inline completion provider.
		 * @param metadata Metadata about the provider.
		 * @return A {@link Disposable} that unregisters this provider when being disposed.
		 */
		export function registerInlineCompletionItemProvider(
			selector: DocumentSelector,
			provider: InlineCompletionItemProvider,
			metadata: InlineCompletionItemProviderMetadata
		): Disposable;
	}

	export interface InlineCompletionItem {
		/**
		 * If set to `true`, unopened closing brackets are removed and unclosed opening brackets are closed.
		 * Defaults to `false`.
		 */
		completeBracketPairs?: boolean;
	}

	export interface InlineCompletionItemProviderMetadata {
		/**
		 * Specifies a list of extension ids that this provider yields to if they return a result.
		 * If some inline completion provider registered by such an extension returns a result, this provider is not asked.
		 */
		yieldTo: string[];
	}

	export interface InlineCompletionItemProvider {
		/**
		 * @param completionItem The completion item that was shown.
		 * @param updatedInsertText The actual insert text (after brackets were fixed).
		 */
		// eslint-disable-next-line local/vscode-dts-provider-naming
		handleDidShowCompletionItem?(
			completionItem: InlineCompletionItem,
			updatedInsertText: string
		): void;

		/**
		 * Is called when an inline completion item was accepted partially.
		 * @param acceptedLength The length of the substring of the inline completion that was accepted already.
		 */
		// eslint-disable-next-line local/vscode-dts-provider-naming
		handleDidPartiallyAcceptCompletionItem?(
			completionItem: InlineCompletionItem,
			acceptedLength: number
		): void;

		/**
		 * Is called when an inline completion item was accepted partially.
		 * @param info Additional info for the partial accepted trigger.
		 */
		// eslint-disable-next-line local/vscode-dts-provider-naming
		handleDidPartiallyAcceptCompletionItem?(
			completionItem: InlineCompletionItem,
			info: PartialAcceptInfo
		): void;
	}

	export interface PartialAcceptInfo {
		kind: PartialAcceptTriggerKind;
	}

	export enum PartialAcceptTriggerKind {
		Unknown = 0,
		Word = 1,
		Line = 2,
		Suggest = 3,
	}

	// When finalizing `commands`, make sure to add a corresponding constructor parameter.
	export interface InlineCompletionList {
		/**
		 * A list of commands associated with the inline completions of this list.
		 */
		commands?: Command[];

		/**
		 * When set and the user types a suggestion without derivating from it, the inline suggestion is not updated.
		 * Defaults to false (might change).
		 */
		enableForwardStability?: boolean;
	}
}

export const inline: vscode.InlineCompletionItemProvider = {
	async provideInlineCompletionItems(document, position, context, token) {
		console.log('provideInlineCompletionItems triggered');

		/**
		 * Trigger inline completions after each line
		 *	 [0,*):// Trigger inline completions in this line, they work!
		 *	 Trigger inline completions in this line
		 *	 [0,*):console.log(
		 *	 [0,*):console.log("foo"
		 *	 [0,*):console.log({ label: "("
		 *	 [0,*):console.log(`${(1+2}`)
		 *	 [0,*):({\n){
		 *	 [33,33):lambda x: x.notnull()
		 */
		const regexp = /\/\/ \[(.+?),(.+?)\)(.*?):(.*)/;
		if (position.line <= 0) {
			return;
		}

		const result: vscode.InlineCompletionList = {
			items: [],
			commands: [],
		};

		let offset = 1;
		while (offset > 0) {
			if (position.line - offset < 0) {
				break;
			}

			const lineBefore = document.lineAt(position.line - offset).text;
			const matches = lineBefore.match(regexp);
			if (!matches) {
				break;
			}
			offset++;

			const start = matches[1];
			const startInt = parseInt(start, 10);
			const end = matches[2];
			const endInt = end === '*' ? document.lineAt(position.line).text.length : parseInt(end, 10);
			const flags = matches[3];
			const completeBracketPairs = flags.includes('b');
			const isSnippet = flags.includes('s');
			const text = matches[4].replace(/\\n/g, '\n');

			result.items.push({
				insertText: isSnippet ? new vscode.SnippetString(text) : text,
				range: new vscode.Range(position.line, startInt, position.line, endInt),
				completeBracketPairs,
			});
		}

		if (result.items.length > 0) {
			result.commands!.push({
				command: 'extension.inline-completion-settings',
				title: 'My Inline Completion Demo Command',
				arguments: [1, 2],
			});
		}
		return result;
	},

	handleDidShowCompletionItem(completionItem: vscode.InlineCompletionItem): void {
		console.log('handleDidShowCompletionItem');
	},

	/**
	 * Is called when an inline completion item was accepted partially.
	 * @param acceptedLength The length of the substring of the inline completion that was accepted already.
	 */
	handleDidPartiallyAcceptCompletionItem(
		completionItem: vscode.InlineCompletionItem,
		info: vscode.PartialAcceptInfo | number
	): void {
		console.log('handleDidPartiallyAcceptCompletionItem');
	},
};
