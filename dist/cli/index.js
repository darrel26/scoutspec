// node_modules/tsup/assets/esm_shims.js
import path from "path";
import { fileURLToPath } from "url";
var getFilename = () => fileURLToPath(import.meta.url);
var getDirname = () => path.dirname(getFilename());
var __dirname = /* @__PURE__ */ getDirname();

// src/cli/index.ts
import { Command } from "commander";

// src/cli/commands/init.ts
import fs3 from "fs";
import path4 from "path";
import * as p from "@clack/prompts";
import pc from "picocolors";

// src/core/scaffold.ts
import fs from "fs";
import path2 from "path";
function getTemplatesDir() {
  const candidates = [
    path2.resolve(process.cwd(), "templates"),
    path2.resolve(__dirname, "../templates"),
    path2.resolve(__dirname, "../../templates"),
    path2.resolve(__dirname, "../../../templates")
  ];
  for (const p2 of candidates) {
    if (fs.existsSync(p2)) {
      return p2;
    }
  }
  return path2.resolve(process.cwd(), "templates");
}
function renderContextTemplate(templateContent, answers) {
  let content = templateContent;
  content = content.replace(
    "{{BUSINESS_CONTEXT}}",
    answers?.businessContext ? answers.businessContext.trim() : ""
  );
  content = content.replace(
    "{{TECHNICAL_CONSTRAINTS}}",
    answers?.technicalConstraints ? answers.technicalConstraints.trim() : ""
  );
  content = content.replace(
    "{{COMPETITOR_KNOWLEDGE}}",
    answers?.competitorKnowledge ? answers.competitorKnowledge.trim() : ""
  );
  content = content.replace(
    "{{CUSTOMER_PERSONAS}}",
    answers?.customerPersonas ? answers.customerPersonas.trim() : ""
  );
  return content;
}
function scaffoldScoutspecDirectory(options = {}) {
  const cwd = options.cwd || process.cwd();
  const scoutspecDir = path2.join(cwd, "scoutspec");
  const templatesDir = getTemplatesDir();
  const created = [];
  const skipped = [];
  const dirsToCreate = [
    scoutspecDir,
    path2.join(scoutspecDir, "specs"),
    path2.join(scoutspecDir, "requirements")
  ];
  for (const dir of dirsToCreate) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      created.push(path2.relative(cwd, dir));
    }
  }
  const contextDest = path2.join(scoutspecDir, "context.md");
  const contextTemplatePath = path2.join(templatesDir, "scoutspec", "context.md");
  let templateContent = "";
  if (fs.existsSync(contextTemplatePath)) {
    templateContent = fs.readFileSync(contextTemplatePath, "utf8");
  } else {
    templateContent = `# Project Context & Persistent Knowledge Base

## Business Context
{{BUSINESS_CONTEXT}}

## Team & Technical Constraints
{{TECHNICAL_CONSTRAINTS}}

## Competitor & Market Knowledge
{{COMPETITOR_KNOWLEDGE}}

## Customer Personas & Workflows
{{CUSTOMER_PERSONAS}}
`;
  }
  const renderedContext = renderContextTemplate(templateContent, options.contextAnswers);
  if (!fs.existsSync(contextDest) || options.conflictStrategy === "overwrite") {
    fs.writeFileSync(contextDest, renderedContext, "utf8");
    created.push(path2.relative(cwd, contextDest));
  } else {
    skipped.push(path2.relative(cwd, contextDest));
  }
  const indexDest = path2.join(scoutspecDir, "index.yaml");
  const indexTemplatePath = path2.join(templatesDir, "scoutspec", "index.yaml");
  let indexContent = "version: 1\nrequirements: []\n";
  if (fs.existsSync(indexTemplatePath)) {
    indexContent = fs.readFileSync(indexTemplatePath, "utf8");
  }
  if (!fs.existsSync(indexDest) || options.conflictStrategy === "overwrite") {
    fs.writeFileSync(indexDest, indexContent, "utf8");
    created.push(path2.relative(cwd, indexDest));
  } else {
    skipped.push(path2.relative(cwd, indexDest));
  }
  return { created, skipped };
}

// src/core/inject-skills.ts
import fs2 from "fs";
import path3 from "path";
function copyDirectoryRecursive(src, dest, overwrite = true) {
  const copied = [];
  if (!fs2.existsSync(src)) {
    return copied;
  }
  if (!fs2.existsSync(dest)) {
    fs2.mkdirSync(dest, { recursive: true });
  }
  const entries = fs2.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path3.join(src, entry.name);
    const destPath = path3.join(dest, entry.name);
    if (entry.isDirectory()) {
      copied.push(...copyDirectoryRecursive(srcPath, destPath, overwrite));
    } else {
      if (!fs2.existsSync(destPath) || overwrite) {
        fs2.copyFileSync(srcPath, destPath);
        copied.push(destPath);
      }
    }
  }
  return copied;
}
function injectSkills(options) {
  const cwd = options.cwd || process.cwd();
  const templatesDir = getTemplatesDir();
  const skillSrc = path3.join(templatesDir, "skills", "scout-product-requirement");
  const results = {
    claude: [],
    opencode: []
  };
  for (const agent of options.agents) {
    let targetSkillDir = "";
    if (agent === "claude") {
      targetSkillDir = path3.join(cwd, ".claude", "skills", "scout-product-requirement");
    } else if (agent === "opencode") {
      targetSkillDir = path3.join(cwd, ".opencode", "skills", "scout-product-requirement");
    }
    if (targetSkillDir) {
      const files = copyDirectoryRecursive(skillSrc, targetSkillDir, options.overwrite ?? true);
      results[agent] = files.map((f) => path3.relative(cwd, f));
    }
  }
  return { injected: results };
}

// src/cli/commands/init.ts
async function runInit(options = {}) {
  const cwd = options.cwd || process.cwd();
  const isNonInteractive = Boolean(options.yes);
  const scoutspecDir = path4.join(cwd, "scoutspec");
  if (!isNonInteractive) {
    p.intro(pc.bgCyan(pc.black(" scoutspec init ")));
  }
  let conflictStrategy = "overwrite";
  if (fs3.existsSync(scoutspecDir)) {
    if (isNonInteractive) {
      conflictStrategy = "merge";
    } else {
      const conflictAction = await p.select({
        message: `Existing ${pc.bold("scoutspec/")} directory detected. How would you like to proceed?`,
        options: [
          { value: "merge", label: "Merge", hint: "Keep existing files and add missing scaffolding" },
          { value: "overwrite", label: "Overwrite", hint: "Replace template files with new setup" },
          { value: "abort", label: "Cancel", hint: "Exit initialization without changes" }
        ],
        initialValue: "merge"
      });
      if (p.isCancel(conflictAction) || conflictAction === "abort") {
        p.cancel("Initialization cancelled.");
        process.exit(0);
      }
      conflictStrategy = conflictAction;
    }
  }
  let selectedAgents = ["claude", "opencode"];
  if (options.agents) {
    selectedAgents = options.agents.split(",").map((a) => a.trim().toLowerCase()).filter((a) => a === "claude" || a === "opencode");
  } else if (!isNonInteractive) {
    const agentChoices = await p.multiselect({
      message: "Select AI agent harnesses to install Scoutspec skills into:",
      options: [
        { value: "claude", label: "Claude Code (.claude/skills/)", hint: "Anthropic Claude Code CLI" },
        { value: "opencode", label: "OpenCode (.opencode/skills/)", hint: "OpenCode agent" }
      ],
      initialValues: ["claude", "opencode"],
      required: false
    });
    if (p.isCancel(agentChoices)) {
      p.cancel("Initialization cancelled.");
      process.exit(0);
    }
    selectedAgents = agentChoices;
  }
  let contextAnswers = {};
  if (!isNonInteractive) {
    const configureContext = await p.confirm({
      message: "Would you like to seed initial business context and project knowledge interactively?",
      initialValue: true
    });
    if (p.isCancel(configureContext)) {
      p.cancel("Initialization cancelled.");
      process.exit(0);
    }
    if (configureContext) {
      const business = await p.text({
        message: "Business Context & Goals (e.g. target market, core value prop):",
        placeholder: "Autonomous specification intelligence for AI coding agents..."
      });
      if (p.isCancel(business)) {
        p.cancel("Initialization cancelled.");
        process.exit(0);
      }
      if (business) contextAnswers.businessContext = business;
      const tech = await p.text({
        message: "Team & Technical Constraints (e.g. stack, language, architecture):",
        placeholder: "TypeScript, Node.js >= 18, spec-driven development..."
      });
      if (p.isCancel(tech)) {
        p.cancel("Initialization cancelled.");
        process.exit(0);
      }
      if (tech) contextAnswers.technicalConstraints = tech;
      const competitors = await p.text({
        message: "Competitors & Reference Benchmarks (optional):",
        placeholder: "OpenSpec, BMAD-METHOD, Aider..."
      });
      if (p.isCancel(competitors)) {
        p.cancel("Initialization cancelled.");
        process.exit(0);
      }
      if (competitors) contextAnswers.competitorKnowledge = competitors;
      const personas = await p.text({
        message: "Customer Personas & Primary Use Cases (optional):",
        placeholder: "Product engineers, autonomous agents executing specs..."
      });
      if (p.isCancel(personas)) {
        p.cancel("Initialization cancelled.");
        process.exit(0);
      }
      if (personas) contextAnswers.customerPersonas = personas;
    }
  }
  const spinner2 = isNonInteractive ? null : p.spinner();
  if (spinner2) spinner2.start("Scaffolding Scoutspec repository and injecting skills...");
  const scaffoldRes = scaffoldScoutspecDirectory({
    cwd,
    contextAnswers,
    conflictStrategy
  });
  const injectRes = injectSkills({
    cwd,
    agents: selectedAgents,
    overwrite: conflictStrategy === "overwrite"
  });
  if (spinner2) spinner2.stop("Scoutspec initialization complete!");
  if (!isNonInteractive) {
    const summaryLines = [];
    if (scaffoldRes.created.length > 0) {
      summaryLines.push(pc.green(`\u2714 Created ${scaffoldRes.created.join(", ")}`));
    }
    if (scaffoldRes.skipped.length > 0) {
      summaryLines.push(pc.dim(`- Kept existing ${scaffoldRes.skipped.join(", ")}`));
    }
    for (const [agent, files] of Object.entries(injectRes.injected)) {
      if (files.length > 0) {
        summaryLines.push(pc.green(`\u2714 Injected skills into .${agent}/skills/`));
      }
    }
    p.note(
      summaryLines.join("\n") + "\n\n" + pc.bold("Next steps:") + `
  Run ${pc.cyan("/scout:product-requirement <prompt>")} in Claude Code or OpenCode to start autonomous requirements discovery.`,
      "Initialization Summary"
    );
    p.outro(pc.green("Happy hacking with Scoutspec!"));
  } else {
    console.log(pc.green("Scoutspec initialized successfully."));
  }
}

// src/cli/index.ts
var program = new Command();
program.name("scoutspec").description("Autonomous, spec-driven PDLC & SDLC intelligence harness for AI agents").version("0.1.0");
program.command("init").description("Initialize Scoutspec repository and inject agent skills").option("-y, --yes", "Non-interactive mode, skip prompts with defaults", false).option("--agents <agents>", "Comma-separated list of target agent harnesses (e.g. claude,opencode)").action(async (options) => {
  try {
    await runInit(options);
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
});
program.parse();
//# sourceMappingURL=index.js.map