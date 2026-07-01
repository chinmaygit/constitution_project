import * as fs from 'fs';
import * as path from 'path';

export async function setupAgents(targetDir: string, selectedAgents: string[]) {
  // 1. Generate pointer files
  const pointerText = `# Constitution Framework\n\nYou are governed by the Constitution framework.\nALWAYS read \`AGENT.md\` in the root directory to find your instructions and governance map.\n`;

  const pointers: { file: string; content: string }[] = [];
  
  if (selectedAgents.includes('cursor')) {
    pointers.push({ file: '.cursorrules', content: pointerText });
  }
  
  if (selectedAgents.includes('copilot')) {
    pointers.push({ file: '.github/copilot-instructions.md', content: pointerText });
  }

  for (const ptr of pointers) {
    const ptrPath = path.join(targetDir, ptr.file);
    const dir = path.dirname(ptrPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    if (!fs.existsSync(ptrPath)) {
      console.log(`Injecting pointer: ${ptr.file}...`);
      fs.writeFileSync(ptrPath, ptr.content, 'utf-8');
    } else {
      console.log(`${ptr.file} already exists, skipping pointer injection.`);
    }
  }

  // 2. Compile skills into agent-specific formats
  // Read skills from the package's own vendored copy (cli/skills/, written by
  // scripts/vendor.js at build/pack time) -- not the consumer's target dir, and
  // not a sibling of cli/ (npm can't package outside the package root).
  const packageRoot = path.resolve(__dirname, '..');
  const skillsDir = path.join(packageRoot, 'skills');

  if (fs.existsSync(skillsDir)) {
    console.log('Compiling framework skills into agent-specific artifacts...');
    const skills = fs.readdirSync(skillsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const skill of skills) {
      const skillPath = path.join(skillsDir, skill);
      const skillMdPath = path.join(skillPath, 'SKILL.md');
      if (!fs.existsSync(skillMdPath)) continue;

      const content = fs.readFileSync(skillMdPath, 'utf-8');

      // Helper to rewrite internal markdown links based on target folder depth.
      // Source skill files link as ../../process/... and ../../templates/...
      // (two levels up from skills/<name>/SKILL.md to the framework repo root).
      const rewriteLinks = (text: string, depth: number) => {
        const up = '../'.repeat(depth);
        let rewritten = text.replace(/\.\.\/\.\.\/process\//g, `${up}.constitution/process/`);
        rewritten = rewritten.replace(/\.\.\/\.\.\/templates\//g, `${up}.constitution/templates/`);
        return rewritten;
      };

      // Cursor (.cursor/rules/*.mdc)
      if (selectedAgents.includes('cursor')) {
        const cursorRulePath = path.join(targetDir, '.cursor', 'rules', `${skill}.mdc`);
        if (!fs.existsSync(path.dirname(cursorRulePath))) fs.mkdirSync(path.dirname(cursorRulePath), { recursive: true });
        const cursorContent = `---
description: Central framework skill: ${skill}
alwaysApply: true
---
${rewriteLinks(content, 2)}`;
        fs.writeFileSync(cursorRulePath, cursorContent, 'utf-8');
      }

      // Claude (.claude/skills/)
      if (selectedAgents.includes('claude')) {
        const claudeSkillDir = path.join(targetDir, '.claude', 'skills', skill);
        if (!fs.existsSync(claudeSkillDir)) fs.mkdirSync(claudeSkillDir, { recursive: true });
        fs.writeFileSync(path.join(claudeSkillDir, 'SKILL.md'), rewriteLinks(content, 3), 'utf-8');
      }

      // Antigravity (.agents/skills/)
      if (selectedAgents.includes('antigravity')) {
        const agySkillDir = path.join(targetDir, '.agents', 'skills', skill);
        if (!fs.existsSync(agySkillDir)) fs.mkdirSync(agySkillDir, { recursive: true });
        fs.writeFileSync(path.join(agySkillDir, 'SKILL.md'), rewriteLinks(content, 3), 'utf-8');
      }
    }
  }
}
