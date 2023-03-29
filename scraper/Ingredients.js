
module.exports = class Ingredients {
    /**
     * @constructor
     */
    constructor(browser, page, url, ingredientXpath, attributesXpaths){
        this.browser = browser;
        this.page = page;
        this.ingredientXpath = ingredientXpath;
        this.attributesXpaths = attributesXpaths;
        this.ingredients = [];
        this.url = url;
    }

    async #evaluateIngredientList(){
        return await this.page.evaluate(() => {
            const ingredientLinks = Array.from(
              document.querySelectorAll(ingredientXpath)
            );
          
            return ingredientLinks.map((link) => ({
              href: link.href,
              text: link.querySelector('span')?.innerText,
            }));
        });
    }

    async #getIngredientDetails(ingredientURL) {
        try {
            await this.page.goto(ingredientURL, {waitUntil: "domcontentloaded"})
            return this.page.evaluate(() => {
                return {
                    score: document.querySelector(this.attributesXpaths.score)?.innerText,
                    categories: Array.from(document.querySelectorAll(this.attributesXpaths.categories)).map(cat => cat?.innerText), 
                    desc: document.querySelector(this.attributesXpaths.desc)?.innerText,
                }
            });
        } catch (error) {
            console.error(`Failed to retrieve ingredient details for ${ingredientURL}: ${error}`);
            return null;
        }
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