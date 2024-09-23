import env from '@rcompat/env';
import primary from '@primate/types/primary';

export const actions = ({ connection: db }) => {
	return {
		async me() {
			const [auth] = await db.query('SELECT * FROM $auth');
			console.log('auth:', auth);
			const { id: userId } = auth.pop();
			const [me] = await db.select(userId);

			delete me?.password;
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
				console.error(e);
				throw e;
			}
		},
		async getById(id) {
			const query = `SELECT * FROM user WHERE id = $id`;
			try {
				const user = await db.query(query, {
					id
				});
				return user.pop().pop();
			} catch (e) {
				console.error(e);
				throw e;
			}
		},
		async getByEmail(email) {
			const query = `SELECT * FROM user WHERE email = $email`;
			try {
				const user = await db.query(query, {
					email
				});
				return user.pop().pop();
			} catch (e) {
				console.error(e);
				throw e;
			}
		},
		async generatePasswordResetToken(id) {
			try {
				const token = this.generateToken();
				const expiration = new Date(Date.now() + 2 * (60 * 60 * 1000));
				console.log('expiration:', expiration);

				const [[result]] = await db.query(
					'UPDATE $id SET passwordReset.token = $_token, passwordReset.expiration = $expiration',
					{
						id,
						_token: token,
						expiration
					}
				);
				return result;
			} catch (e) {
				console.error(e);
			}
		},
		generateToken(length = 30) {
			const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
			let token = '';

			for (let i = 0; i < length; i++) {
				const randomIndex = Math.floor(Math.random() * characters.length);
				token += characters[randomIndex];
			}
			return token;
		},
		async getByPasswordResetToken(token) {
			const query = `SELECT * FROM user WHERE passwordReset.token = $_token`;
			try {
				const user = await db.query(query, {
					_token: token
				});
				return user.pop().pop();
			} catch (e) {
				console.error(e);
				throw e;
			}
		},
		async deletePasswordResetToken(id) {
			try {
				const [[result]] = await db.query('UPDATE $id SET passwordReset = {}', {
					id
				});
				return result;
			} catch (e) {
				console.error(e);
			}
		},
		async updatePassword(id, password) {
			try {
				const [[result]] = await db.query(
					'UPDATE $id SET password = crypto::argon2::generate($password)',
					{
						id,
						password
					}
				);
				return result;
			} catch (e) {
				console.error(e);
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
		async verifyEmail(id) {
			try {
				const query = `
					UPDATE $id SET verify.email.status = 'verified'
				`;

				const [[result]] = await db.query(query, { id });

				return result;
			} catch (error) {
				console.error(error);
			}
		},
		async getByEmailVerificationCode(code) {
			try {
				const query = `
					SELECT * FROM user
					WHERE verify.email.code = $code
				`;

				const [[result]] = await db.query(query, { code });

				return result;
			} catch (error) {
				console.error(error);
			}
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
		async getPhoneVerificationCode(id) {
			try {
				const query = `
					SELECT verify.phone FROM user
					WHERE id = $id
				`;

				const [[result]] = await db.query(query, { id });

				return result;
			} catch (error) {
				console.error(error);
			}
		},
		async verifyPhone(id) {
			try {
				const query = `
					UPDATE $id SET verify.phone.status = 'verified'
				`;

				const [[result]] = await db.query(query, { id });

				return result;
			} catch (error) {
				console.error(error);
			}
		},
		async create(user) {
			console.log('create:', user);
			let {
				email,
				username,
				firstName,
				lastName,
				phone,
				phonePrefix,
				password,
				password2,
				headers
			} = user;
			const { DB_NS, DB_DB } = env;

			console.log('db:', DB_NS, DB_DB);

			if (password !== password2) {
				throw new Error('Passwords do not match');
			}

			username = username.replace(/[^a-zA-Z0-9]+/g, '');
			console.log('user:', user, DB_NS, DB_DB);
			const userObject = {
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
				headers,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			console.log(userObject, '<< userObject');

			try {
				const token = await db.signup(userObject);

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

		async logout(session) {},
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
		},
		async getAll() {
			try {
				const query = `SELECT * OMIT password FROM user order by createdAt DESC`;

				const users = await db.query(query);

				return users.pop();
			} catch (e) {
				console.error(e);
			}
		},

		async delete(userId) {
			console.log('deleting:', userId);
			return await db.delete(userId);
		}
	};
};

export default {
	id: primary
};
