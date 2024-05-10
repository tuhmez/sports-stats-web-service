# Sports Stats API

README Updated: Aug. 9, 2022

## Table of Contents

* [About](#about)
* [Use](#use)
  * [Routes to know](#routes-to-know)
  * [Local use](#local-use)
* [Contribution](#contribution)

## About

This project serves as an easier-to-use API to retrieve various sports stats and live data located in the United States.

The v1 will only support MLB with v2 open to support any additional sports such as the NBA, NFL, and NHL.

## Use

Currently (May 8, 2024) the API is unpublished to the public.

### Routes to know

When running the server, a Swagger dashboard will also run alongside the base server. This dashboard contains interfaces to explore the API and its inputs and outputs.

* Base route - `{SERVER_LOCATION}`:5000/

* Swagger Dashboard - `{SERVER_LOCATION}`:5000/docs

* Available MLB routes - `{SERVER_LOCATION}`:5000/mlb

### Local use

1. Clone the project

    ```bash
    git clone git@github.com:tuhmez/sports-stats-web-service.git
    ```

2. Install project dependencies

    ```bash
    npm install
    ```

3. Build and run project (the command will clean previous builds, re-build, then start)

    ```bash
    npm run start
    ```

4. The project should serve at your localhost at port `5000`

## Contribution

Issues should be created in order to track problems and requested features.
