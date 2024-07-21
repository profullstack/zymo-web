import { Response, Status, error} from 'primate';

function isEmail(email) {
    var emailFormat = /^[a-zA-Z0-9_.+]+(?<!^[0-9]*)@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (email !== '' && email.match(emailFormat)) { return true; }
    
    return false;
}

export default {
	async post(request) {
		const { store, body } = request;
        const { Waitlist } = store;
        const { email } = body;

        if (!email || !isEmail(email)) {
            return error("Please provide a valid email address", { status: Status.INTERNAL_SERVER_ERROR })
        }
        try {
		    await Waitlist.add(email);
        } catch(e) {
            return error("Email already exists", { status: Status.INTERNAL_SERVER_ERROR })
        }

        return new Response("created!",{ status: Status.OK })
	}
};
