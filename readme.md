## API Description

This project consists of two parts: scraping engine and API. The scraper, built in Node.js, retrieves information about ingredients from a specific website and saves it to a JSON file. Then, the user can manually run a Python script that sends this information to a PostgreSQL database. The API part is written in Node.js and Express.js, retrieves this information from the PostgreSQL database and exposes it as an API.



### Running the scraping engine

1. Install Node.js on your machine.
2. Open a terminal and navigate to the `scraper` directory.
3. Run `npm install` to install the necessary dependencies.
4. Open `scraper.js` and adjust the website url or other parameters.
5. Open `ingredients.js` in a text editor and update the CSS selectors if necessary. By default, the selectors are provided to match the structure of the `skincoda.pl/baza-skladnikow` website.
6. Run `node scraper.js` to start the scraper. The scraper will retrieve information about ingredients from the website and save it to the `data/ingredients.json` file.



### Export scraped data to PostgreSQL

1. Install Python on your machine.
2. Open a terminal and navigate to the `scraper` directory.
3. Run `pip install psycopg2-binary` to install the PostgreSQL driver for Python.
4. Open `postgres_data_importer/config.py` file in a text editor and adjust the database credentials.
5. Run `python postgres_data_importer.py` to export the ingredients from the "ingredients.json" file to the PostgreSQL database.

### Running the API

1. Open a terminal and navigate to the `api` directory.
2. Run `npm install` to install the necessary dependencies.
3. Run `node server.js` to start the API server. The server will listen on port `3000` by default.
4. Use a REST client (such as Postman) to send GET requests to the API endpoints to retrieve ingredient information from the PostgreSQL database. The endpoints are `/ingredients` to get all ingredients and /`ingredients/:id` to get a specific ingredient by ID.

### Preview

Preview the API using the live version deployed on https://cos-api.com. The API exposes the same data that is generated by the scraper and stored in the PostgreSQL database.