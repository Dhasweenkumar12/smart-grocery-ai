const express = require('express');
const router = express.Router();
const {
  chatWithGemini,
  getRecipeSuggestions,
  getExecutiveInsights,
  getDemandForecast,
  getAllProductsForecast,
  getCartRecommendations,
  getSmartOffers
} = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

// Gemini Generative AI Assistant & Culinary Tools
router.post('/chat', chatWithGemini);
router.post('/recipes', getRecipeSuggestions);

// Public customer AI recommendations and smart discounts
router.post('/cart-recommendations', getCartRecommendations);
router.get('/smart-offers', getSmartOffers);

// Admin/Staff AI Forecasting & Gemini Executive Summary
router.get('/insights', protect, authorize('admin', 'staff'), getExecutiveInsights);
router.get('/forecast/all', protect, authorize('admin', 'staff'), getAllProductsForecast);
router.get('/forecast/:productId', protect, authorize('admin', 'staff'), getDemandForecast);

module.exports = router;
