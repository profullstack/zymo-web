export async function getMe(db) {
	const [auth] = await db.query('SELECT * FROM $auth');
	console.log('auth:', auth);
	const { id: userId } = auth.pop();
	const [me] = await db.select(userId);

	delete me?.password;
	console.log('me: ', me);
	return me;
}