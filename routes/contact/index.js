import view from "primate/handler/view"
import redirect from "primate/handler/redirect"

export default {
	get(request) {
		const { env } = process;
		const { APP_NAME, APP_DESCRIPTION, PHONE } = env;
		const { query } = request;
		const status = query.get('status');
		const ref = query.get('ref');

		console.log(status, ref);

		return view('Contact.svelte', { APP_NAME, APP_DESCRIPTION, PHONE, status, ref });
	},

	async post(request) {
		const { session, store } = request;
		const { env } = process;
		const { APP_NAME, APP_DESCRIPTION } = env;

		const {
			external: { Mailgun }
		} = store;
		try {
			const data = request.body;
			const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown';
			console.log('post form:', data);

			try {
				const body = {
					subject: `Contact: ${APP_NAME}`,
					to: env.TO_EMAIL,
					from: data.email,
					text: `
					Name: ${data.firstName} ${data.lastName}
					Email: ${data.email}
					Phone: ${data.phone}
					IP Address: ${clientIp}
					------
					Service: ${data.service}
					Link: ${data.link}
					Description: ${data.details}

					Budget: ${data.budget}
					`
				};
				await Mailgun.send(body);
			} catch (err) {
				console.error(err);
			}

			return redirect('/contact?status=ok');
		} catch ({ errors }) {
			console.error(errors);
			return redirect('/contact');
		}
	}
};
