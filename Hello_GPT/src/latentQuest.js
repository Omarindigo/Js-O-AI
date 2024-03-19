// Import shared modules from your project
import { gptPrompt } from "./shared/openai.js";
import { ask, say as originalSay } from "./shared/cli.js";

// Enhanced say function for detailed feedback
function say(message, player = null) {
  originalSay(message);
  if (player) {
    if (player.health <= 20) {
      originalSay("You're severely wounded and barely able to stand.");
    } else if (player.energy <= 20) {
      originalSay("Exhaustion grips you, each step feels heavier.");
    }
  }
}

// Utility function to read game data from a JSON file
async function loadGameData(filePath) {
  console.log('Loading game data from', filePath);
  const data = await Deno.readTextFile(filePath);
  return JSON.parse(data);
}

// Utility function to save player state to a JSON file
async function savePlayerState(filePath, playerState) {
  console.log('Saving player state to', filePath);
  const data = JSON.stringify(playerState, null, 2);
  await Deno.writeTextFile(filePath, data);
}

// Centralized JSON Data Loader
async function loadAllGameData() {
  console.log('Loading all game data...');
  const characterData = await loadGameData('src/character.json');
  const classAbilitiesData = await loadGameData('src/classAbilities.json');
  const characterClassesData = await loadGameData('src/characterClasses.json');
  const levelData = await loadGameData('src/levels.json');

  return {
    character: characterData,
    classAbilities: classAbilitiesData,
    characterClasses: characterClassesData,
    levels: levelData
  };
}

// Level class with static createFromJson method
class Level {
  constructor(id, name, objectives, challenges, enemies, rewards) {
    this.id = id;
    this.name = name;
    this.objectives = objectives;
    this.challenges = challenges;
    this.enemies = enemies;
    this.rewards = rewards;
    this.generatedContent = ""; // Add this line to initialize generatedContent
  }

  static async createFromJson(levelData, gameData, player) {
    const generatedLevel = await generateLevel(player, gameData, levelData);
    if (!generatedLevel) {
      console.error('Failed to generate level content. Using default level data.');
      return new Level(
        levelData.id,
        levelData.name,
        levelData.objectives,
        levelData.challenges,
        levelData.enemies,
        levelData.rewards
      );
    }
    return new Level(
      levelData.id,
      levelData.name,
      levelData.objectives,
      levelData.challenges,
      levelData.enemies,
      levelData.rewards
    );
  }

  // Initialize level resources or setup
  init() {
    console.log(`Initializing Level ${this.id}: ${this.name}`);
    // Add initialization logic here (e.g., spawning enemies)
  }

  // Cleanup level resources or state
  cleanup() {
    console.log(`Cleaning up Level ${this.id}`);
    // Add cleanup logic here (e.g., removing enemies, resetting state)
  }

  // Example method for level-specific behavior
  startLevel() {
    console.log(`Starting Level ${this.id}: ${this.name}`);
    // Add game start logic here
  }
}

// Function to generate the GPT-3 prompt for a level
function generateLevelPrompt(player, gameData, currentLevel) {
  console.log('Generating prompt for GPT-3');
  const classDescription = player.classDescription;
  const classAbilitiesStr = JSON.stringify(gameData.classAbilities[player.class]);
  const characterClassesStr = JSON.stringify(gameData.characterClasses);

  return `
    Using the provided character, classAbilities, characterClasses, and currentLevel data, generate a detailed game level for the text adventure game set in a far-future sci-fi post-apocalyptic cyberpunk Earth.

    Format the game level using the following template:

    [Game Level]
    Health: [Player's current health]/[Player's maximum health]
    Energy: [Player's current energy]/[Player's maximum energy]

    Level [Current Level Number]: [Current Level Name]

    [Level's narrative with info from all JSON + player has to perform a task or challenge in the story to progress to the next level.]
    (Prompt the user with 2 choices based on the narrative and how their abilities might help or complete the task or challenge. Number them (1) and (2).)

    character:
    ${JSON.stringify(player)}

    classAbilities:
    ${classAbilitiesStr}

    characterClasses:
    ${characterClassesStr}

    currentLevel:
    ${JSON.stringify(currentLevel)}

    Instructions:
    - Generate a detailed and immersive game level based on the provided template.
    - Incorporate elements from the character, classAbilities, characterClasses, and currentLevel to maintain consistency and coherence.
    - Use the level information (objectives, challenges, enemies, rewards) to formulate the level's narrative and challenges.
    - Include the level number (id) and name in the generated level.
    - Display the player's current health and maximum health in the "Health" status bar.
    - Display the player's current energy and maximum energy in the "Energy" status bar.
    - Prompt the user with choices related to the challenges or task they can take or have to do to advance to the next level. keep ask short and concise.
    - Do not generate any JSON structure or code. Provide only the formatted game level as plain text.
    - Use vivid and descriptive language to create an engaging and atmospheric level.

    Respond with ONLY the generated game level, without any additional text, explanations, or formatting.
  `;
}

// Function to generate a level using the GPT API
async function generateLevel(player, gameData, currentLevel) {
  const prompt = generateLevelPrompt(player, gameData, currentLevel);

  let generatedLevel;
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      console.log('Before API call:', generatedLevel); 
      generatedLevel = await gptPrompt(prompt, {
        max_tokens: 800,
        temperature: 0.8,
      });
      console.log('After API call:', generatedLevel)
      // Extract the generated level content from the API response
      const levelContent = generatedLevel.trim();

      // Extract the status bars from the generated level content
      const statusBarsMatch = levelContent.match(/Health: (\d+)\/(\d+)\nEnergy: (\d+)\/(\d+)/);
      if (statusBarsMatch) {
        const [_, health, maxHealth, energy, maxEnergy] = statusBarsMatch;
        player.health = parseInt(health);
        player.maxHealth = parseInt(maxHealth);
        player.energy = parseInt(energy);
        player.maxEnergy = parseInt(maxEnergy);
      }

      // Update the current level with the generated content (excluding the status bars)
      currentLevel.generatedContent = levelContent.replace(/Health: \d+\/\d+\nEnergy: \d+\/\d+\n/, '');

      return currentLevel;
    } catch (error) {
      console.error('Error generating level content:', error);
      console.error('Generated level:', generatedLevel);
      retryCount++;
    }
  }

  console.error('Failed to generate level content after', maxRetries, 'attempts.');
  return null;
}

// Function to track the player's progress through the levels
function trackLevelProgress(player, gameData) {
  if (player.level < gameData.levels.length) {
    player.level++;
  } else {
    // Reset level to 1 if player completes all levels
    player.level = 1;
  }
}

// Function to use an item, skill, or class ability
function useAbility(player, abilityName, gameData) {
  console.log(`Using ability: ${abilityName}`);
  const abilityType = abilityName.includes('Special') ? 'specialAbilities' : 'regularAbilities';
  const ability = player.abilities[abilityType].find(ability => ability.name === abilityName);
  
  if (ability) {
    if (player.health >= ability.cost.health && player.energy >= ability.cost.energy) {
      player.health -= ability.cost.health;
      player.energy -= ability.cost.energy;
      say(`You use the ability "${ability.name}". ${ability.description}`, player);
    } else {
      say("You don't have enough health or energy to use this ability.", player);
    }
  } else {
    say("You don't have that ability.", player);
  }
}

// Function to process player choices and update the game state
async function processPlayerChoice(player, choice, currentLevel, gameData) {
  // Process the player's choice based on the current level's challenges or actions
  // Update the game state, player's health, energy, etc., based on the choice
  // Generate the next level if the player completes the current level

  let challengeMessage = "";

  if (choice === "1") {
    say("You chose option 1.", player);
    // Update game state, player's health, energy, etc.
    challengeMessage = "You successfully completed the challenge using your chosen strategy!";
  } else if (choice === "2") {
    say("You chose option 2.", player);
    // Update game state, player's health, energy, etc.
    challengeMessage = "Your alternative approach proved effective in overcoming the challenge!";
  } else {
    say("Invalid choice. Please try again.", player);
    return true; // Continue the game
  }

  // Generate the next level after processing the player's choice
  const nextLevelData = gameData.levels[player.level];
  const nextLevel = await Level.createFromJson(nextLevelData, gameData, player);
  if (nextLevel) {
    say(`${challengeMessage} You advance to the next level!`, player);
    trackLevelProgress(player, gameData);
  } else {
    say("You fail to complete the challenge. Please try again.", player);
  }

  return true; // Continue the game
}

async function main() {
  console.log('Starting game');
  const gameData = await loadAllGameData();

  // Ask for player's name
  const playerName = await ask("What is your name?");
  gameData.character.name = playerName;

  // Ask for player's class and list available classes
  const playerClassChoice = await ask(`What is your class? Available classes: ${Object.keys(gameData.characterClasses).join(", ")}`);
  if (!gameData.characterClasses[playerClassChoice]) {
    say(`Invalid class selected. Available classes: ${Object.keys(gameData.characterClasses).join(", ")}`);
    return; // Exit the game if an invalid class is selected
  }

  // Initialize player with selected class details
  gameData.character.class = playerClassChoice;
  gameData.character.classDescription = gameData.characterClasses[playerClassChoice].description;
  gameData.character.abilities = gameData.classAbilities[playerClassChoice];

  // Welcome the player and describe their class
  say(`Welcome, ${gameData.character.name} the ${playerClassChoice}!`);
  say(gameData.character.classDescription, gameData.character);

  // Announce the player's abilities with descriptions
  say("Your abilities are:", gameData.character);
  say("Regular Abilities:", gameData.character);
  gameData.character.abilities.regularAbilities.forEach(ability => {
    say(`♦ ${ability.name}: ${ability.description}`, gameData.character);
  });
  say("Special Abilities:", gameData.character);
  gameData.character.abilities.specialAbilities.forEach(ability => {
    say(`♦ ${ability.name}: ${ability.description}`, gameData.character);
  });

  // Confirm player is ready to begin the adventure
  let readyToStart = await ask("Are you ready to begin your adventure? (yes/no)");
  if (readyToStart.trim().toLowerCase() !== 'yes') {
    say("Okay, start whenever you're ready.");
    return;
  }

  let playing = true;
  gameData.character.level = 1; // Start at level 1

  // Main game loop
  while (playing) {
    // Get the current level based on the player's progress
    const currentLevelData = gameData.levels[gameData.character.level - 1];
    const currentLevel = await Level.createFromJson(currentLevelData, gameData, gameData.character);
    console.log('Generated content:', currentLevel.generatedContent);
    // Display the current level's generated content
    say(currentLevel.generatedContent, gameData.character);

    // Prompt the player for their choice
    const choice = await ask("Enter your choice:");

    // Process the player's choice and update the game state accordingly
    playing = await processPlayerChoice(gameData.character, choice, currentLevel, gameData);

    // Save the player's current state to a JSON file
    await savePlayerState('src/character.json', gameData.character);

    // Check if the player has completed all levels
    if (gameData.character.level > gameData.levels.length) {
      say("Congratulations! You have completed all levels.", gameData.character);
      playing = false; // End the game loop
    }

    // Check for the end of the game session
    if (!playing) {
      say("Game over. Thanks for playing!", gameData.character);
      // Optionally, include any end-of-game logic here, such as saving final state or showing credits
    }
  }
}

// Run the main function and handle any unhandled exceptions
main().catch(error => {
  console.error("An unexpected error occurred:", error);
});