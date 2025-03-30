# Custom Settings for download.node.ua

This file documents the custom settings for our Cobalt instance.

## Environment Variables

When building or running the web frontend, use these environment variables:

```env
WEB_HOST=download.node.ua
WEB_DEFAULT_API=https://download.node.ua/
# Uncomment if you use Plausible analytics
# WEB_PLAUSIBLE_HOST=your-plausible-host.com
```

## API Configuration

The API settings in docker-compose.yml:

```yaml
environment:
  # API URL configured to your domain
  API_URL: "https://download.node.ua/"

  # For Collify integration
  CORS_WILDCARD: "0"
  CORS_URL: "https://download.node.ua"
```

## Cookie Configuration

We're using a helper container to provide the cookies:

```yaml
cookie-helper:
  build: ./cookie-helper
  container_name: cobalt-cookie-helper
  volumes:
    - cookie-data:/cookies

# In the API container:
volumes:
  - cookie-data:/cookies:ro
``` 