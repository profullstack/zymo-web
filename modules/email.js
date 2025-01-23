import { createHash } from 'crypto';

/**
 * Generates a unique unsubscribe token for a user
 * @param {string} userId - The user's ID
 * @param {string} email - The user's email address
 * @returns {string} A SHA-256 hash that can be used as an unsubscribe token
 */
export function generateUnsubscribeToken(userId, email) {
    const data = `${userId}:${email}:${process.env.UNSUBSCRIBE_SECRET}`;
    return createHash('sha256').update(data).digest('hex');
}

/**
 * Verifies an unsubscribe token and returns the associated user ID
 * @param {string} token - The unsubscribe token to verify
 * @param {object} db - Database instance
 * @returns {Promise<string|null>} The user ID if valid, null otherwise
 */
export async function verifyUnsubscribeToken(token, db) {
    const users = await db.query('SELECT * FROM user');
    
    for (const user of users) {
        const generatedToken = generateUnsubscribeToken(user.id, user.email);
        if (generatedToken === token) {
            return user.id;
        }
    }
    
    return null;
}