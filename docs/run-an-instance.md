# how to host a cobalt instance yourself
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

## using regular node.js (useful for local development)
setup script installs all needed `npm` dependencies, but you have to install `node.js` *(version 18 or above)* and `git` yourself.

1. clone the repo: `git clone https://github.com/imputnet/cobalt`.
2. run setup script and follow instructions: `npm run setup`. you need to host api and web instances separately, so pick whichever applies.
3. run cobalt via `npm start`.
4. done.

### ubuntu 22.04 workaround
`nscd` needs to be installed and running so that the `ffmpeg-static` binary can resolve DNS ([#101](https://github.com/imputnet/cobalt/issues/101#issuecomment-1494822258)):

```bash
sudo apt install nscd
sudo service nscd start
```

## list of all environment variables
### variables for api
| variable name         | default   | example                 | description |
|:----------------------|:----------|:------------------------|:------------|
| `API_PORT`            | `9000`    | `9000`                  | changes port from which api server is accessible. |
| `API_LISTEN_ADDRESS`  | `0.0.0.0` | `127.0.0.1`             | changes address from which api server is accessible. **if you are using docker, you usually don't need to configure this.** |
| `API_URL`             | ➖        | `https://co.wuk.sh/`    | changes url from which api server is accessible. <br> ***REQUIRED TO RUN THE API***. |
| `API_NAME`            | `unknown` | `ams-1`                 | api server name that is shown in `/api/serverInfo`. |
| `CORS_WILDCARD`       | `1`       | `0`                     | toggles cross-origin resource sharing. <br> `0`: disabled. `1`: enabled. |
| `CORS_URL`            | not used  | `https://cobalt.tools/` | cross-origin resource sharing url. api will be available only from this url if `CORS_WILDCARD` is set to `0`. |
| `COOKIE_PATH`         | not used  | `/cookies.json`         | path for cookie file relative to main folder. |
| `TIKTOK_DEVICE_INFO`  | ➖        | *see below*             | device info (including `iid` and `device_id`) for tiktok functionality. required for tiktok to work. see below for more info. |
| `PROCESSING_PRIORITY` | not used  | `10`                    | changes `nice` value* for ffmpeg subprocess. available only on unix systems. |
| `FREEBIND_CIDR`       | ➖        | `2001:db8::/32`         | IPv6 prefix used for randomly assigning addresses to cobalt requests. only supported on linux systems. see below for more info. |
| `RATELIMIT_WINDOW`    | `60`      | `120`                   | rate limit time window in **seconds**. |
| `RATELIMIT_MAX`       | `20`      | `30`                    | max requests per time window. requests above this amount will be blocked for the rate limit window duration. |
| `DURATION_LIMIT`      | `10800`   | `18000`                 | max allowed video duration in **seconds**. |

\* the higher the nice value, the lower the priority. [read more here](https://en.wikipedia.org/wiki/Nice_(Unix)).

#### TIKTOK_DEVICE_INFO
you need to get your own device info for tiktok functionality to work. this can be done by proxying the app through any request-intercepting proxy (such as [mitmproxy](https://mitmproxy.org)). you need to disable ssl pinning to see requests. there will be no assistance provided by cobalt for this.

example config (replace **ALL** values with ones you got from mitm):
```
'{
    "iid": "<install_id here>",
    "device_id": "<device_id here>",
    "channel": "googleplay",
    "app_name": "musical_ly",
    "version_code": "310503",
    "device_platform": "android",
    "device_type": "Redmi+7",
    "os_version": "13"
}'
```

you can compress the json to save space. if you're using a `.env` file then the line would would look like this (***note the quotes***):
```
TIKTOK_DEVICE_INFO='{"iid":"<install_id here>","device_id":"<device_id here>","channel":"googleplay","app_name":"musical_ly","version_code":"310503","device_platform":"android","device_type":"Redmi+7","os_version":"13"}'
```

#### FREEBIND_CIDR
setting a `FREEBIND_CIDR` allows cobalt to pick a random IP for every download and use it for all
requests it makes for that particular download. to use freebind in cobalt, you need to follow its [setup instructions](https://github.com/imputnet/freebind.js?tab=readme-ov-file#setup) first. if you configure this option while running cobalt
in a docker container, you also need to set the `API_LISTEN_ADDRESS` env to `127.0.0.1`, and set
`network_mode` for the container to `host`.

### variables for web
| variable name        | default              | example                 | description                                                                           |
|:---------------------|:---------------------|:------------------------|:--------------------------------------------------------------------------------------|
| `WEB_PORT`           | `9001`               |  `9001`                 | changes port from which frontend server is accessible.                                |
| `WEB_URL`            | ➖                   | `https://cobalt.tools/` | changes url from which frontend server is accessible. <br> ***REQUIRED TO RUN WEB***. |
| `API_URL`            | `https://co.wuk.sh/` | `https://co.wuk.sh/`    | changes url which is used for api requests by frontend clients.                       |
| `SHOW_SPONSORS`      | `0`                  | `1`                     | toggles sponsor list in about popup. <br> `0`: disabled. `1`: enabled.                |
| `IS_BETA`            | `0`                  | `1`                     | toggles beta tag next to cobalt logo. <br> `0`: disabled. `1`: enabled.               |
| `PLAUSIBLE_HOSTNAME` | ➖                   | `plausible.io`*         | enables plausible analytics with provided hostname as receiver backend.               |

\* don't use plausible.io as receiver backend unless you paid for their cloud service. use your own domain when hosting community edition of plausible. refer to their [docs](https://plausible.io/docs) when needed.
