# Create Directory in OPT
    ```sh
    cd /opt && mkdir traefik
    ```
# create acme.json file in /opt/traefik/
    ```sh
    touch acme.json
    chmod 600 /opt/traefik/acme.json
    ```

# after that go to docker-compose-ssl  file copy and add domain name and Email address

 [docker-compose file click here](examples/docker-compose-traefik.yml)

 copy the code and paste it and chagne the domain name and email address


after creating this Just run the docker-compose file that will automatically create SSL Certificate for that Cobalt instance
