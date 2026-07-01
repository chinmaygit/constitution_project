import * as fs from 'fs';
import * as path from 'path';

// Strips the leading copy-instructions HTML comment every template carries
// (see templates/AGENTS.md's own statute) -- that comment is for whoever
// edits the template source, not for the file written into a consumer repo.
function stripTemplateComment(text: string): string {
  return text.replace(/^<!--[\s\S]*?-->\n+/, '');
}

export async function scaffoldFramework(targetDir: string, projectName: string, ratifierName: string) {
  // The package's own vendored copy (cli/{templates,process}/, written by
  // scripts/vendor.js) -- not a sibling of cli/ (npm can't package outside cli/).
  const packageRoot = path.resolve(__dirname, '..');
  const templatesDir = path.join(packageRoot, 'templates');

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

  // Initialize CONSTITUTION.md from templates/constitution.md -- never hand-write the
  // skeleton here, or it silently drifts from the template the moment either one changes.
  const constitutionPath = path.join(targetDir, 'CONSTITUTION.md');
  if (!fs.existsSync(constitutionPath)) {
    const constitutionTemplatePath = path.join(templatesDir, 'constitution.md');
    if (!fs.existsSync(constitutionTemplatePath)) {
      console.error(`Cannot initialize CONSTITUTION.md: missing template at ${constitutionTemplatePath}`);
    } else {
      console.log('Initializing CONSTITUTION.md...');
      const packageVersion = require('../package.json').version;
      const content = stripTemplateComment(fs.readFileSync(constitutionTemplatePath, 'utf-8'))
        .replace(/<PROJECT_NAME>/g, projectName)
        .replace(/<FRAMEWORK_VERSION>/g, packageVersion)
        .replace(/<RATIFIER_NAME>/g, ratifierName);
      fs.writeFileSync(constitutionPath, content, 'utf-8');
    }
  } else {
    console.log('CONSTITUTION.md already exists, skipping initialization.');
  }

  // Initialize or safe-append AGENTS.md from templates/governance-map.md -- same reasoning.
  const agentsPath = path.join(targetDir, 'AGENTS.md');
  const mapTemplatePath = path.join(templatesDir, 'governance-map.md');

  if (!fs.existsSync(mapTemplatePath)) {
    console.error(`Cannot initialize AGENTS.md: missing template at ${mapTemplatePath}`);
    return;
  }
  const agentMapBlock = stripTemplateComment(fs.readFileSync(mapTemplatePath, 'utf-8'));

  if (!fs.existsSync(agentsPath)) {
    console.log('Initializing AGENTS.md...');
    fs.writeFileSync(agentsPath, agentMapBlock, 'utf-8');
  } else {
    console.log('AGENTS.md already exists, safe-appending governance map block...');
    const existingContent = fs.readFileSync(agentsPath, 'utf-8');
    if (!existingContent.includes('Governance Map')) {
      fs.appendFileSync(agentsPath, `\n${agentMapBlock}`, 'utf-8');
    } else {
      console.log('Governance map block already present in AGENTS.md, skipping append.');
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
