import { say } from "./shared/cli.js";
import { gptPrompt } from "./shared/openai.js";

async function main() {
  const prologuePrompt = `
  Write a short prologue about the rising tensions between the Alien Empire and the Galactic Federation over scarce resources, setting the stage for an epic space battle.
  `;
  const prologueResponse = await gptPrompt(prologuePrompt, { max_tokens: 100 });
  say(`Prologue:\n${prologueResponse}\n`);

  const alienEmpire = { hp: 180, attack: 20, defense: 100 }; 
  const galacticFederation = { hp: 100, attack: 18, defense: 50 }; 

  let outline = "";
  while (alienEmpire.hp > 0 && galacticFederation.hp > 0) {
    let damage; 

    outline += "The alien empire's fleet launches a barrage against the Galactic Federation.\n";
    if (Math.random() * alienEmpire.attack > Math.random() * galacticFederation.defense) {
      damage = 5 + Math.floor(Math.random() * 10); 
      galacticFederation.hp -= damage;
      outline += `The attack breaches the Federation's shields, causing significant damage. ${damage} damage.\n`;
    } else {
      damage = 0; 
      outline += `The Federation's shields hold strong against the attack. ${damage} damage.\n`;
    }

    outline += "The Galactic Federation retaliates with a counterstrike.\n";
    if (Math.random() * galacticFederation.attack > Math.random() * alienEmpire.defense) {
      damage = 5 + Math.floor(Math.random() * 10); 
      alienEmpire.hp -= damage;
      outline += `Their strike hits critical systems, dealing a heavy blow to the Alien fleet. ${damage} damage.\n`;
    } else {
      damage = 0; 
      outline += `The Alien Empire's defenses repel the Federation's counterstrike. ${damage} damage.\n`;
    }

    outline += `Current state: Alien Empire HP: ${alienEmpire.hp}, Attack: ${alienEmpire.attack}, Defense: ${alienEmpire.defense}; ` +
               `Galactic Federation HP: ${galacticFederation.hp}, Attack: ${galacticFederation.attack}, Defense: ${galacticFederation.defense}.\n\n`;
  }

  outline += `The Alien Empire's fleet is at ${Math.max(alienEmpire.hp, 0)}/180 operational capacity.\n`;
  outline += `The Galactic Federation's forces are at ${Math.max(galacticFederation.hp, 0)}/100 operational capacity.\n`;

  say(outline);


  const epiloguePrompt = `
  Write a short epilogue for the epic space battle between the Alien Empire and the Galactic Federation. Describe the aftermath and the impact on both factions, using vivid and imaginative language to bring the resolution to life. Avoid using specific numbers for damage or fleet strength, and instead use descriptive terms.
  Battle Outline:
  ${outline}`;
  const epilogueResponse = await gptPrompt(epiloguePrompt, { max_tokens: 100 });

  say(`Epilogue:\n${epilogueResponse}`);

  const summaryPrompt = `
  Summarize the following epic space battle story in four sentences.
  ${epilogueResponse}
  `;
  const summaryResponse = await gptPrompt(summaryPrompt, { max_tokens: 100 });

  say(summaryResponse);
}

main();
