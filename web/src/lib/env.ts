import { env } from "$env/dynamic/public";

const variables = {
    HOST: env.PUBLIC_HOST,
    PLAUSIBLE_HOST: env.PUBLIC_PLAUSIBLE_HOST,
    PLAUSIBLE_ENABLED: env.PUBLIC_HOST && env.PUBLIC_PLAUSIBLE_HOST,
}

export default variables;
