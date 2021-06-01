---
title: Deploy with Docker
permalink: /deployment/platforms/docker
category: Deployment
subCategory: Platforms
menuOrder: 1
---

This guide walks you through deploying Cube.js with Docker.

## Prerequisites

- Docker CLI

## Deploying

### Configure and run Docker images

Go to your terminal and run the following command after replacing the
environment variables with valid values:

<!-- prettier-ignore-start -->
[[info |]]
| Using macOS or Windows? Use `CUBEJS_DB_HOST=host.docker.internal` instead of
| `localhost` if you're running your database on the same machine.
<!-- prettier-ignore-end -->

```bash
docker run --rm \
  --name cubejs-docker \
  -e CUBEJS_API_SECRET=<YOUR-API-SECRET> \
  -e CUBEJS_DB_HOST=<YOUR-DB-HOST-HERE> \
  -e CUBEJS_DB_NAME=<YOUR-DB-NAME-HERE> \
  -e CUBEJS_DB_USER=<YOUR-DB-USER-HERE> \
  -e CUBEJS_DB_PASS=<YOUR-DB-PASS-HERE> \
  -e CUBEJS_DB_TYPE=postgres \
  -v "$(pwd):/cube/conf" \
  cubejs/cube:0.27
```

> ADD CUBE STORE SETUP

## Securing

> Talk about JWT/JWK for Cube.js

> Talk about ensuring Cube Store is in private network (inaccessible from Internet)

## Monitoring

All Cube.js logs can be found by through the Docker CLI:

```bash
$ docker ps

CONTAINER ID        IMAGE                       ...
cdfbc6b94c70        cubejs/cube:0.27            ...

$ docker logs cdfbc6b94c70

...ADD LOGS HERE...
```

## Updating

Find the latest stable release version [from Docker Hub][link-cubejs-docker].
Then update your `docker run` command to use the tag:

```bash
docker run --rm \
  --name cubejs-docker \
  -e CUBEJS_API_SECRET=<YOUR-API-SECRET> \
  -e CUBEJS_DB_HOST=<YOUR-DB-HOST-HERE> \
  -e CUBEJS_DB_NAME=<YOUR-DB-NAME-HERE> \
  -e CUBEJS_DB_USER=<YOUR-DB-USER-HERE> \
  -e CUBEJS_DB_PASS=<YOUR-DB-PASS-HERE> \
  -e CUBEJS_DB_TYPE=postgres \
  -v "$(pwd):/cube/conf" \
  cubejs/cube:<LATEST_VERSION_TAG_HERE>
```

## Extending

If you need to use npm packages with native extensions inside [the `cube.js`
configuration file][ref-config-js], you'll need to build your own Docker image:

```bash
touch Dockerfile
touch .dockerignore
```

An example `Dockerfile`:

```dockerfile
FROM cubejs/cube:latest

COPY . .
RUN npm install
```

An example `.dockerignore`:

```bash
node_modules
npm-debug.log
schema
cube.js
.env
```

```bash
docker build -t <YOUR-USERNAME>/cubejs-custom-build .
```

```bash
docker run --rm \
  --name cubejs-custom-build \
  -e CUBEJS_API_SECRET=<YOUR-API-SECRET> \
  -e CUBEJS_DB_HOST=<YOUR-DB-HOST-HERE> \
  -e CUBEJS_DB_NAME=<YOUR-DB-NAME-HERE> \
  -e CUBEJS_DB_USER=<YOUR-DB-USER-HERE> \
  -e CUBEJS_DB_PASS=<YOUR-DB-PASS-HERE> \
  -e CUBEJS_DB_TYPE=postgres \
  --volume "$(pwd):/cube/conf" \
  <YOUR-USERNAME>/cubejs-custom-build
```

[link-cubejs-docker]: https://hub.docker.com/r/cubejs/cube
[ref-config-js]: /config
