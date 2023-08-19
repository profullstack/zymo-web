export class Account {
	constructor(db) {
		this.db = db;
	}

	async create(user) {
		let { email, username, password, password2 } = user;
		const { DB_USER, DB_PASS, DB_NS, DB_DB } = process.env;

		if (password !== password2) {
			throw new Error('Passwords do not match');
		}

		username = username.replace(/[^a-zA-Z0-9]+/g, '');
		console.log(user);

		let token = await this.db.signup({
			NS: DB_NS,
			DB: DB_DB,
			SC: 'allusers',
			email,
			username,
			password,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		});

		console.log('token: ', token);
		return token;
	}

	async update(id, user) {
		console.log('update:', user);
		const { location } = user.settings;
		const now = new Date();
		console.log('location:', location);
		console.log('languages:', user.settings.languages);

		if (!location.length) {
			const me = (
				await this.db.query(`UPDATE $id SET email = $email, phone = $phone, settings = $settings, updatedAt = $now`, {
					id,
					email: user.email,
					phone: user.phone,
					settings: user.settings,
					now,
				})
			)
				.pop()
				.result.pop();

			console.log('new me:', me);
			return me;
		}

		delete user.settings.location;
		const me = (
			await this.db.query(
				`UPDATE $id SET email = $email, phone = $phone, settings = $settings, settings.location = (${location}), updatedAt = $now`,
				{
					id,
					email: user.email,
					phone: user.phone,
					settings: user.settings,
					now,
				}
			)
		)
			.pop()
			.result.pop();

		console.log('new me:', me);
		return me;
	}

	async signin(user) {
		const { email, password } = user;
		const { DB_USER, DB_PASS, DB_NS, DB_DB } = process.env;

		console.log(user);

		try {
			let token = await this.db.signin({
				NS: DB_NS,
				DB: DB_DB,
				SC: 'allusers',
				email,
				password
			});

			console.log('token: ', token);

			const me = await this.me();
			const { id } = me;
			const now = new Date();

			await this.db.query(`UPDATE $id SET loggedInAt = $now`, {
				id,
				now,
			})

			return token;
		} catch (err) {
			throw new Error(err);
		}
	}

	async validate(token) {
		console.log('validate token: ', token);
		await this.db.authenticate(token);
	}

	async me() {
		const me = await this.db.info();
		delete me.password;
		console.log('me: ', me.email);
		return me;
	}

	async one(username) {
		const user = (
			await this.db.query('select * from user WHERE username = $username', {
				username
			})
		)
			.pop()
			.result?.pop();

		console.log('user: ', user);
		return user;
	}

	async all() {
		const result = (
			await this.db.query('SELECT id, username, email, settings, createdAt FROM user ORDER BY createdAt DESC')
		).pop().result;

		console.log('users: ', result);
		return result;
	}

	async total() {
		return (await this.db.query('SELECT count() AS total FROM user GROUP BY total')).pop().result?.pop();
	}

	async generateEmailVerifyCode(id) {
		const code = Math.random().toString(36).substr(2, 10);
		const expiration = new Date(Date.now() + 2 * (60 * 60 * 1000));

		const result = (
			await this.db.query("UPDATE $id SET verify.email.code = $code, verify.email.status = 'pending', verify.email.expiration = $expiration", {
				id,
				code,
				expiration
			})
		).pop()
			.result
			.pop();

		console.log('user: ', result);
		return result;
	}

	async generatePhoneVerifyCode(id) {
		const code = Math.random().toString().substr(2, 6);
		const expiration = new Date(Date.now() + 2 * (60 * 60 * 1000));

		const result = (
			await this.db.query("UPDATE $id SET verify.phone.code = $code, verify.phone.status = 'pending', verify.phone.expiration = $expiration", {
				id,
				code,
				expiration
			})
		).pop()
			.result
			.pop();

		console.log('user: ', result);
		return result;
	}

	async setEmailVerifyStatus(id, status = 'pending') {
		console.log('set status:', id, status);
		const result = (
			await this.db.query('UPDATE $id SET verify.email.status = $status', { id, status })
		).pop().result;

		console.log('user: ', result);
		return result;
	}

	async setPhoneVerifyStatus(id, status = 'pending') {
		console.log('set status:', id, status);
		const result = (
			await this.db.query('UPDATE $id SET verify.phone.status = $status', { id, status })
		).pop().result;

		console.log('user: ', result);
		return result;
	}
}
