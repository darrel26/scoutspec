"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  copyDirectoryRecursive: () => copyDirectoryRecursive,
  getTemplatesDir: () => getTemplatesDir,
  injectSkills: () => injectSkills,
  renderContextTemplate: () => renderContextTemplate,
  runInit: () => runInit,
  scaffoldScoutspecDirectory: () => scaffoldScoutspecDirectory
});
module.exports = __toCommonJS(index_exports);

// src/core/scaffold.ts
var import_node_fs = __toESM(require("fs"), 1);
var import_node_path = __toESM(require("path"), 1);
function getTemplatesDir() {
  const candidates = [
    import_node_path.default.resolve(process.cwd(), "templates"),
    import_node_path.default.resolve(__dirname, "../templates"),
    import_node_path.default.resolve(__dirname, "../../templates"),
    import_node_path.default.resolve(__dirname, "../../../templates")
  ];
  for (const p2 of candidates) {
    if (import_node_fs.default.existsSync(p2)) {
      return p2;
    }
  }
  return import_node_path.default.resolve(process.cwd(), "templates");
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
  const scoutspecDir = import_node_path.default.join(cwd, "scoutspec");
  const templatesDir = getTemplatesDir();
  const created = [];
  const skipped = [];
  const dirsToCreate = [
    scoutspecDir,
    import_node_path.default.join(scoutspecDir, "specs"),
    import_node_path.default.join(scoutspecDir, "requirements")
  ];
  for (const dir of dirsToCreate) {
    if (!import_node_fs.default.existsSync(dir)) {
      import_node_fs.default.mkdirSync(dir, { recursive: true });
      created.push(import_node_path.default.relative(cwd, dir));
    }
  }
  const contextDest = import_node_path.default.join(scoutspecDir, "context.md");
  const contextTemplatePath = import_node_path.default.join(templatesDir, "scoutspec", "context.md");
  let templateContent = "";
  if (import_node_fs.default.existsSync(contextTemplatePath)) {
    templateContent = import_node_fs.default.readFileSync(contextTemplatePath, "utf8");
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
  if (!import_node_fs.default.existsSync(contextDest) || options.conflictStrategy === "overwrite") {
    import_node_fs.default.writeFileSync(contextDest, renderedContext, "utf8");
    created.push(import_node_path.default.relative(cwd, contextDest));
  } else {
    skipped.push(import_node_path.default.relative(cwd, contextDest));
  }
  const indexDest = import_node_path.default.join(scoutspecDir, "index.yaml");
  const indexTemplatePath = import_node_path.default.join(templatesDir, "scoutspec", "index.yaml");
  let indexContent = "version: 1\nrequirements: []\n";
  if (import_node_fs.default.existsSync(indexTemplatePath)) {
    indexContent = import_node_fs.default.readFileSync(indexTemplatePath, "utf8");
  }
  if (!import_node_fs.default.existsSync(indexDest) || options.conflictStrategy === "overwrite") {
    import_node_fs.default.writeFileSync(indexDest, indexContent, "utf8");
    created.push(import_node_path.default.relative(cwd, indexDest));
  } else {
    skipped.push(import_node_path.default.relative(cwd, indexDest));
  }
  return { created, skipped };
}

// src/core/inject-skills.ts
var import_node_fs2 = __toESM(require("fs"), 1);
var import_node_path2 = __toESM(require("path"), 1);
function copyDirectoryRecursive(src, dest, overwrite = true) {
  const copied = [];
  if (!import_node_fs2.default.existsSync(src)) {
    return copied;
  }
  if (!import_node_fs2.default.existsSync(dest)) {
    import_node_fs2.default.mkdirSync(dest, { recursive: true });
  }
  const entries = import_node_fs2.default.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = import_node_path2.default.join(src, entry.name);
    const destPath = import_node_path2.default.join(dest, entry.name);
    if (entry.isDirectory()) {
      copied.push(...copyDirectoryRecursive(srcPath, destPath, overwrite));
    } else {
      if (!import_node_fs2.default.existsSync(destPath) || overwrite) {
        import_node_fs2.default.copyFileSync(srcPath, destPath);
        copied.push(destPath);
      }
    }
  }
  return copied;
}
function injectSkills(options) {
  const cwd = options.cwd || process.cwd();
  const templatesDir = getTemplatesDir();
  const skillSrc = import_node_path2.default.join(templatesDir, "skills", "scout-product-requirement");
  const results = {
    claude: [],
    opencode: []
  };
  for (const agent of options.agents) {
    let targetSkillDir = "";
    if (agent === "claude") {
      targetSkillDir = import_node_path2.default.join(cwd, ".claude", "skills", "scout-product-requirement");
    } else if (agent === "opencode") {
      targetSkillDir = import_node_path2.default.join(cwd, ".opencode", "skills", "scout-product-requirement");
    }
    if (targetSkillDir) {
      const files = copyDirectoryRecursive(skillSrc, targetSkillDir, options.overwrite ?? true);
      results[agent] = files.map((f) => import_node_path2.default.relative(cwd, f));
    }
  }
  return { injected: results };
}

// src/cli/commands/init.ts
var import_node_fs3 = __toESM(require("fs"), 1);
var import_node_path3 = __toESM(require("path"), 1);
var p = __toESM(require("@clack/prompts"), 1);
var import_picocolors = __toESM(require("picocolors"), 1);
async function runInit(options = {}) {
  const cwd = options.cwd || process.cwd();
  const isNonInteractive = Boolean(options.yes);
  const scoutspecDir = import_node_path3.default.join(cwd, "scoutspec");
  if (!isNonInteractive) {
    p.intro(import_picocolors.default.bgCyan(import_picocolors.default.black(" scoutspec init ")));
  }
  let conflictStrategy = "overwrite";
  if (import_node_fs3.default.existsSync(scoutspecDir)) {
    if (isNonInteractive) {
      conflictStrategy = "merge";
    } else {
      const conflictAction = await p.select({
        message: `Existing ${import_picocolors.default.bold("scoutspec/")} directory detected. How would you like to proceed?`,
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
      summaryLines.push(import_picocolors.default.green(`\u2714 Created ${scaffoldRes.created.join(", ")}`));
    }
    if (scaffoldRes.skipped.length > 0) {
      summaryLines.push(import_picocolors.default.dim(`- Kept existing ${scaffoldRes.skipped.join(", ")}`));
    }
    for (const [agent, files] of Object.entries(injectRes.injected)) {
      if (files.length > 0) {
        summaryLines.push(import_picocolors.default.green(`\u2714 Injected skills into .${agent}/skills/`));
      }
    }
    p.note(
      summaryLines.join("\n") + "\n\n" + import_picocolors.default.bold("Next steps:") + `
  Run ${import_picocolors.default.cyan("/scout:product-requirement <prompt>")} in Claude Code or OpenCode to start autonomous requirements discovery.`,
      "Initialization Summary"
    );
    p.outro(import_picocolors.default.green("Happy hacking with Scoutspec!"));
  } else {
    console.log(import_picocolors.default.green("Scoutspec initialized successfully."));
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  copyDirectoryRecursive,
  getTemplatesDir,
  injectSkills,
  renderContextTemplate,
  runInit,
  scaffoldScoutspecDirectory
});
//# sourceMappingURL=index.cjs.map