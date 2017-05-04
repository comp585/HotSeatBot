const createImageUrl = require('../utils').createImageUrl;

const topics = [
  {
    category: 'Adventure',
    url: createImageUrl('airplane.png'),
  },
  {
    category: 'Family & Upbringing',
    url: createImageUrl('family.png'),
  },
  {
    category: 'Food',
    url: createImageUrl('food.png'),
  },
  {
    category: 'Hypotheticals',
    url: createImageUrl('thought_bubble.png'),
  },
  {
    category: 'Personals',
    url: createImageUrl('personal.png'),
  },
  {
    category: 'Sex & Sexuality',
    url: createImageUrl('devil.png'),
  },
];

const questions = {
  Adventure: [
    'If you could visit any time period in all of history, what would it be?',
    'What’s your favorite travel destination?',
    'You are given three wishes by a genie, what do you wish for (no infinite wishes or loopholes)?',
    'Where have you always wanted to travel?',
    'What large festivals or gatherings have you attended?',
    'Shark diving, bungee jumping, or sky diving?',
    'Tell me about the best vacation you’ve ever taken.',
    'What’s the most memorable thing you’ve ever lost on a trip to another country?',
    'If you could travel the world, which are the five places you’d never miss?',
    'What role do you play in planning group trips?',
    'In a new city, what attraction do you have to visit first?',
  ],
  'Family & Upbringing': [
    'Who are you closest to in your family?',
    'Who was your favorite teacher?',
    'If you could change anything about the way you were raised, what would it be?',
    'What was cool about where you grew up?',
    'What’s your most vivid childhood memory?',
    'What’s an accomplishment you are proud of but can’t tell your parents about?',
    'What, if anything, do you miss about being a kid?',
  ],
  Food: [
    'What do you like to eat to cheer yourself up?',
    'What is your favorite food for a midnight snack?',
    'What are some unusual food combinations that you think are tasty?',
    'What common food that most people enjoy makes you gag?',
    'What’s the worst thing you would do for some free guacamole',
    'If you had $200 which you could only spend on food, what would you get?',
    'If you had to eat one thing for the rest of your life, what would it be?',
    'What are your biggest pet peeves when it comes to menus?',
    'Is there anything you don’t eat?',
  ],
  Hypotheticals: [
    'Your house, containing everything you own, catches fire. After saving your loved ones and pets, you have time to safely make a final dash to save any one item. What would it be? Why?',
    'Given the choice of anyone in the world, whom would you want as a dinner guest?',
    'If you were able to live to the age of 90 and retain either the mind or body of a 30-year-old for the last 60 years of your life, which would you want?',
    'If Heaven exists, what would you like to hear God say when you arrive at the Pearly Gates?',
    'If you knew that in one year you would die suddenly, would you change anything about the way you are now living? Why?',
    'If you could trade lives with one person for an entire day who would it be and why?',
    'If you had 24 hours to do whatever you liked in your city what would you spend it doing?',
    'If you didn’t live where you currently live and you could choose anywhere in the world where would it be and why?',
    'If You Could Have Any Superpower What Would It Be?',
    'If you could jump into a pool of anything, what would it be?',
  ],
  Personals: [
    'What gets you out of bed in the morning?',
    'What is your spirit animal?',
    'What do you take pride in?',
    'What’s the topic you can go on about for hours without getting tired?',
    'What’s the story behind any nickname you’ve had?',
    'What has been your biggest "I have to get the fuck out of here as soon as possible" life moment?',
    'Are you a morning person or a night person?',
    'What is your, "I know it sounds weird, but just try it" thing?',
    'What do you like to do when you’re not working?',
    'What are your most useful life hacks?',
    'What was the best part of your week?',
    'What’s the worst part about dating?',
    'What’s your worst pet peeve?',
    'What’s something you’re bad at?',
    'What is your favorite curse word?',
  ],
  'Sex & Sexuality': [
    'Where’s the most unusual place you’ve had sex?',
    'If you could have a threesome with any two people in the world who would you choose?',
    'What’s the most pathetic thing you’ve done because you were horny?',
    'Would you have sex with a clone of yourself?',
    'What do you think about public displays of affection?',
    'What turns you on creatively, spiritually or emotionally?',
    'What turns you off?',
  ],
};

module.exports = {
  getQuestions: topic => questions[topic],
  getTopics: () => topics,
};
