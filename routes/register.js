import {view, redirect} from "primate";

const form = (params = {}) => view("register/Form.svelte", {...params});

/*

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

  */
 
export default {
  get(request) {
    const {session} = request;

    if (session.exists) {
      // session exists
    } else {
      // show form
      return form();
    }
  },
  async post(request) {
    const {session, store} = request;

    const {register: {Form}, User} = store;
    try {
      const user = request.body.get();
      console.log(user);

      // validate
      await Form.validate(user);

      const token = await User.create(user);
      const me = await User.me();

      console.log(token, me);

      await session.create({token, user: me });

      await User.generateEmailVerifyCode(user.id);

      if (user.phone) {
        await User.generatePhoneVerifyCode(user.id);
      }

      // todo: add a way to flash something to the user, can use a hash for now
      // for example: #me&flash=Some message
      return redirect("/dashboard");

    } catch({errors}) {
      console.error(errors);
      return form({errors});
    }
  },
};
