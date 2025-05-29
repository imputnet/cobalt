services:
    cobalt:
        image: ghcr.io/imputnet/cobalt:11

        init: true
        read_only: true
        restart: unless-stopped
        container_name: cobalt

        ports:
            - 9000:9000/tcp
            # if you use a reverse proxy (such as nginx),
            # uncomment the next line and remove the one above (9000:9000/tcp):
            # - 127.0.0.1:9000:9000

        environment:
            # replace https://api.url.example/ with your instance's url
            # or else tunneling functionality won't work properly
            API_URL: "https://api.url.example/"

            # if you want to use cookies for fetching data from services,
            # uncomment the next line & volumes section
            # COOKIE_PATH: "/cookies.json"

            # it's recommended to configure bot protection or api keys if the instance is public,
            # see /docs/protect-an-instance.md for more info

            # see /docs/run-an-instance.md for more variables that you can use here

        labels:
            - com.centurylinklabs.watchtower.scope=cobalt

        # uncomment only if you use the COOKIE_PATH variable
        # volumes:
            # - ./cookies.json:/cookies.json

    # watchtower updates the cobalt image automatically
    watchtower:
        image: ghcr.io/containrrr/watchtower
        restart: unless-stopped
        command: --cleanup --scope cobalt --interval 900 --include-restarting
        volumes:
            - /var/run/docker.sock:/var/run/docker.sock

    # if needed, use this image for automatically generating poToken & visitor_data
    # yt-session-generator:
    #     image: ghcr.io/imputnet/yt-session-generator:webserver

    #     init: true
    #     restart: unless-stopped
    #     container_name: yt-session-generator
    #     labels:
    #       - com.centurylinklabs.watchtower.scope=cobalt
