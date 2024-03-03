// Import dependencies from Deno's standard library
import { readTextFile, writeTextFile } from 'https://deno.land/std/fs/mod.ts';
// Import shared modules from your project
import { gptPrompt } from "./shared/openai.js";
import { ask, say } from "./shared/cli.js";

// Utility function to read game data from a JSON file
async function loadGameData(filePath) {
    const data = await readTextFile(filePath);
    return JSON.parse(data);
}

// Utility function to save player state to a JSON file
async function savePlayerState(filePath, playerState) {
    const data = JSON.stringify(playerState, null, 2);
    await writeTextFile(filePath, data);
}

// Main game function
async function main() {
    // Define file paths for game data and player state
    const gameDataPath = './gameData.json';
    const playerStatePath = './playerState.json';

    // Load game data and initialize player from template or saved state
    const { storyCircle, playerTemplate } = await loadGameData(gameDataPath);
    let player;
    try {
        // Attempt to load existing player state
        player = await loadGameData(playerStatePath);
        say(`Welcome back, ${player.name}!`);
    } catch {
        // Fallback to creating a new player from template
        player = { ...playerTemplate, name: await ask("What is your name?"), class: await ask("What is your class?") };
        say("Hello, new Player!");
    }

    let context = [];
    let playing = true;
    const location = "woods";

    say(`Ready to continue your adventure in the ${location}?`);
    say(`Stage 1: There once was a ${player.class} named ${player.name}...`);

    while (playing) {
        const command = await ask("What do you want to do?");
        if (command === "quit") {
            playing = false;
            break;
        }
        const prompt = generatePrompt(player, location, context, command, storyCircle[player.stage]);
        const response = await gptPrompt(prompt, {
            max_tokens: 128,
            temperature: 0.5,
        });
        context.push(response);
        say(`\nStage ${player.stage + 1}: ${response}\n`);

        // Update player's health, energy, and stage based on the response
        updatePlayerStateFromResponse(player, response, storyCircle);

        say(`Health: ${generateStatusBar(player.health, 100, 20)}`);
        say(`Energy: ${generateStatusBar(player.energy, 100, 20)}`);

        // Save player state after each command
        await savePlayerState(playerStatePath, player);
    }

    say("Game over. Thanks for playing!");
}

// Function to generate the GPT-3 prompt
function generatePrompt(player, location, context, command, stage) {
    return `
        This is a text adventure game.
        The player is a ${player.class} named ${player.name}.
        The player's health is ${player.health} and energy is ${player.energy}.
        The player is currently in "${location}".
        
        The current stage of the story is: ${stage}
        The player command is '${command}'.
        Recently: ${context.slice(-3).join(" ")}
        Based on the current stage of the story, generate the next part of the narrative. 
        Respond in second person.
        Be brief, and avoid narrating actions not taken by the player via commands.
        When describing locations, mention places the player might go.
        Introduce challenges that might decrease the player's health or energy.
        Also, provide opportunities for the player to regain health and energy.
    `;
}

// Function to update player's health, energy, and stage based on GPT-3's response
function updatePlayerStateFromResponse(player, response, storyCircle) {
    if (response.includes('hurt')) {
        player.health = Math.max(0, player.health - 10);
    }
    if (response.includes('rest')) {
        player.energy = Math.min(100, player.energy + 10);
    }
    if (response.includes('heal')) {
        player.health = Math.min(100, player.health + 10);
    }
    if (response.includes('tired')) {
        player.energy = Math.max(0, player.energy - 10);
    }
    if (response.includes('completed')) {
        player.stage = (player.stage + 1) % storyCircle.length;
    }
}

// Function to generate a status bar for health and energy
function generateStatusBar(value, maxValue, length) {
    const percentage = value / maxValue;
    const filledLength = Math.round(percentage * length);
    const emptyLength = length - filledLength;
    const filledPart = '█'.repeat(filledLength);
    const emptyPart = '-'.repeat(emptyLength);
    return `[${filledPart}${emptyPart}] ${value}/${maxValue}`;
}

// Execute the main function
main().catch(console.error);
