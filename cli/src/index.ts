#!/usr/bin/env node

import { scaffoldFramework } from './scaffold';
import { setupAgents } from './agents';
import * as path from 'path';
import prompts from 'prompts';

const VERSION: string = require('../package.json').version;

const HELP_TEXT = `
constitution — scaffold the constitution governance framework into a project

Usage:
  constitution init        Interactively scaffold the framework into this repo
  constitution --version   Print the installed version
  constitution --help      Show this help

Run from the target project's root — it uses the current working directory.
`;

async function runInit() {
  const targetDir = process.cwd();
  console.log(`\nInitializing Constitution Framework in ${targetDir}...\n`);

  const response = await prompts([
    {
      type: 'text',
      name: 'projectName',
      message: 'What is the name of this project?',
      initial: path.basename(targetDir)
    },
    {
      type: 'text',
      name: 'ratifier',
      message: 'Who is the ratifier for this constitution? (e.g. Engineering Team)',
      initial: '<Your Name>'
    },
    {
      type: 'multiselect',
      name: 'agents',
      message: 'Which AI agents do you want to configure?',
      choices: [
        { title: 'Cursor', value: 'cursor', selected: true },
        { title: 'Claude', value: 'claude', selected: true },
        { title: 'Antigravity', value: 'antigravity', selected: true },
        { title: 'GitHub Copilot', value: 'copilot', selected: false }
      ]
    }
  ]);

  // If user cancels the prompt (Ctrl+C), exit gracefully
  if (response.projectName === undefined || response.ratifier === undefined || response.agents === undefined) {
    console.log('\nInitialization cancelled.');
    process.exit(0);
  }

  try {
    await scaffoldFramework(targetDir, response.projectName, response.ratifier);
    await setupAgents(targetDir, response.agents);

    console.log('\nSuccess! The constitution framework is now active in your project.');
    console.log('You can now use your preferred AI agent governed by the framework.');
  } catch (error) {
    console.error('Failed to initialize constitution:', error);
    process.exit(1);
  }
}

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'init':
      await runInit();
      break;
    case '--version':
    case '-v':
      console.log(VERSION);
      break;
    case '--help':
    case '-h':
    case undefined:
      console.log(HELP_TEXT);
      break;
    default:
      console.error(`Unknown command: ${command}\n`);
      console.log(HELP_TEXT);
      process.exit(1);
  }
}

main();
