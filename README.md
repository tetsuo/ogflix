# ogflix

search and watch movie trailers.

### Prerequisites

You need to have nodejs (`>= 12`), npm (`>= 6`) and Docker installed on your system.

### Building server

Build server

```
npm run build
```

Start TypeScript compiler in watch mode

```
npm run watch
```

`watch` command removes the `lib` folder first, make sure you don't have anything important in it.

Start a server on port `8000`

```
THEMOVIEDB_API_KEY=yourkey \
PORT=8000 \
  npm run start
```

Start the nginx container

```
docker-compose up
```

Navigate to [localhost:8080/api](http://localhost:8080/api) to see the REST API running.

nginx will serve the static content from the mounted `public` folder and proxy requests on the `/api` path to the nodejs application running on the host machine on port `8000`.

`docker-compose.yml` is for development only, do not use it in production. (See: [Shipping to production](#shipping-to-production))

#### Environment variables

- `PORT` is by default `8000`
- `THEMOVIEDB_API_KEY` should be set to your [themoviedb.org](https://www.themoviedb.org) API key and has no default. You can obtain your key from [this page](https://www.themoviedb.org/settings/api).
- `DATA_DIR` should be set to a dir where you want to store [hypertrie](https://github.com/hypercore-protocol/hypertrie) data. By default, this is set to the relative `data` directory.

### Building react

Build react app

```
npm run webpack
```

Navigate to [localhost:8080](http://localhost:8080) to see the application running. Note that, you should also run the server on a separate process.

Start webpack in watch mode

```
npm run webpack -- --watch
```

Get build stats

```
npm run webpack-stats
```

### Testing

Unit tests are written using [Jest](https://jestjs.io/).

To run Jest, type

```
npm run jest
```

Run Jest in watch mode

```
npm run jest -- --watch --runInBand
```

- Test assertions are simply done with the native `assert` module
- Jest will collect coverage from the `src` folder, excluding `src/react`

Links:

- [Debugging Jest tests with VScode](https://github.com/microsoft/vscode-recipes/tree/master/debugging-jest-tests)

#### Linting & formatting

[ESlint](https://eslint.org/) is used for linting and [Prettier](https://prettier.io/) for code-formatting.

Run linter

```
npm run lint
```

Run code formatter

```
npm run prettier
```

To run them all in one go, type `npm test`

## API

#### Requests and data formats

All requests to the ogflix API are HTTP GET requests. API responses are only available in JSON format. No authentication required.

#### Errors

When something goes wrongs, ogflix will respond with the appropriate HTTP status code and an `AppError`. This can be one of:

- `ValidationError`: Thrown when user input can't be validated
- `ProviderError`: Thrown when TMDb fails to respond with valid payload
- `NotFoundError`: Requested resource not found on this server
- `ServerError`: Generic server error
- `MethodError`: Method not allowed

See [domain/error.ts](./src/domain/error.ts) file for details.

### Search movies

```
GET /api/results?search_query=QUERY
```

Responds with a `SearchResultSet` object. See [domain/tmdb.ts](./src/domain/tmdb.ts).

### Retrieve information about a movie

```
GET /api/movie/ID
```

Responds with a `Movie` object. See [domain/tmdb.ts](./src/domain/tmdb.ts).

## Shipping to production

### Continuous integration

GitHub Actions is being used to automate the build, test and deployment of the application to Heroku with Docker. Pushing to master branch will automatically trigger a new build process.

#### CI secrets

- `HEROKU_API_KEY` should be set to your Heroku API key. See [this page](https://help.heroku.com/PBGP6IDE/how-should-i-generate-an-api-key-that-allows-me-to-use-the-heroku-platform-api).
- `HEROKU_APP_NAME` is your unique Heroku app name
- `HEROKU_EMAIL` is your Heroku login email
- `THEMOVIEDB_API_KEY` should be set to your [themoviedb.org](https://www.themoviedb.org) API key

You can set them in [Settings > Secrets](https://github.com/tetsuo/ogflix/settings/secrets).

#### Production build

(These steps are automatically executed by the GitHub Actions pipeline. Following instructions are for debugging it locally.)

Run `npm run release` to get an optimized webpack build. This command will remove the `lib` folder first and re-build the server as well.

A `Dockerfile` that bundles nginx with node v12.x can be found in the top-level. You can build an image with it after `npm run release` is run.

Build image

```
docker build -t ogflix:latest .
```

To run this, you need to provide the `PORT` and the `THEMOVIEDB_API_KEY` environment variables. The `PORT` in here is different than the one you set while running the nodejs app. This one is used to set which port number nginx will bind to. While testing locally you can map the same port to your host machine.

```
docker run -it --rm \
  -e PORT=8020 \
  -e THEMOVIEDB_API_KEY=xxx \
  -p 8620:8020
```

This will run nginx on port `8020` and bind it to `8620`. Navigate to [localhost:8620](http://localhost:8620) to see the application running.

Related:

- [Building Docker images with `heroku.yml`](https://devcenter.heroku.com/articles/build-docker-images-heroku-yml)
- [Heroku-deploy GitHub Action plugin](https://github.com/AkhileshNS/heroku-deploy)
