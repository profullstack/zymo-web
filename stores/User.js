import env from 'rcompat/env';
import { primary } from '@primate/types';

export const actions = ({ connection: db }) => {
	return {
		async me() {
			const me = await db.info();
			delete me.password;

			console.log('me: ', me);

			return me;
		},
		async updateGoogleRefreshToken(id, googleRefreshToken) {
			try {
				const user = await db.merge(id, { googleRefreshToken });
				return user;
			} catch (e) {
				console.error(e);
				throw e;
			}
		},
		async removeGoogleRefreshToken(id) {
			try {
				const user = await db.merge(id, { googleRefreshToken: '' });
				return user;
			} catch (e) {
				console.error(e);
				throw e;
			}
		},
		async updateStripeCustomerId(id, stripeCustomerId) {
			try {
				const user = await db.merge(id, { stripeCustomerId });
				return user;
			} catch (e) {
				console.error(e);
				throw e;
			}
		},
		async getUserByStripeCustumerId(id) {
			const query = `SELECT * FROM user WHERE stripeCustomerId = $id`;
			try {
				const user = await db.query(query, {
					id
				});
				return user.pop().pop();
			} catch (e) {
				console.error(e)
				throw e;
			}
		},
		async generateEmailVerifyCode(id) {
			console.log('email user id:', id);
			const code = Math.random().toString(36).substr(2, 10);
			const expiration = new Date(Date.now() + 2 * (60 * 60 * 1000));

			const [[result]] = await db.query(
				"UPDATE $id SET verify.email.code = $code, verify.email.status = 'pending', verify.email.expiration = $expiration",
				{
					id,
					code,
					expiration
				}
			);

			console.log('user email verification: ', result);
			return result;
		},

		async generatePhoneVerifyCode(id) {
			console.log('phone user id:', id);
			const code = Math.random().toString().substr(2, 6);
			const expiration = new Date(Date.now() + 2 * (60 * 60 * 1000));

			const [[result]] = await db.query(
				"UPDATE $id SET verify.phone.code = $code, verify.phone.status = 'pending', verify.phone.expiration = $expiration",
				{
					id,
					code,
					expiration
				}
			);

			console.log('user phone verification: ', result);

			return result;
		},

		async create(user) {
			console.log('create:', user);
			let { email, username, firstName, lastName, phone, phonePrefix, password, password2 } =
				user;
			const { DB_NS, DB_DB } = env;

			console.log('db:', DB_NS, DB_DB);

			if (password !== password2) {
				throw new Error('Passwords do not match');
			}

			username = username.replace(/[^a-zA-Z0-9]+/g, '');
			console.log('user:', user, DB_NS, DB_DB);

			try {
				const token = await db.signup({
					namespace: DB_NS,
					database: DB_DB,
					scope: 'allusers',
					email,
					firstName,
					lastName,
					phone,
					phonePrefix,
					username,
					password,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				});

				console.log('token: ', token);
				return token;
			} catch (err) {
				console.error(err);
				throw err;
			}
		},

		async signin(user) {
			const { email, password } = user;
			const { DB_NS, DB_DB } = env;

			console.log('signin:', email, password, DB_NS, DB_DB);

			try {
				const token = await db.signin({
					namespace: DB_NS,
					database: DB_DB,
					scope: 'allusers',
					email,
					password
				});

				console.log('token: ', token);

				const me = await this.me();
				const { id } = me;
				const now = new Date();

				await db.query('UPDATE $id SET loggedInAt = $now', {
					id,
					now
				});

				return token;
			} catch (err) {
				console.error(err);
				throw err;
			}
		},

		async signinApi(apikey) {
			const { DB_NS, DB_DB } = env;

			console.log(apikey);

			try {
				const token = await db.signin({
					namespace: DB_NS,
					database: DB_DB,
					scope: 'apiusers',
					apikey
				});

				console.log('token: ', token);

				const me = await this.me();
				const { id } = me;
				const now = new Date();

				await db.query('UPDATE $id SET loggedInAt = $now', {
					id,
					now
				});

				await db.query('UPDATE $id SET apiQueries += 1', {
					id
				});

				return token;
			} catch (err) {
				console.error(err);
				throw err;
			}
		},

		async logout(session) { },
		async tryApiLogin(request) {
			const { headers, session } = request;
			const apikey = headers.get('x-api-key');

			if (!apikey) {
				return false;
			}
			const token = await this.signinApi(apikey);
			console.log('foobar:', token);
			const me = await this.me();
			console.log('foo3:', me);

			await session.create({ token, user: me, loggedIn: Boolean(token) });

			return session.get('loggedIn');
		}
	};
};

export default {
	id: primary
};
