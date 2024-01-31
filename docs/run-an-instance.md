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

3. copy and paste the [sample config from here](https://github.com/wukko/cobalt/blob/current/docs/examples/docker-compose.example.yml) for either web or api instance (or both, if you wish) and edit it to your needs.  
    make sure to replace default URLs with your own or cobalt won't work correctly.  

4. finally, start the cobalt container (from cobalt directory):
    ```sh
    docker compose up -d
    ```

if you want your instance to support services that require authentication to view public content, create `cookies.json` file in the same directory as `docker-compose.yml`. example cookies file [can be found here](https://github.com/wukko/cobalt/blob/current/docs/examples/cookies.example.json).

cobalt package will update automatically thanks to watchtower.

it's highly recommended to use a reverse proxy (such as nginx) if you want your instance to face the public internet. look up tutorials online.

## using regular node.js (useful for local development)
setup script installs all needed `npm` dependencies, but you have to install `node.js` *(version 18 or above)* and `git` yourself.

1. clone the repo: `git clone https://github.com/wukko/cobalt`.
2. run setup script and follow instructions: `npm run setup`. you need to host api and web instances separately, so pick whichever applies.
3. run cobalt via `npm start`.
4. done.

### ubuntu 22.04 workaround
`nscd` needs to be installed and running so that the `ffmpeg-static` binary can resolve DNS ([#101](https://github.com/wukko/cobalt/issues/101#issuecomment-1494822258)):

```bash
sudo apt install nscd
sudo service nscd start
```
