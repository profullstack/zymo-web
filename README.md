# hynt-web

![GitHub](https://img.shields.io/github/license/profullstack/hynt-web)
![GitHub issues](https://img.shields.io/github/issues/profullstack/hynt-web)
![GitHub stars](https://img.shields.io/github/stars/profullstack/hynt-web)
![GitHub last commit](https://img.shields.io/github/last-commit/profullstack/hynt-web)

## installation

- install surrealdb:

https://surrealdb.com/install

### linux

    curl -sSf https://install.surrealdb.com | sh

### brew (macos)

    brew install surrealdb/tap/surreal

### windows

    iwr https://windows.surrealdb.com -useb | iex



## run surreal db:

    npm run db:start

In another shell window start the app:

    npm run dev

Keep both windows open. You can run commands directly on db server with `npm run db:console`.

