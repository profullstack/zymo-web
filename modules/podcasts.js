import spawn from '@rcompat/stdio/spawn';


async function search(q) {
    try {
        const command = './bin/podsearch';
        const args = `"${q}"`;
        const fullCommand = `${command} ${args}`;

        console.log(fullCommand);
        const { stdout } = spawn(fullCommand);

        return new Response(stdout, { headers: { 'context-type': 'application/json' } });
    } catch (err) {
        console.error(err);
        return new Response(err);
    }
}

export { search };