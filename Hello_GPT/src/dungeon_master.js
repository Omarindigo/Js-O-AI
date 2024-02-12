import { ask, say } from "./shared/cli.js";
import { gptPrompt } from "./shared/openai.js";

async function main() {
    say("Welcome to the Hero's Journey!");

    const player = {
        name: await ask("What is your name?"),
        class: await ask("What is your class?")
    };

    say(`Greetings, ${player.name} the ${player.class}. Your adventure begins now.`);

    let narrativeContext = '';

    const stages = [
        { name: "The Call to Adventure", acts: 1 },
        { name: "Refusal of the Call", acts: 2 },
        { name: "Supernatural Aid", acts: 1 },
        { name: "The Crossing of the First Threshold", acts: 3 },
        { name: "Belly of the Beast", acts: 2 },
        { name: "The Road of Trials", acts: 3 },
        { name: "The Meeting with the God or Eldritch Entity", acts: 1 },
        { name: "Man as the Lover", acts: 2 },
        { name: "Atonement with the Abyss", acts: 1 },
        { name: "Apotheosis", acts: 2 },
        { name: "The Ultimate Boon", acts: 1 },
        { name: "Refusal of the Return", acts: 2 },
        { name: "The Magic Flight", acts: 1 },
        { name: "Rescue from Without", acts: 2 },
        { name: "The Crossing of the Return Threshold", acts: 1 },
        { name: "Master of the Two Worlds", acts: 2 },
        { name: "Freedom to Live", acts: 1 }
    ];

    for (const stage of stages) {
        for (let act = 1; act <= stage.acts; act++) {
            say(`\nStage: ${stage.name} - Act: ${act}`);
            
            const storyPrompt = `
${narrativeContext}
Hero: ${player.name}, a ${player.class}.
Stage: ${stage.name}, Act: ${act}.
Narrate a story that is based on the story circle, leading to a decision point with two clear choices for the hero. Format the choices as follows:
"Choice 1: [description]"
"Choice 2: [description]"
Each choice should relevent to to the act, and should move the narative as a continium. 
`;

            const storyResponse = await gptPrompt(storyPrompt, {
                max_tokens: 250,
                temperature: 0.7,
            });

            say(storyResponse);

            const choices = extractChoices(storyResponse);

            const playerChoice = await ask(`\nHow will you proceed? 1) ${choices[0]}, 2) ${choices[1]}, or type 'quit' to end your journey`);

            if (playerChoice.toLowerCase() === "quit") {
                say("Your journey has come to an early end. Farewell, hero.");
                return;
            } else {
                narrativeContext += ` Following the path, Omar chose to "${choices[parseInt(playerChoice) - 1]}".`;
            }
        }
    }

    say("\nCongratulations! You have completed the Hero's Journey and returned home transformed. What adventures await you next?");
}

function extractChoices(storyResponse) {
    const choicePattern = /"Choice (\d): ([^"]+)"/g; 
    let match;
    const choices = [];

    while ((match = choicePattern.exec(storyResponse)) !== null) {
        choices.push(match[2]);
    }

    return choices.length >= 2 ? choices : ["ponder the situation further", "seek guidance from a mentor"];
}

main();
