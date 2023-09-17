import { primary } from '@primate/types';

export const actions = ({connection: db}) => {
	return {
		async me() {
			const me = await db.info();
			delete me?.password;
			console.log('me: ', me?.email);
			return me;
		},
		async visit(id, headers = {}, data) {
			if (!id) return;

			const me = await this.me();
			const list = headers.get();

			console.log('visit:', id, list, data, me);

			try {
				const link = await db.query(
					`
					UPDATE $id SET visits += $visit
				`,
					{
						id,
						visit: {
							headers: list,
							browser: data ?? undefined,
							user: me?.id ?? undefined,
							createdAt: new Date().toISOString(),
						}
					}
				);

				console.log('link: ', link);
				return link;
			} catch (err) {
				console.error(err);
				throw err;
			}
		}
	};
};

export default {
	id: primary
};
