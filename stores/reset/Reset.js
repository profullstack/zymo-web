import env from '@rcompat/env';
import primary from '@primate/types/primary';

export const actions = ({ connection: db }) => {
	return {
		async createResetToken(data) {
			let { email } = data;

		}
	};
};

export default {
	id: primary
};
