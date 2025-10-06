Make sure Node.js, Docker and docker compose are installed.

```
ln -s {absolute_path_to_project_root}/.env {absolute_path_to_project_root}/docker/.env
yarn install
yarn start
```

To run e2e tests:

```
yarn setup:docker:e2e
yarn test:e2e
```
