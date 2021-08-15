# adalia.info [![Server test](https://github.com/jisensee/adalia.info/actions/workflows/server-test.yml/badge.svg?branch=main)](https://github.com/jisensee/adalia.info/actions/workflows/server-test.yml) [![Client test](https://github.com/jisensee/adalia.info/actions/workflows/client-test.yml/badge.svg?branch=main)](https://github.com/jisensee/adalia.info/actions/workflows/client-test.yml)
A community site for [Influence](https://www.influenceth.io/), a space strategy MMO running on the Etheurm blockchain.

## Support

This site is run privately and does not receive regular funding.  
Please check out [how to support](https://adalia.info/support) this project to keep the site runnig.

Join the [discord server](https://discord.gg/XynYK5yCQy) to chat about the site!

## Contributing

All help is welcome. Check out the following sections to learn about the tech stack and instructions on how to develop for it.  
Feel free to hit me up on discord if you have questions and we can have a chat.

## Architecture

The site runs on 4 services:

- MongoDB: Database that holds all the asteroid and other metadata
- Server: Imports asteroid data into the database and serves them on a [GraphQL](https://graphql.org/)-API
- Client: Nginx server that serves the actual website
- proxy: Nginx server that acts as reverse proxy to route requests either to the client or server service

## Running it locally

To run the site locally you only need docker-compose installed. Just clone the repo, navigate to its root directory and run  
`docker-compose up -d`  
After everything started up, you can use the site at `http://localhost`. Go to `http://localhost/graphql` to access the GraphQL playground.

## Data import

By default the server generates a bunch of random asteroid data.
To import data from a a JSON-dump, run the docker-compose command with the environment variable `ASTEROID_DATA_DUMP_URL` containing a direct download link.  
You can omit this on following starts, the server only generates random data when there haven't been any previous imports.

## Setting up the development environment

### Server

The server uses [TypeScript](https://www.typescriptlang.org/) and runs on [Express.js](https://expressjs.com/) and [Apollo Server](https://www.apollographql.com/docs/apollo-server/v2/).

To get started navigate into the `server` directory and run `npm install`.
After this has finished you can just open the folder with your favorite editor and get started.

To update the runnning server, navigate back into the root directory and run  
`docker-compose up -d server --build`.  
The docker image is then rebuilt and the container replaced with the new version.

### Client

The client uses [Rescript](https://rescript-lang.org/) as programming language, [React](https://reactjs.org/) as frontend library and [tailwindcss](https://tailwindcss.com/) as CSS-framework.

To start the client, navigate into the `client` directory and run `npm install`.  
After that you can just run `npm start` and a local development server will start at port 3000.  
Changes in the code will reflect instantly on the site, usually without needing a full page reload.

## GraphQL workflow

### Server

The central element is the schema file located in the `src` directly.
After making changes to it, run `npm run codegen` to generate the matching TypeScript types.  
After that, you can use those types in your resolvers and other components.

### Client

The client uses [rescript-urql](https://github.com/FormidableLabs/rescript-urql) to access the GraphQL-API.
Which in turn utilizes [graphql-ppx](https://graphql-ppx.com/) to typecheck all usages of the API at compile time.  
If you make changes to the GraphQL schema, you need to run `npm run get-graphql-schema` in the client root directory.
This will fetch the schema from the server so graphql-ppx can validate the client code. You need to have the server running for this.

To develop with Rescipt in VSCode, install the [official extension](https://marketplace.visualstudio.com/items?itemName=chenglou92.rescript-vscode) and follow it's instructions.
