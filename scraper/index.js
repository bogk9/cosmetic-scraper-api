const puppeteer = require("puppeteer");
const Ingredients = require('./Ingredients');
const fs = require('fs');
const { PAGE_URL, INGREDIENT_X_PATH, ATTRIBUTES_X_PATHS } = require('./config');
require('dotenv').config();

/**
 * Run Ingredients
 */
(async () => {
    let browser;
    let page;
  
    try {
        browser = await puppeteer.launch({headless: true});
        page = await browser.newPage();
        const ingredients = await new Ingredients(browser, page, PAGE_URL, INGREDIENT_X_PATH, ATTRIBUTES_X_PATHS).main();
        const dataSTR = JSON.stringify(ingredients);
        fs.writeFile('./data/user.json', dataSTR, err => {
            if (err) throw err
            console.log('JSON data is saved.')
        })
    } catch (error) {
        console.log(error);
    }
  
    await browser.close();
  })();