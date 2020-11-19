'use babel';

import suggestions from '../data/curam';

class CuramProvider {
  constructor() {
    // offer suggestions only when editing XML files
    this.selector = '.text.xml.uim';

    // these suggestions appear above default suggestions
    this.suggestionPriority = 2;
  }

  getSuggestions(options) {
		const { editor, bufferPosition } = options;
    let prefix = this.getPrefix(editor, bufferPosition);

		// only look for suggestions after 3 characters have been typed
		if (prefix.startsWith('<')) {
			return this.findMatchingSuggestions(prefix);
		}
	}

  getPrefix(editor, bufferPosition) {
    // prefix includes character back to the last whitespace character
    let line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
		let match = line.match(/\S+$/);
		return match ? match[0] : '';
  }

  findMatchingSuggestions(prefix) {
		// filter list of suggestions to those matching the prefix, case insensitive
		let prefixLower = prefix.substring(1).toLowerCase();
		let matchingSuggestions = suggestions.filter((suggestion) => {
			let textLower = suggestion.displayText.toLowerCase();
			return textLower.startsWith(prefixLower);
		});
		// run each matching suggestion through inflateSuggestion() and return
		return matchingSuggestions.map(this.inflateSuggestion.bind(this, prefix));
	}

  // clones a suggestion object to a new object with some shared additions
	// cloning also fixes an issue where selecting a suggestion won't insert it
	inflateSuggestion(replacementPrefix, suggestion) {
		return {
			displayText: suggestion.displayText,
      snippet: this.generateSnippet(suggestion),
			description: suggestion.description,
			descriptionMoreURL: suggestion.descriptionMoreURL,
      replacementPrefix: replacementPrefix, // ensures entire prefix is replaced
			type: 'snippet',
			rightLabel: 'Element'
		};
	}

  generateSnippet(suggestion) {
    let snippet = "<" + suggestion.displayText + " ";
    for (i = 0; i < suggestion.requiredAttributes.length; i++) {
      let num = i + 1;
      snippet += suggestion.requiredAttributes[i] + "=\"${" + num + ":}\" ";
    }

    snippet += "${" + (suggestion.requiredAttributes.length + 1) + ":}";

    return snippet;
  }
}
export default new CuramProvider();
