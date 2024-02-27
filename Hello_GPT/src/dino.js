import { say } from "./shared/cli.js";
import { gptPrompt } from "./shared/openai.js";

// Simulated ASCII art for Dino in two different frames for each state
const dinoStates = {
  happy: [
    `:-)`,
    `:-D`,
  ],
  hungry: [
    `:-(`,
    `:'-(`,
  ],
  playful: [
    `<(^_^)>`,
    `<('o')>`,
  ],
  tired: [
    `(-.-)Zzz`,
    `(u.u)Zzz`,
  ],
  sad: [
    `:-(`,
    `:-|`,
  ],
  grumpy: [
    `>:-(`,
    `>:-|`,
  ],
  naughty: [
    `;-)`,
    `>:-)`,
  ],
  aloof: [
    `:-|`,
    `:-\\`,
  ],
};

let currentState = "happy"; // Default state
let frame = 0;

// Dino's status meters
let happiness = 100; // Max happiness
let hunger = 0; // No hunger

// Function to draw status bars
function drawStatusBars() {
  const happinessBar = "Happiness: [" + "♥".repeat(happiness / 10) +
    " ".repeat(10 - happiness / 10) + "]";
  const hungerBar = "Hunger: [" + "♦".repeat(hunger / 10) +
    " ".repeat(10 - hunger / 10) + "]";

  say(happinessBar);
  say(hungerBar);
}

// Update Dino's state based on happiness and hunger levels
function updateDinoState() {
  if (happiness > 80 && hunger < 20) {
    currentState = "happy";
  } else if (hunger > 50) {
    currentState = "hungry";
  } else if (happiness < 20) {
    currentState = "sad";
  } else if (happiness > 60 && hunger < 20) {
    currentState = "playful";
  } else if (happiness < 50 && hunger > 70) {
    currentState = "tired";
  } else if (happiness < 30) {
    currentState = "grumpy";
  } else if (happiness > 50 && hunger > 50) {
    currentState = "naughty";
  } else {
    currentState = "aloof";
  }
}

// Generate a narrative for Dino based on the current state
async function generateNarrative(state) {
  const basePrompt =
    `Dino the Lizard is no ordinary reptile; he lives in your computer, in your Command line terminal. Today, Dino finds himself in a ${state} mood. Craft a narrative that unfolds a single day in the life of Dino the Lizard. Focus on depicting his interactions, the subtle ways he expresses his mood by users interactions and inputs, without directly stating his feelings.`;

  const narrative = await gptPrompt(basePrompt);
  say(narrative);
}

// Interact with Dino
async function interactWithDino() {
  say("\nThis is Dino The Lizard, the cli pet!")
  say("\nWhat would you like to do with Dino?");
  say("1: Feed Dino");
  say("2: Play with Dino");
  say("3: Let Dino rest");
  say("Enter the number of your choice:");

  const input = await prompt("> "); // Capture user input from terminal

  switch (input) {
    case "1":
      // Feeding reduces hunger and increases happiness
      hunger = Math.max(0, hunger - 30);
      happiness = Math.min(100, happiness + 20);
      say("You feed Dino. He looks satisfied!");
      break;
    case "2":
      // Playing increases happiness but also increases hunger
      happiness = Math.min(100, happiness + 30);
      hunger = Math.min(100, hunger + 20);
      say("You play with Dino. He's having a lot of fun!");
      break;
    case "3":
      // Resting decreases hunger slowly and stabilizes happiness
      hunger = Math.max(0, hunger - 10);
      say("Dino takes a rest. He looks more relaxed.");
      break;
    default:
      say("Dino doesn't understand what you want. Try again.");
      break;
  }

  updateDinoState(); // Update Dino's state after interaction
  await generateNarrative(currentState); // Generate a narrative about Dino's day based on the current state
}

// Main loop to simulate Dino's life
async function main() {
  while (true) {
    await interactWithDino(); // Allow user to interact with Dino

    say(dinoStates[currentState][frame]);
    drawStatusBars();

    frame = (frame + 1) % 2; // Toggle between frame 0 and 1 for animation

    // Wait for a bit before next interaction
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

main();
