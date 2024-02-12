//Create a new script that asks the user for a subject and then prints out a light bulb joke about that subject.
import { ask, say } from "./shared/cli.js";
import { gptPrompt } from "./shared/openai.js";

async function main() {
 
    say("Hello fool!");

  const subject = await ask("Name any subject");

  const prompt = `With ${subject}, create a joke about light bulb and that subject.`

  const joke = await gptPrompt(prompt, { temperature: 0.7});

  say(`"""\n${joke}\n"""`);

}
main();