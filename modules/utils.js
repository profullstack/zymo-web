import { bech32 } from 'bech32';

export function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export const fisherYatesShuffle = (array) => {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}

	return array;
};

export const arrays = () => {
	Array.prototype.shuffle = function () {
		return fisherYatesShuffle(this);
	};
};

export const npubToHex = (npub) => {
	// Decode the Bech32 encoded string
	const decoded = bech32.decode(npub);

	// Convert the data part from 5-bit array to 8-bit array (to bytes)
	const bytes = bech32.fromWords(decoded.words);

	// Convert bytes to hexadecimal string
	const hex = bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('');
	return hex;
};

export const debounce = (node, delay) => {
	let timer;

	const handleInput = (event) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			node.dispatchEvent(new CustomEvent('debouncedInput', { detail: event.target.value }));
		}, delay);
	};

	node.addEventListener('input', handleInput);

	return {
		destroy() {
			node.removeEventListener('input', handleInput);
		}
	};
};
