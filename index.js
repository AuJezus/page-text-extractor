#!/usr/bin/env node
import { input, confirm } from "@inquirer/prompts";
import gradient from "gradient-string";
import figlet from "figlet";
import boxen from "boxen";
import * as cheerio from "cheerio";
import chalk from "chalk";

// Use AbortController for knowing when figlet finishes
const abortController = new AbortController();
const abortPromise = new Promise((res, rej) =>
  abortController.signal.addEventListener("abort", res)
);
figlet("Page Text Extractor", (err, data) => {
  if (err) {
    console.log("There was an error");
    return;
  }

  console.log(
    gradient.pastel.multiline(
      boxen(data, { borderStyle: "double", padding: 1 })
    )
  );
  abortController.abort();
});
await abortPromise;

async function start() {
  // Prompt for input
  const url = await input({
    message: "Url of the website from which to extract text : ",
  });
  const cssSelector = await input({
    message: "What css selector to use? : ",
  });
  console.clear();

  try {
    // Get the html
    const res = await fetch(url);
    const htmlText = await res.text();
    const $ = cheerio.load(htmlText);
    const result = $(cssSelector);

    // Print the results
    console.log(
      result.length > 0
        ? chalk.bgGreen(
            `\n Found ${result.length} elements with ${chalk.red(
              "(" + cssSelector + ")"
            )} selector \n`
          )
        : chalk.bgRed(
            `\n Found ${result.length} elements with ${chalk.strikethrough(
              "(" + cssSelector + ")"
            )} selector \n`
          )
    );

    result.each((index, element) => {
      const text = $(element).text();
      console.log(
        boxen(text, {
          title: `Element ${index + 1}`,
          titleAlignment: "center",
          borderColor: "green",
        })
      );
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }

  const again = await confirm({ message: "Go again? : " });
  if (again) await start();
}

await start();
console.log(
  boxen("See you next time!", {
    borderStyle: "arrow",
    borderColor: "magentaBright",
    padding: 1,
  })
);
process.exit(0);
