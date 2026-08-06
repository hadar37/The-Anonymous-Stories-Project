

import axios from 'axios';

// כתובת שרת הקלפים מתוך משתני הסביבה (או ברירת מחדל לפורט 5001)
const CARDS_URL = import.meta.env.VITE_CARDS_API_URL || 'http://localhost:5001/api/cards';

const cardsApi = axios.create({
  baseURL: CARDS_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * משיכת קלף השראה אקראי משרת הקלפים
 * GET /api/cards/random
 */
export const getRandomCard = async () => {
  try {
    const response = await cardsApi.get('/random');
    return response.data;
  } catch (error) {
    console.error('שגיאה בשליפת קלף אקראי:', error);
    throw error;
  }
};

/**
 * משיכת כל קלפי ההשראה משרת הקלפים
 * GET /api/cards
 */
export const getAllCards = async () => {
  try {
    const response = await cardsApi.get('/');
    return response.data;
  } catch (error) {
    console.error('שגיאה בשליפת כל הקלפים:', error);
    throw error;
  }
};

export default cardsApi;