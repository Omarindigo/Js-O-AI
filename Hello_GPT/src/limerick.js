import { ask, say } from "./shared/cli.js";
import { gptPrompt } from "./shared/openai.js";

// Entry point of the application
async function main() {
  // Greet the user
  say("Hello, GPT!");

  // Ask for the user's name
  const element = await ask("What is your favoite element?");
  // Ask for the user's hometown
  const season = await ask("What is you favoite season?");

  // Prepare a prompt for the GPT-4 Turbo API using the provided information
  const prompt = `With ${element} and ${season}. Create a haikus.`;

  // Send the prompt to the GPT-4 Turbo API with a specified temperature
  const haikus = await gptPrompt(prompt, { temperature: 0.9 });

  // Display the generated limerick to the user
  say(`"""\n${haikus}\n"""`);
}

// Execute the main function to start the application
main();
