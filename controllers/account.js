import BaseController from './base-controller.js';

export default class Controller extends BaseController {
	// Render template "example/welcome.html.tmpl" with message
	async register(ctx) {
		const session = await ctx.session();
		const { user, token } = session;

		ctx.stash.msg = 'Register now';
		await ctx.render({ view: 'account/register' }, { user, token, title: 'Signup' });
	}

	async login(ctx) {
		const session = await ctx.session();
		const { user, token, referrer } = session;

		console.log('stash login: ', ctx.stash);

		// ctx.stash.msg = 'Login now';
		await ctx.render({ view: 'account/login' }, { user, token, referrer, title: 'Login' });
	}

	async loggedIn(ctx) {
		console.log('account#loggedIn');
		const session = await ctx.session();
		// session.token = ctx.stash.token;

		console.log('session: ', session);
		console.log('stash: ', ctx.stash);

		session.referrer = ctx.req.path;

		try {
			await ctx.models.account.validate(session.token);

			if (session.token !== undefined) return;
		} catch (err) {
			console.error(err);
		}

		await ctx.redirectTo('account#login');

		return false;
	}

	async signin(ctx) {
		const session = await ctx.session();
		const user = (await ctx.params()).toObject();
		console.log('signin user: ', user);

		try {
			const token = await ctx.models.account.signin(user);
			const flash = await ctx.flash();

			session.token = token;
			session.user = await ctx.models.account.me();
			ctx.stash.token = token;
			ctx.stash.username = session.user.username;
			
			flash.message = 'Thanks for logging in.';

			await ctx.redirectTo(session.referrer || 'account#me');
		} catch (err) {
			const flash = await ctx.flash();
			console.error(err, '<--- error');
			flash.message = err.message;
			flash.messageType = 'error';

			await ctx.redirectTo('account#login');
		}
	}

	async create(ctx) {
		const session = await ctx.session();
		const user = (await ctx.params()).toObject();
		const flash = await ctx.flash();

		console.log('create user: ', user);

		if (
			!user.username ||
			!user.email ||
			!user.password ||
			!user.password2 ||
			user.password !== user.password2
		) {
			// todo figure out how to throw an error here
			flash.message = 'Unable to signup.';
			flash.messageType = 'error';
			return await ctx.redirectTo('account#register');
		}
		//todo try/catch
		const token = await ctx.models.account.create(user);

		session.token = token;
		session.user = await ctx.models.account.me();
		ctx.stash.token = token;
		flash.message = 'Thanks for signing up.';

		await this.generateEmailVerifyCode(ctx);

		if (user.phone) {
			await this.generatePhoneVerifyCode(ctx);
		}

		await ctx.redirectTo('account#me');
	}

	async update(ctx) {
		const session = await ctx.session();
		const user = (await ctx.params()).toObject();
		const oldMe = await ctx.models.account.me();
		const flash = await ctx.flash();
		let { timezone, location, offset, email, phone, languages } = user;
		const settings = {
			location: location.length ? location.split(', ').map(Number) : [],
			timezone,
			offset,
			languages: languages.length ? languages.split(',') : []
		};

		phone = phone.replace(/^[^0-9]+$/g, '');
		console.log('here: ', settings);
		await ctx.models.account.update(session.user.id, { email, phone, settings });

		flash.message = 'Your profile has been updated.';
		session.user = await ctx.models.account.me();

		// resend validation code if email has been changed
		if (oldMe.email !== email) {
			await this.generateEmailVerifyCode(ctx);
		}

		if (oldMe.phone !== phone) {
			await this.generatePhoneVerifyCode(ctx);
		}

		await ctx.redirectTo('account#me');
	}

	async logout(ctx) {
		const session = await ctx.session();
		session.expires = 1;
		const flash = await ctx.flash();

		flash.message = 'You have been logged out.';
		await ctx.redirectTo('index#index');
	}

	async me(ctx) {
		const session = await ctx.session();
		const { token, user } = session;

		console.log('acccount/me');
		console.log('session: ', session);
		console.log('stash: ', ctx.stash);
		await ctx.render(
			{ view: 'account/me' },
			{ user, token }
		);
	}

	async index(ctx) {
		await ctx.render();
	}

	async users(ctx) {
		const session = await ctx.session();
		const { token, user } = session;

		await ctx.models.account.validate(token);
		const users = await ctx.models.account.all();

		await ctx.render({ view: 'account/users' }, { user, token, users });
	}

	async one(ctx) {
		console.log(ctx.stash.username, '<-- ctx');
		ctx.stash.amazon_tag = this.amazon_tag;
		const session = await ctx.session();
		const { token } = session;
		const user = await ctx.models.account.one(ctx.stash.username);
		const deals = await ctx.models.deal.byUser(user.id);
		const comments = await ctx.models.comment.byUser(user.id);

		await ctx.render(
			{ view: 'account/user' },
			{ user, token, deals, title: user.username, comments }
		);
	}

	async generateEmailVerifyCode(ctx) {
		const session = await ctx.session();
		let { token, user } = session;
		const to = user.email;

		await ctx.models.account.generateEmailVerifyCode(user.id);
		session.user = await ctx.models.account.me();

		await this.sendVerifyEmail({
			to,
			code: session.user.verify.email.code,
		});

		const flash = await ctx.flash();
		flash.message = 'A verification link has been emailed to you.';

		await ctx.redirectTo('index#index');
	}

	async generatePhoneVerifyCode(ctx) {
		const session = await ctx.session();
		let { token, user } = session;
		const to = user.phone;

		await ctx.models.account.generatePhoneVerifyCode(user.id);
		session.user = await ctx.models.account.me();

		await this.sendVerifyPhone({
			to,
			code: session.user.verify.phone.code,
		});

		const flash = await ctx.flash();
		flash.message = 'An SMS verification code has been sent to your phone.';

		await ctx.redirectTo('index#index');
	}

	async resendVerifyEmail(ctx) {
		const session = await ctx.session();
		const { token, user } = session;

		await ctx.render(
			{ view: 'account/resend/email' },
			{ user, token, title: 'Resend email verification' }
		);
	}

	async resendVerifyPhone(ctx) {
		const session = await ctx.session();
		const { token, user } = session;

		await ctx.render(
			{ view: 'account/resend/phone' },
			{ user, token, title: 'Resend phone verification' }
		);
	}

	async verifyEmailCode(ctx) {
		const session = await ctx.session();
		let { token, user } = session;
		const { code } = ctx.stash;

		// user = await ctx.models.account.me();
		const now = new Date().getTime();
		const flash = await ctx.flash();

		if (code === user.verify.email.code && now <= new Date(user.verify.email.expiration).getTime()) {
			await ctx.models.account.setEmailVerifyStatus(user.id, 'verified');
			flash.message = 'Your email has been verified!';
			const me = await ctx.models.account.me();
			session.user = me;
			await ctx.redirectTo('index#index');
		} else {
			await ctx.redirectTo('account#resendVerifyEmail');
		}
	}

	async verifyPhoneCode(ctx) {
		const session = await ctx.session();
		let { token, user } = session;
		const { code } = ctx.stash;

		// user = await ctx.models.account.me();
		const now = new Date().getTime();
		const flash = await ctx.flash();

		if (code === user.verify.phone.code && now <= new Date(user.verify.phone.expiration).getTime()) {
			await ctx.models.account.setPhoneVerifyStatus(user.id, 'verified');
			flash.message = 'Your phone number has been verified!';
			const me = await ctx.models.account.me();
			session.user = me;
			await ctx.redirectTo('index#index');
		} else {
			await ctx.redirectTo('account#resendVerifyPhone');
		}
	}

}
