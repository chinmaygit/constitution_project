import * as fs from 'fs';
import * as path from 'path';

export async function scaffoldFramework(targetDir: string, ratifierName: string) {
  const packageRoot = path.resolve(__dirname, '..', '..');

  // Folders to copy from the package root to the target dir's .constitution namespace
  const foldersToCopy = ['templates', 'process'];

  for (const folder of foldersToCopy) {
    const src = path.join(packageRoot, folder);
    const dest = path.join(targetDir, '.constitution', folder);
    
    if (fs.existsSync(src)) {
      console.log(`Copying ${folder} to .constitution/${folder}...`);
      copyRecursiveSync(src, dest);
    } else {
      console.warn(`Warning: Source folder ${folder} not found in package at ${src}`);
    }
  }

  // Update .gitignore
  const gitignorePath = path.join(targetDir, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    if (!gitignoreContent.includes('.constitution/')) {
      fs.appendFileSync(gitignorePath, '\n# Framework namespace\n.constitution/\n', 'utf-8');
    }
  } else {
    fs.writeFileSync(gitignorePath, '# Framework namespace\n.constitution/\n', 'utf-8');
  }

  // Initialize CONSTITUTION.md
  const constitutionPath = path.join(targetDir, 'CONSTITUTION.md');
  if (!fs.existsSync(constitutionPath)) {
    console.log('Initializing CONSTITUTION.md...');
    const packageVersion = require('../package.json').version;
    const initialContent = `# Constitution

\`\`\`
framework: constitution@${packageVersion}
ratifier:  ${ratifierName}
\`\`\`

## L0 — Preamble (vision)
**P1.** Edit this file to add your product's vision.

## L1 — Articles (meta-invariants)
*(See templates/article.md to add articles)*
`;
    fs.writeFileSync(constitutionPath, initialContent, 'utf-8');
  } else {
    console.log('CONSTITUTION.md already exists, skipping initialization.');
  }

  // Initialize or safe-append AGENT.md
  const agentPath = path.join(targetDir, 'AGENT.md');
  const agentMapBlock = `
# Governance Map

- **Constitution (L0/L1)**: \`CONSTITUTION.md\`
- **Case Law (L3)**: \`decisions/\`
- **Statutes (L2)**: Managed in this \`AGENT.md\` file (or specify other files/globs here).

*This file serves as the entry-point index for the audit-structure and compile-prompt skills.*
`;
  if (!fs.existsSync(agentPath)) {
    console.log('Initializing AGENT.md...');
    fs.writeFileSync(agentPath, agentMapBlock, 'utf-8');
  } else {
    console.log('AGENT.md already exists, safe-appending governance map block...');
    const existingContent = fs.readFileSync(agentPath, 'utf-8');
    if (!existingContent.includes('Governance Map')) {
      fs.appendFileSync(agentPath, `\n${agentMapBlock}`, 'utf-8');
    } else {
      console.log('Governance map block already present in AGENT.md, skipping append.');
    }
  }
}

// Helper function to copy directories recursively
function copyRecursiveSync(src: string, dest: string) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats && stats.isDirectory();
  
  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}
