import join from '@rcompat/fs/join';
import primary from '@primate/types/primary';

const countries = await join(
	import.meta.dirname,
	'..',
	'server',
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

export default {
    id: primary
};
