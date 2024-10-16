export async function getMe(db) {
	const [auth] = await db.query('SELECT * FROM $auth');
	console.log('auth:', auth);
	const { id: userId } = auth.pop();

	console.log('userId:', userId); // userId: RecordId { tb: 'user', id: 'nwbogl0qkqa7xnpeac23' }
	const me = await db.select(userId);

	delete me?.password;
	console.log('me: ', me);
	return me;
}
