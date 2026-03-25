export interface Quote {
  text: string;
  source: string;
  length: number;
}

const rawQuotes: { text: string; source: string }[] = [
  { text: "The only way to do great work is to love what you do.", source: "Steve Jobs" },
  { text: "In the middle of difficulty lies opportunity.", source: "Albert Einstein" },
  { text: "Life is what happens when you are busy making other plans.", source: "John Lennon" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", source: "Eleanor Roosevelt" },
  { text: "It is during our darkest moments that we must focus to see the light.", source: "Aristotle" },
  { text: "The only impossible journey is the one you never begin.", source: "Tony Robbins" },
  { text: "Success is not final, failure is not fatal. It is the courage to continue that counts.", source: "Winston Churchill" },
  { text: "Believe you can and you are halfway there.", source: "Theodore Roosevelt" },
  { text: "Do what you can, with what you have, where you are.", source: "Theodore Roosevelt" },
  { text: "It does not matter how slowly you go as long as you do not stop.", source: "Confucius" },
  { text: "Everything you have ever wanted is on the other side of fear.", source: "George Addair" },
  { text: "The best time to plant a tree was twenty years ago. The second best time is now.", source: "Chinese Proverb" },
  { text: "Your time is limited so do not waste it living someone else's life.", source: "Steve Jobs" },
  { text: "If you look at what you have in life you will always have more. If you look at what you do not have in life you will never have enough.", source: "Oprah Winfrey" },
  { text: "You miss one hundred percent of the shots you do not take.", source: "Wayne Gretzky" },
  { text: "The mind is everything. What you think you become.", source: "Buddha" },
  { text: "An unexamined life is not worth living.", source: "Socrates" },
  { text: "Happiness is not something ready made. It comes from your own actions.", source: "Dalai Lama" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", source: "Franklin D. Roosevelt" },
  { text: "We are what we repeatedly do. Excellence then is not an act but a habit.", source: "Aristotle" },
  { text: "Imagination is more important than knowledge. Knowledge is limited. Imagination encircles the world.", source: "Albert Einstein" },
  { text: "I have not failed. I have just found ten thousand ways that will not work.", source: "Thomas Edison" },
  { text: "A person who never made a mistake never tried anything new.", source: "Albert Einstein" },
  { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", source: "Nelson Mandela" },
  { text: "In three words I can sum up everything I have learned about life. It goes on.", source: "Robert Frost" },
  { text: "If you want to live a happy life, tie it to a goal, not to people or things.", source: "Albert Einstein" },
  { text: "Never let the fear of striking out keep you from playing the game.", source: "Babe Ruth" },
  { text: "Money and success do not change people. They merely amplify what is already there.", source: "Will Smith" },
  { text: "Not how long, but how well you have lived is the main thing.", source: "Seneca" },
  { text: "If life were predictable it would cease to be life, and be without flavor.", source: "Eleanor Roosevelt" },
  { text: "The whole secret of a successful life is to find out what is one's destiny to do, and then do it.", source: "Henry Ford" },
  { text: "In order to write about life first you must live it.", source: "Ernest Hemingway" },
  { text: "The big lesson in life is never be scared of anyone or anything.", source: "Frank Sinatra" },
  { text: "Curiosity about life in all of its aspects, I think, is still the secret of great creative people.", source: "Leo Burnett" },
  { text: "Life is not a problem to be solved, but a reality to be experienced.", source: "Soren Kierkegaard" },
  { text: "The unexamined life is not worth living.", source: "Socrates" },
  { text: "Turn your wounds into wisdom.", source: "Oprah Winfrey" },
  { text: "The way to get started is to quit talking and begin doing.", source: "Walt Disney" },
  { text: "Tell me and I forget. Teach me and I remember. Involve me and I learn.", source: "Benjamin Franklin" },
  { text: "The purpose of our lives is to be happy.", source: "Dalai Lama" },
  { text: "Get busy living or get busy dying.", source: "Stephen King" },
  { text: "You only live once, but if you do it right, once is enough.", source: "Mae West" },
];

export const quotes: Quote[] = rawQuotes.map((q) => ({
  ...q,
  length: q.text.split(" ").length,
}));

const SHORT_QUOTE_MAX = 10;
const MEDIUM_QUOTE_MAX = 20;

export function getQuotesByLength(category: "all" | "short" | "medium" | "long"): Quote[] {
  switch (category) {
    case "short":
      return quotes.filter((q) => q.length <= SHORT_QUOTE_MAX);
    case "medium":
      return quotes.filter((q) => q.length > SHORT_QUOTE_MAX && q.length <= MEDIUM_QUOTE_MAX);
    case "long":
      return quotes.filter((q) => q.length > MEDIUM_QUOTE_MAX);
    case "all":
    default:
      return quotes;
  }
}
