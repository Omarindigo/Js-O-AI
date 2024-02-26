import { gptPrompt } from "./shared/openai.js";
import { ask, say } from "./shared/cli.js";

main();

async function main() {
  say("Welcome to the Adventure!");

  // Initialize the story circle steps and current step
  const storyCircleSteps = [
    "You are in your comfort zone",
    "You want something",
    "You enter an unfamiliar situation",
    "You adapt to it",
    "You get what you wanted",
    "You pay the price",
    "You return to where you started",
    "You have changed",
  ];
  let currentStep = 0;

  const context = [];
  const player = {
    name: await ask("What is your name?"),
    class: await ask("What is your class?"),
    inventory: [],
    location: "beginning",
  };

  say(`Hello, ${player.name}, the ${player.class}.`);

  let playing = true;
  while (playing) {
    const command = await ask("What do you want to do?");
    if (command.toLowerCase() === "quit") {
      playing = false;
      say("Goodbye!");
      break;
    }

    // Update the story context and player's state based on the command
    // This is where you can integrate logic to move between steps in the Story Circle
    // For simplicity, this example progresses the story with each command
    currentStep = (currentStep + 1) % storyCircleSteps.length; // Loop back to start after the last step

    const prompt = `
      This is a text adventure game following the Dan Harmon Story Circle.
      The player is a ${player.class} named ${player.name}.

      Story Step: ${storyCircleSteps[currentStep]}
      Location: ${player.location}
      Inventory: ${player.inventory.join(", ") || "empty"}

      Recently: ${context.slice(-3).join(" ")}

      Respond in second person.
      Be brief, and avoid narrating actions not taken by the player via commands.
      When describing locations, mention places the player might go.

      The player command is '${command}'.
    `;

    const response = await gptPrompt(prompt, {
      max_tokens: 128,
      temperature: 0.5,
    });

    // Here, you can analyze the response to update the player's location, inventory, etc., as needed
    context.push(response); // Add the response to the context for continuity
    say(`\n${response}\n`);
  }
}
