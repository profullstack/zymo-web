import {view} from "primate";

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
    const {session, query} = request;

    if (session.exists) {
      // session exists
    } else {
      // show form
      return form();
    }
  },
  async post(request) {
    const {session, query, store} = request;

    const {register: {Form}} = store;
    try {
      await Form.validate(request.body.get());
      const {external: {Mailgun}} = store;
      await Mailgun.send({
        to: request.body.get("email"),
        subject: "Your one-time login is 123456",
        text: "Use your one-time login 123456 to log in",
      });
//    await session.create({loggedIn: true});
      //return redirect(query.get("next") ?? "/");
      return "success";
    } catch({errors}) {
      return form({errors});
    }
  },
};
