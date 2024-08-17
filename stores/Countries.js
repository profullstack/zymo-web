import join from '@rcompat/fs/join';
import primary from '@primate/types/primary';
import countries from "../static/country.json" with { type: "json" };

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
