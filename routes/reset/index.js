import { view, redirect } from "primate";

const form = (params = {}) => view("reset/Form.svelte", { ...params });

export default {
	get(request) {
		const { session, query } = request;
		return form();
	},
	async post(request) {
		const { session, store, body } = request;

		const {
			reset: { Form, Reset },
			external: { Mailgun },
			User
		} = store;

		try {
			const body = request.body;
			await Form.validate(body);

			const email = body.email;
			const user = await User.getByEmail(email);

			if (!user) {
				return view("reset/Form.svelte", { status: "No user found with that email address" })
			}

			const result = await User.generatePasswordResetToken(user.id);

			if (result) {
				const response = await Mailgun.sendPasswordResetEmail({ token: result.passwordReset.token, to: email });
				if (response.ok) {
					return view("reset/Form.svelte", { status: "Click the link sent to your email to reset your password" })
				}
			}

			return view("reset/Form.svelte", { status: "An error occured" });
		} catch ({ errors }) {
			return form({ errors });
		}
	},
};
