const delayMap = require("../utils/delayMap");
const delay = require('../utils/delay')
const fs = require('fs')


module.exports = class Ingredients {
    /**
     * @constructor
     */
    constructor(browser, page, url, ingredientXpath, attributesXpaths){
        this.browser = browser;
        this.page = page;
        this.ingredients = [];
        this.url = url;
    }

    async #evaluateIngredientList(){
        return await this.page.evaluate(() => {
            const ingredientLinks = Array.from(
              document.querySelectorAll('li.c-ingredients-pos__link-itm a')
            );
          
            return ingredientLinks.map((link) => ({
              href: link.href,
              text: link.querySelector('span')?.innerText,
            }));
        });
    }

    async #getIngredientDetails(ingredientURL){
        await this.page.goto(ingredientURL, {waitUntil: "domcontentloaded"})
        return this.page.evaluate(() => {
            return {
                score: document.querySelector('div.c-quality-ico__icon')?.innerText,
                categories: Array.from(document.querySelectorAll('a.c-category-btn')).map(cat => cat?.innerText), 
                desc: document.querySelector("#__layout > div > div > div > div:nth-child(2) > div > div:nth-child(5) > div > div > p")?.innerText,
            }
        });
    }

    async #evaluateIngredientDetails(){
        for (const entry of this.ingredientEntries) {
            const details = await this.#getIngredientDetails(entry.href);
            entry.score = details.score;
            entry.categories = details.categories;
            entry.desc = details.desc;
        }
    }

    /**
     * @method main
     */
    async main(){
        await this.page.goto(this.url, {waitUntil: "domcontentloaded"});
        await this.page.waitForTimeout(3000);

        // Gets list of products and puts it to this.ingredientEntries
        this.ingredientEntries = await this.#evaluateIngredientList();

        // For each ingredient entry, gets info (EWG, categories)
        await this.#evaluateIngredientDetails();

        // Returns
        return this.ingredientEntries;
    }
}