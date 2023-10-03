import countries from '../static/country.json' assert { type: 'json' };

export const ambiguous = true;

export const actions = () => {
	return {
		async get() {
			return countries;
		},
    }
};
