# how to run a cobalt app
this tutorial will help you run your own cobalt app. if your app is public-facing, we highly recommend that you also [protect it from abuse](/docs/protect-an-instance.md) using turnstile or api keys or both.

## install
to run the cobalt app, you need to have `docker`, `docker-compose` and `git` installed and configured.

if you need help with installing docker or git, you can find more information here:
- [how to install docker](https://docs.docker.com/engine/install/)
- [how to install docker compose](https://docs.docker.com/compose/install/)
- [how to install git](https://git-scm.com/downloads)

## start cobalt app
1. clone repository:
    ```git
    git clone https://github.com/imputnet/cobalt.git
    ```
2. go to cobalt folder:
    ```sh
    cd cobalt
    ```
3.  run a docker-compose file
    ```
    docker-compose up
    ```
    don't forget to change the **WEB_DEFAULT_API** in the `Dockerfile.client` and **API_URL**  in `docker-compose.yml` file to your own values.