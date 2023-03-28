const express = require('express');
const router = express.Router({ mergeParams: true });
const ingredientsController = require('../controllers/ingredients');

router
  .route('/')
  .get([ingredientsController.getIngredients])


module.exports = router;