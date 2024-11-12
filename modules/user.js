import current from '@primate/session/current';

export async function getMe(db, email) {
	let userId;
	console.log('has email:', email);

	if (email) {
		const [id] = (await db.query('SELECT id FROM user WHERE email = $email', { email })).pop();
		console.log('id foo:', id);
		userId = id.id;
	} else {
		const { id } = current().get('user');
		console.log('id foo2:', id);
		userId = id;
	}
	// const [auth] = await db.query('SELECT * FROM $auth');
	// console.log('auth:', auth);
	// const { id: userId } = auth.pop();
	console.log('fetching ', userId);
	const [me] = await db.select(userId);

	delete me?.password;
	console.log('me: ', me);
	return me;
}
