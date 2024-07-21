import { join } from 'rcompat/fs';

const countries = await join(
	import.meta.dirname,
	'..',
	'static',
	'country.json'
).json();

export const ambiguous = true;

export const actions = () => {
	return {
		async get() {
			return countries;
		}
	};
};
