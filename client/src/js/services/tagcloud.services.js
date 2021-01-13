

export default (words, maxScale=8, minScale=1) => {
	const wordDict = {};
	let maxWordData = {text: null, count: -1};
	words.forEach((word) => {
		if (wordDict[word] === undefined) {
			wordDict[word] = 0;
		}
		wordDict[word]++;
		if (maxWordData.count < wordDict[word]) {
			maxWordData = {text: word, count: wordDict[word]};
		}
	});
	const result = [];
	Object.keys(wordDict).forEach((word) => {
		const count = wordDict[word];
		result.push({word, value: Math.max(minScale, (count / maxWordData.count) * maxScale), count });
	});
	return result.sort((a, b) => {
		return b.value - a.value;
	});
}
