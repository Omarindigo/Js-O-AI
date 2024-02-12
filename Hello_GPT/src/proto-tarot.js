import { ask, say } from "./shared/cli.js";
import { gptPrompt } from "./shared/openai.js";

// Updated function to generate a random tarot card with orientation
function randomCard() {
    const cards = [
        // Major Arcana
        "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
        "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
        "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
        "The Devil", "The Tower", "The Star", "The Moon", "The Sun",
        "Judgement", "The World",
        // Minor Arcana - Cups
        "Ace of Cups", "Two of Cups", "Three of Cups", "Four of Cups", "Five of Cups",
        "Six of Cups", "Seven of Cups", "Eight of Cups", "Nine of Cups", "Ten of Cups",
        "Page of Cups", "Knight of Cups", "Queen of Cups", "King of Cups",
        // Minor Arcana - Pentacles
        "Ace of Pentacles", "Two of Pentacles", "Three of Pentacles", "Four of Pentacles", "Five of Pentacles",
        "Six of Pentacles", "Seven of Pentacles", "Eight of Pentacles", "Nine of Pentacles", "Ten of Pentacles",
        "Page of Pentacles", "Knight of Pentacles", "Queen of Pentacles", "King of Pentacles",
        // Minor Arcana - Swords
        "Ace of Swords", "Two of Swords", "Three of Swords", "Four of Swords", "Five of Swords",
        "Six of Swords", "Seven of Swords", "Eight of Swords", "Nine of Swords", "Ten of Swords",
        "Page of Swords", "Knight of Swords", "Queen of Swords", "King of Swords",
        // Minor Arcana - Wands
        "Ace of Wands", "Two of Wands", "Three of Wands", "Four of Wands", "Five of Wands",
        "Six of Wands", "Seven of Wands", "Eight of Wands", "Nine of Wands", "Ten of Wands",
        "Page of Wands", "Knight of Wands", "Queen of Wands", "King of Wands"
    ];

    const index = Math.floor(Math.random() * cards.length);
    const orientation = Math.random() < 0.5 ? "Upright" : "Reversed";
    return { card: cards[index], orientation };
}

// Adjusted to correctly format cards with their orientations
async function interpretTarot(question, cardObjects) {
    const cardsFormatted = cardObjects.map(c => `${c.card} (${c.orientation})`).join(", ");
    const promptText = `Interpret these tarot cards in the context of the question: "${question}". Cards: ${cardsFormatted}.`;

    try {
        const interpretation = await gptPrompt(promptText, {
            max_tokens: 150,
            temperature: 0.7,
        });
        return interpretation;
    } catch (error) {
        console.error('Error interpreting tarot cards:', error);
        return "An error occurred while trying to interpret the tarot cards.";
    }
}

// Updated to use getRandomCardWithOrientation
async function runTarotReadingApp() {
    say("Welcome to the Tarot Reading CLI App.");
    const question = await ask("What is your question or situation for the tarot reading? ");
    
    if (question) {
        const cards = [randomCard(), randomCard(), randomCard()];
        const cardsTextForDisplay = cards.map(c => `${c.card} (${c.orientation})`).join(", ");
        say(`Your cards are: ${cardsTextForDisplay}.`);
        
        const interpretation = await interpretTarot(question, cards);
        say(`Interpretation: ${interpretation}`);
    } else {
        say("No question was entered. Please try again.");
    }
}

runTarotReadingApp();