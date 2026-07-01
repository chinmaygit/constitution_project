#!/usr/bin/env node

import { scaffoldFramework } from './scaffold';
import { setupAgents } from './agents';
import * as path from 'path';
import prompts from 'prompts';

async function main() {
  const targetDir = process.cwd();
  console.log(`\nInitializing Constitution Framework in ${targetDir}...\n`);

  const response = await prompts([
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
  if (response.ratifier === undefined || response.agents === undefined) {
    console.log('\nInitialization cancelled.');
    process.exit(0);
  }

  try {
    await scaffoldFramework(targetDir, response.ratifier);
    await setupAgents(targetDir, response.agents);

    console.log('\nSuccess! The constitution framework is now active in your project.');
    console.log('You can now use your preferred AI agent governed by the framework.');
  } catch (error) {
    console.error('Failed to initialize constitution:', error);
    process.exit(1);
  }
}

main();
