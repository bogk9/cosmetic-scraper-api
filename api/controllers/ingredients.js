const { fetchIngredientByName } = require('../engine/engine');

// Create a new NodeCache instance

exports.getIngredients = async (req, res) => {
    const query = req.query;
    let result = {error: "No enough parameters provided"};
    if(query.name)
      result = await fetchIngredientByName(query.name, query.page, query.limit);

    return res.json(result);
  };
  