// Import shared modules from your project
import { gptPrompt } from "./shared/openai.js";
import { ask, say as originalSay } from "./shared/cli.js";

class MemoryStream {
  constructor() {
    this.events = [];
  }

  record(event) {
    this.events.push(event);
  }

  retrieve(type, condition = () => true) {
    return this.events.filter(event => event.type === type && condition(event));
  }

  recordStoryEvent(event, importance) {
    this.events.push({ type: 'storyEvent', event, importance, timestamp: new Date().toISOString() });
  }
}

const memoryStream = new MemoryStream();

function say(message, player = null) {
  originalSay(message);
  memoryStream.record({ type: 'say', message, player, timestamp: new Date().toISOString() });
  
  if (player) {
    originalSay(`Health: ${player.health}/${player.maxHealth}`);
    
    if (player.health <= 20) {
      originalSay("You're severely wounded and barely able to stand.");
    } else if (player.energy <= 20) {
      originalSay("Exhaustion grips you, each step feels heavier.");
    }
  }
}

async function loadGameData(filePath) {
  console.log('Loading game data from', filePath);
  const data = await Deno.readTextFile(filePath);
  const parsedData = JSON.parse(data);
  memoryStream.record({ type: 'loadGameData', filePath, timestamp: new Date().toISOString() });
  return parsedData;
}

async function savePlayerState(filePath, playerState) {
  console.log('Saving player state to', filePath);
  const data = JSON.stringify(playerState, null, 2);
  await Deno.writeTextFile(filePath, data);
}

async function loadAllGameData() {
  console.log('Loading all game data...');
  const characterData = await loadGameData('src/character.json');
  const classAbilitiesData = await loadGameData('src/classAbilities.json');
  const characterClassesData = await loadGameData('src/characterClasses.json');
  const levelData = await loadGameData('src/levels.json');
  const storyData = await loadGameData('src/story.json');

  return {
    character: characterData,
    classAbilities: classAbilitiesData,
    characterClasses: characterClassesData,
    levels: levelData,
    story: storyData
  };
}

class Level {
  constructor(id, name, rewards, generatedContent = "") {
    this.id = id;
    this.name = name;
    this.rewards = rewards;
    this.generatedContent = generatedContent;
  }

  static async createFromJson(levelData, gameData, player, memoryStream) {
    if (!levelData.generatedContent) {
      const generatedLevel = await generateLevel(player, gameData, levelData, memoryStream);
      if (generatedLevel) {
        levelData.generatedContent = generatedLevel.generatedContent;
        return new Level(
          levelData.id,
          levelData.name,
          levelData.rewards,
          generatedLevel.generatedContent
        );
      }
    }
    return new Level(
      levelData.id,
      levelData.name,
      levelData.rewards,
      levelData.generatedContent
    );
  }
}

function enhanceNarration(content) {
  content = content.replace(/kids/g, "children");
  content = content.replace(/happy/g, "content");
  return content;
}

function generateLevelPrompt(player, gameData, currentLevel, memoryStream) {
  console.log('Generating prompt for GPT-3');
  const classAbilitiesStr = JSON.stringify(gameData.classAbilities[player.class]);
  const characterClassesStr = JSON.stringify(gameData.characterClasses);
  const playerActionsStr = JSON.stringify(memoryStream.retrieve('action', event => event.player?.name === player.name));

  return `
    System: You are a master storyteller crafting immersive and engaging narratives for a text-based adventure game. Your task is to generate a compelling level narrative that seamlessly incorporates challenges and obstacles based on the provided character information, class abilities, current level data, and the player's past actions and choices.

    Instructions:
    - Generate a game level using the following format:
      Level [Level ID]:
      [Level Name]

      Health: [Current Health]/[Maximum Health]

      [Engaging Level Narrative]

      Choice 1: [Choice description, subtly hinting at potential consequences]
      Choice 2: [Choice description, subtly hinting at potential consequences]

      Enter your action:
    - Craft an immersive and cohesive narrative that naturally integrates the challenges and obstacles the player must overcome, without explicitly stating them.
    - Use descriptive language with utility, purpose, and with grammatical sense and insight, to set the scene, create a atmosphere, and hint at the challenges ahead.
    - Incorporate the player's past actions, choices, and current health into the narrative to create a sense of continuity and consequence.
    - If the player's health is low (e.g., below 30%), reflect this in the tone and urgency of the narrative, if not ignore any staments about players health or energy.
    - Present the player with 2 meaningful choices that fit organically within the story, subtly hinting at potential consequences without giving too much away.
    - Use the character's abilities, health, and energy creatively in the narrative to make the player feel connected to their character, cost and rward to choices like they have purpose in the narrative.
    - Maintain consistency with the overall game story, setting, and the player's class and abilities.
    - Use a natural poetic writing styles such as those of Aesop, Euripides, Aeschylus and Sophocles, and mainly Homer; the style should be immerses and sophisticated.

    Character:
    ${JSON.stringify(player)}

    Class Abilities:
    ${classAbilitiesStr}

    Character Classes:
    ${characterClassesStr}

    Current Level:
    ${JSON.stringify(currentLevel)}

    Player Actions:
    ${playerActionsStr}

    Please generate an immersive and engaging level narrative based on the provided information and instructions.
  `;
}

async function generateLevel(player, gameData, currentLevel, memoryStream) {
  const prompt = generateLevelPrompt(player, gameData, currentLevel, memoryStream);
  try {
    const generatedLevel = await gptPrompt(prompt, {
      max_tokens: 800,
      temperature: 0.8,
    });

    const levelContent = generatedLevel.trim();
    currentLevel.generatedContent = enhanceNarration(levelContent);
    return currentLevel;
  } catch (error) {
    console.error('Error generating level content:', error);
    return null;
  }
}

function processPlayerChoice(player, choice, currentLevel) {
  memoryStream.record({ type: 'action', description: choice, player, currentLevel: currentLevel.id, timestamp: new Date().toISOString() });

  // Check if the player's choice is valid
  if (!/^choice \d+$/i.test(choice)) {
    say("Invalid choice. Please enter a valid choice (e.g., 'Choice 1' or 'Choice 2').", player);
    return false;
  }

  say(`You chose: ${choice}`, player);

  // Simulate choice consequences (e.g., health depletion based on the choice)
  if (choice.toLowerCase().includes('attack')) {
    player.health -= Math.floor(Math.random() * 20) + 10; // Deplete health by 10-30 points
  } else if (choice.toLowerCase().includes('defend')) {
    player.health -= Math.floor(Math.random() * 10) + 5; // Deplete health by 5-15 points
  }

  if (player.health <= 0) {
    say("You have been defeated. Game over!", player);
    return false;
  }

  say("Continue exploring the current level.", player);
  return true;
}

async function main() {
  console.log('Starting game');
  const gameData = await loadAllGameData();

  const playerName = await ask("What is your name?");
  gameData.character.name = playerName;

  const playerClassChoice = await ask(`What is your class? Available classes: ${Object.keys(gameData.characterClasses).join(", ")}`);
  if (!gameData.characterClasses[playerClassChoice]) {
    say(`Invalid class selected. Available classes: ${Object.keys(gameData.characterClasses).join(", ")}`);
    return;
  }

  gameData.character.class = playerClassChoice;
  gameData.character.classDescription = gameData.characterClasses[playerClassChoice].description;
  gameData.character.abilities = gameData.classAbilities[playerClassChoice];
  gameData.character.storyProgress = 0;
  gameData.character.level = 1; // Ensure starting at level 1
  gameData.character.health = 100; // Initial health
  gameData.character.maxHealth = 100; // Maximum health
  gameData.character.energy = 100; // Initial energy

  say(`Welcome, ${gameData.character.name} the ${playerClassChoice}!`);
  say(gameData.character.classDescription, gameData.character);

  const readyToStart = await ask("Are you ready to begin your adventure? (yes/no)");
  if (readyToStart.trim().toLowerCase() !== 'yes') {
    say("Okay, start whenever you're ready.");
    return;
  }

  while (gameData.character.level <= gameData.levels.length) {
    const currentLevelData = gameData.levels[gameData.character.level - 1];
    const currentLevel = await Level.createFromJson(currentLevelData, gameData, gameData.character, memoryStream);
    const generatedLevel = await generateLevel(gameData.character, gameData, currentLevel, memoryStream);
    say(generatedLevel.generatedContent, gameData.character);

    let levelCompleted = false;
    while (!levelCompleted) {
      const choice = await ask("Enter your action:");
      levelCompleted = processPlayerChoice(gameData.character, choice, currentLevel);
    }

    await savePlayerState('src/character.json', gameData.character);

    // Progress to the next level
    gameData.character.level++;

    if (gameData.character.level <= gameData.levels.length) {
      say(`Advancing to Level ${gameData.character.level}...`, gameData.character);
    } else {
      say("Congratulations! You have completed all levels.", gameData.character);
      break;
    }
  }

  say("Game over. Thanks for playing!", gameData.character);
}

main().catch(error => {
  console.error("An unexpected error occurred:", error);
});