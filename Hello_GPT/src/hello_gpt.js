// Assuming these imports work as described
import { ask, say } from "./shared/cli.js";
import { gptPrompt } from "./shared/openai.js";

// Main function to run the script
async function main() {
  say("Hello, GPT!");
  
  // Prompt the user for a question
  const question = ask("What do you want to ask? ");
  
  // Send the question to GPT and await the response
  const result = await gptPrompt(question, { temperature: 0.3 });
  
  // Display the result
  say(`\n${result}`);
}

// Run the main function
main();
