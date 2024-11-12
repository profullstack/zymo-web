import current from '@primate/session/current';

export async function getMe(db) {
	const { id } = current().get('user');
	// const [auth] = await db.query('SELECT * FROM $auth');
	// console.log('auth:', auth);
	// const { id: userId } = auth.pop();
	const [me] = await db.select(id);

	delete me?.password;
	console.log('me: ', me);
	return me;
}
