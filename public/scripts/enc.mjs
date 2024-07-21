import * as openpgp from 'https://unpkg.com/openpgp@5.11.0/dist/openpgp.min.mjs';

const message = await openpgp.createMessage({ binary: new Uint8Array([0x01, 0x01, 0x01]) });
const encrypted = await openpgp.encrypt({
		message, // input as Message object
		passwords: ['secret stuff'], // multiple passwords possible
		format: 'binary' // don't ASCII armor (for Uint8Array output)
});
console.log(encrypted); // Uint8Array

const encryptedMessage = await openpgp.readMessage({
		binaryMessage: encrypted // parse encrypted bytes
});
const { data: decrypted } = await openpgp.decrypt({
		message: encryptedMessage,
		passwords: ['secret stuff'], // decrypt with password
		format: 'binary' // output as Uint8Array
});
console.log(decrypted); // Uint8Array([0x01, 0x01, 0x01])
