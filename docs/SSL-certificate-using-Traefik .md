# Create Directory in OPT
    
    cd /opt && mkdir traefik
    
# Create acme.json file
    
    touch acme.json
    chmod 600 /opt/traefik/acme.json

# after that go to docker-compose-ssl  file copy and add domain name and Email address

 [docker-compose file click here](docs/examples/docker-compose-ssl.yml)

after creating this Just run the docker-compose file that will automatically create SSL Certificate for that
