console.log("hello, world!");

//const userName = "Omar Batista"
//console.log(userName);

/*for (let i = 0; i < 1000; i++) {
    console.log('Omar Batista');
}*/

/*const userName = prompt('what is your name');
console.log(`hello ${userName}`);
*/

/*const num1 = Number(prompt('enter a number'));
const num2 = Number(prompt('enter another number'));
console.log(`The sum of the two numbers is ${num1 + num2}.`);*/

//const randNum = Math.floor(Math.random() * 6) + 1;
//console.log(randNum);

/*let firstName = "OMAR"
let lastName = "BATISTA"

console.log(Math.random() < 0.5 ? firstName : lastName); */

/*
// Define the exchange rate from USD to Gold Dragons
const exchangeRateUSDToGD = 0.2;

// Function to prompt the user and return their input
async function promptUser(message) {
  console.log(message);
  const buf = new Uint8Array(1024);
  const n = await Deno.stdin.read(buf);
  return new TextDecoder().decode(buf.subarray(0, n)).trim();
}

// Function to convert USD to Gold Dragons
function convertUSDToGD(usd) {
  return usd * exchangeRateUSDToGD;
}

// Main async function to handle the conversion
async function main() {
  const usdAmountStr = await promptUser("Enter the amount in USD: ");
  const usdAmount = Number(usdAmountStr);
  if (!isNaN(usdAmount)) {
    console.log(`${usdAmount} USD is equivalent to ${convertUSDToGD(usdAmount)} Gold Dragons.`);
  } else {
    console.log("Invalid number entered. Please enter a valid numerical amount.");
  }
}

main(); */

/*
// Function to prompt the user and return their input
async function promptUser(message) {
    console.log(message);
    const buf = new Uint8Array(1024);
    const n = await Deno.stdin.read(buf);
    return new TextDecoder().decode(buf.subarray(0, n)).trim();
}

// Function to categorize temperature
function categorizeTemperature(fahrenheit) {
    if (fahrenheit < 50) {
        return "cold";
    } else if (fahrenheit <= 80) {
        return "warm";
    } else {
        return "hot";
    }
}

// Main async function to handle the process
async function main() {
    const tempStr = await promptUser("Enter the temperature in Fahrenheit: ");
    const temp = Number(tempStr);
    if (!isNaN(temp)) {
        const category = categorizeTemperature(temp);
        console.log(`The temperature is considered ${category}.`);
    } else {
        console.log("Invalid temperature entered. Please enter a numerical value.");
    }
}

// Run the main function
main();
*/

/*async function promptUser(message) {
    console.log(message);
    const buf = new Uint8Array(1024);
    const n = await Deno.stdin.read(buf);
    return new TextDecoder().decode(buf.subarray(0, n)).trim();
}

const questions = [
    { question: "Where was Nikola Tesla born? \nA: United States \nB: Austria \nC: Croatia", answer: "C" },
    { question: "In what year did Nikola Tesla claim to have developed a 'death beam'? \nA: 1924 \nB: 1934 \nC: 1944", answer: "B" },
    { question: "Which of the following was NOT invented by Tesla? \nA: Alternating Current (AC) \nB: Radio \nC: Light Bulb", answer: "C" }
];

async function main() {
    let score = 0;

    for (const q of questions) {
        const userAnswer = await promptUser(`${q.question}`);
        if (userAnswer.toUpperCase() === q.answer) {
            console.log("Correct!\n");
            score++;
        } else {
            console.log("Wrong answer.\n");
        }
    }

    console.log(`You got ${score} out of ${questions.length} questions right.`);
}

main();*/
