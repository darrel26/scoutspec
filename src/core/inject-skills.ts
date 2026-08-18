import fs from "node:fs";
import path from "node:path";
import { getTemplatesDir } from "./scaffold.js";

export type AgentHarness = "claude" | "opencode";

export interface InjectSkillsOptions {
  cwd?: string;
  agents: AgentHarness[];
  overwrite?: boolean;
}

export function copyDirectoryRecursive(src: string, dest: string, overwrite = true): string[] {
  const copied: string[] = [];
  if (!fs.existsSync(src)) {
    return copied;
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copied.push(...copyDirectoryRecursive(srcPath, destPath, overwrite));
    } else {
      if (!fs.existsSync(destPath) || overwrite) {
        fs.copyFileSync(srcPath, destPath);
        copied.push(destPath);
      }
    }
  }

  return copied;
}

export function injectSkills(options: InjectSkillsOptions): {
  injected: Record<AgentHarness, string[]>;
} {
  const cwd = options.cwd || process.cwd();
  const templatesDir = getTemplatesDir();
  const skillSrc = path.join(templatesDir, "skills", "scout-product-requirement");

  const results: Record<AgentHarness, string[]> = {
    claude: [],
    opencode: [],
  };

  for (const agent of options.agents) {
    let targetSkillDir = "";
    if (agent === "claude") {
      targetSkillDir = path.join(cwd, ".claude", "skills", "scout-product-requirement");
    } else if (agent === "opencode") {
      targetSkillDir = path.join(cwd, ".opencode", "skills", "scout-product-requirement");
    }

    if (targetSkillDir) {
      const files = copyDirectoryRecursive(skillSrc, targetSkillDir, options.overwrite ?? true);
      results[agent] = files.map((f) => path.relative(cwd, f));
    }
  }

  return { injected: results };
}
