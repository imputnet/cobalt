import { Innertube } from 'youtubei.js';

const bail = (...msg) => (console.error(...msg), process.exit(1));
const tube = await Innertube.create();

tube.session.once(
    'auth-pending',
    ({ verification_url, user_code }) => console.log(
        `Open ${verification_url} in a browser and enter ${user_code} when asked for the code.`
    )
);

tube.session.once('auth-error', (err) => bail('An error occurred:', err));
tube.session.once('auth', ({ status, credentials, ...rest }) => {
    if (status !== 'SUCCESS') {
        bail('something went wrong', rest);
    }

    console.log(credentials);

    console.log(
        JSON.stringify(
            Object.entries(credentials)
                .map(([k, v]) => `${k}=${v instanceof Date ? v.toISOString() : v}`)
                .join('; ')
        )
    );
});

await tube.session.signIn();