# how to run a cobalt instance
## using docker compose and package from github (recommended)
to run the cobalt docker package, you need to have `docker` and `docker-compose` installed and configured.

if you need help with installing docker, follow *only the first step* of these tutorials by digitalocean:
- [how to install docker](https://www.digitalocean.com/community/tutorial-collections/how-to-install-and-use-docker)
- [how to install docker compose](https://www.digitalocean.com/community/tutorial-collections/how-to-install-docker-compose)

## how to run a cobalt docker package:
1. create a folder for cobalt config file, something like this:
    ```sh
    mkdir cobalt
    ```

2. go to cobalt folder, and create a docker compose config file:
    ```sh
    cd cobalt && nano docker-compose.yml
    ```
    i'm using `nano` in this example, it may not be available in your distro. you can use any other text editor.

3. copy and paste the [sample config from here](examples/docker-compose.example.yml) for either web or api instance (or both, if you wish) and edit it to your needs.
    make sure to replace default URLs with your own or cobalt won't work correctly.

4. finally, start the cobalt container (from cobalt directory):
    ```sh
    docker compose up -d
    ```

if you want your instance to support services that require authentication to view public content, create `cookies.json` file in the same directory as `docker-compose.yml`. example cookies file [can be found here](examples/cookies.example.json).

cobalt package will update automatically thanks to watchtower.

it's highly recommended to use a reverse proxy (such as nginx) if you want your instance to face the public internet. look up tutorials online.

## run cobalt api outside of docker (useful for local development)
requirements:
- node.js >= 18
- git
- pnpm

1. clone the repo: `git clone https://github.com/imputnet/cobalt`.
2. go to api/src directory: `cd cobalt/api/src`.
3. install dependencies: `pnpm install`.
4. create `.env` file in the same directory.
5. add needed environment variables to `.env` file. only `API_URL` is required to run cobalt.
    - if you don't know what api url to use for local development, use `http://localhost:9000/`.
6. run cobalt: `pnpm start`.

### ubuntu 22.04 workaround
`nscd` needs to be installed and running so that the `ffmpeg-static` binary can resolve DNS ([#101](https://github.com/imputnet/cobalt/issues/101#issuecomment-1494822258)):

```bash
sudo apt install nscd
sudo service nscd start
```

## list of environment variables for api
| variable name         | default   | example                 | description |
|:----------------------|:----------|:------------------------|:------------|
| `API_PORT`            | `9000`    | `9000`                  | changes port from which api server is accessible. |
| `API_LISTEN_ADDRESS`  | `0.0.0.0` | `127.0.0.1`             | changes address from which api server is accessible. **if you are using docker, you usually don't need to configure this.** |
| `API_URL`             | ➖        | `https://api.cobalt.tools/` | changes url from which api server is accessible. <br> ***REQUIRED TO RUN THE API***. |
| `API_NAME`            | `unknown` | `ams-1`                 | api server name that is shown in `/api/serverInfo`. |
| `API_EXTERNAL_PROXY`  | ➖        | `http://user:password@127.0.0.1:8080`| url of the proxy that will be passed to [`ProxyAgent`](https://undici.nodejs.org/#/docs/api/ProxyAgent) and used for all external requests. HTTP(S) only. |
| `CORS_WILDCARD`       | `1`       | `0`                     | toggles cross-origin resource sharing. <br> `0`: disabled. `1`: enabled. |
| `CORS_URL`            | not used  | `https://cobalt.tools`  | cross-origin resource sharing url. api will be available only from this url if `CORS_WILDCARD` is set to `0`. |
| `COOKIE_PATH`         | not used  | `/cookies.json`         | path for cookie file relative to main folder. |
| `PROCESSING_PRIORITY` | not used  | `10`                    | changes `nice` value* for ffmpeg subprocess. available only on unix systems. |
| `FREEBIND_CIDR`       | ➖        | `2001:db8::/32`         | IPv6 prefix used for randomly assigning addresses to cobalt requests. only supported on linux systems. see below for more info. |
| `RATELIMIT_WINDOW`    | `60`      | `120`                   | rate limit time window in **seconds**. |
| `RATELIMIT_MAX`       | `20`      | `30`                    | max requests per time window. requests above this amount will be blocked for the rate limit window duration. |
| `DURATION_LIMIT`      | `10800`   | `18000`                 | max allowed video duration in **seconds**. |
| `TUNNEL_LIFESPAN`     | `90`      | `120`                   | the duration for which tunnel info is stored in ram, **in seconds**. |
| `TURNSTILE_SITEKEY`   | ➖        | `1x00000000000000000000BB` | [cloudflare turnstile](https://www.cloudflare.com/products/turnstile/) sitekey used by browser clients to request a challenge.\*\* |
| `TURNSTILE_SECRET`    | ➖        | `1x0000000000000000000000000000000AA` | [cloudflare turnstile](https://www.cloudflare.com/products/turnstile/) secret used by cobalt to verify the client successfully solved the challenge.\*\* |
| `JWT_SECRET`          | ➖        | ➖                      | the secret used for issuing JWT tokens for request authentication. to choose a value, generate a random, secure, long string (ideally >=16 characters).\*\* |
| `JWT_EXPIRY`          | `120`     | `240`                  | the duration of how long a cobalt-issued JWT token will remain valid, in seconds. |
| `API_KEY_URL`         | ➖        | `file://keys.json`      | the location of the api key database. for loading API keys, cobalt supports HTTP(S) urls, or local files by specifying a local path using the `file://` protocol. see the "api key file format" below for more details.  |
| `API_AUTH_REQUIRED`   | ➖        | `1`                     | when set to `1`, the user always needs to be authenticated in some way before they can access the API (either via an api key or via turnstile, if enabled). |
| `API_REDIS_URL`       | ➖        | `redis://localhost:6379` | when set, cobalt uses redis instead of internal memory for the tunnel cache. |
| `API_INSTANCE_COUNT`  | ➖        | `2`                     | supported only on Linux and node.js `>=23.1.0`. when configured, cobalt will spawn multiple sub-instances amongst which requests will be balanced. |
| `DISABLED_SERVICES`   | ➖        | `bilibili,youtube`       | comma-separated list which disables certain services from being used. |

\* the higher the nice value, the lower the priority. [read more here](https://en.wikipedia.org/wiki/Nice_(Unix)).

\*\* in order to enable turnstile bot protection, all three **`TURNSTILE_SITEKEY`, `TURNSTILE_SECRET` and `JWT_SECRET`** need to be set.

#### FREEBIND_CIDR
setting a `FREEBIND_CIDR` allows cobalt to pick a random IP for every download and use it for all
requests it makes for that particular download. to use freebind in cobalt, you need to follow its [setup instructions](https://github.com/imputnet/freebind.js?tab=readme-ov-file#setup) first. if you configure this option while running cobalt
in a docker container, you also need to set the `API_LISTEN_ADDRESS` env to `127.0.0.1`, and set
`network_mode` for the container to `host`.

## api key file format
the file is a JSON-serialized object with the following structure:
```typescript

type KeyFileContents = Record<
    UUIDv4String,
    {
        name?: string,
        limit?: number | "unlimited",
        ips?: (CIDRString | IPString)[],
        userAgents?: string[]
    }
>;
```

where *`UUIDv4String`* is a stringified version of a UUIDv4 identifier.
- **name** is a field for your own reference, it is not used by cobalt anywhere.

- **`limit`** specifies how many requests the API key can make during the window specified in the `RATELIMIT_WINDOW` env.
    - when omitted, the limit specified in `RATELIMIT_MAX` will be used.
    - it can be also set to `"unlimited"`, in which case the API key bypasses all rate limits.

- **`ips`** contains an array of allowlisted IP ranges, which can be specified both as individual ips or CIDR ranges (e.g. *`["192.168.42.69", "2001:db8::48", "10.0.0.0/8", "fe80::/10"]`*).
    - when specified, only requests from these ip ranges can use the specified api key.
    - when omitted, any IP can be used to make requests with that API key.

- **`userAgents`** contains an array of allowed user agents, with support for wildcards (e.g. *`["cobaltbot/1.0", "Mozilla/5.0 * Chrome/*"]`*).
    - when specified, requests with a `user-agent` that does not appear in this array will be rejected.
    - when omitted, any user agent can be specified to make requests with that API key.

- if both `ips` and `userAgents` are set, the tokens will be limited by both parameters.
- if cobalt detects any problem with your key file, it will be ignored and a warning will be printed to the console.

an example key file could look like this:
```json
{
    "b5c7160a-b655-4c7a-b500-de839f094550": {
        "limit": 10,
        "ips": ["10.0.0.0/8", "192.168.42.42"],
        "userAgents": ["*Chrome*"]
    },
    "b00b1234-a3e5-99b1-c6d1-dba4512ae190": {
        "limit": "unlimited",
        "ips": ["192.168.1.2"],
        "userAgents": ["cobaltbot/1.0"]
    }
}
```

if you are configuring a key file, **do not use the UUID from the example** but instead generate your own. you can do this by running the following command if you have node.js installed:
`node -e "console.log(crypto.randomUUID())"`
