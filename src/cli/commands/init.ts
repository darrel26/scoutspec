import fs from "node:fs";
import path from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import {
  scaffoldScoutspecDirectory,
  ContextAnswers,
  ScaffoldOptions,
} from "../../core/scaffold.js";
import {
  injectSkills,
  AgentHarness,
} from "../../core/inject-skills.js";

export interface InitCommandOptions {
  yes?: boolean;
  agents?: string;
  cwd?: string;
}

export async function runInit(options: InitCommandOptions = {}): Promise<void> {
  const cwd = options.cwd || process.cwd();
  const isNonInteractive = Boolean(options.yes);
  const scoutspecDir = path.join(cwd, "scoutspec");

  if (!isNonInteractive) {
    p.intro(pc.bgCyan(pc.black(" scoutspec init ")));
  }

  // 1. Conflict Check
  let conflictStrategy: "overwrite" | "merge" | "abort" = "overwrite";
  if (fs.existsSync(scoutspecDir)) {
    if (isNonInteractive) {
      conflictStrategy = "merge";
    } else {
      const conflictAction = await p.select({
        message: `Existing ${pc.bold("scoutspec/")} directory detected. How would you like to proceed?`,
        options: [
          { value: "merge", label: "Merge", hint: "Keep existing files and add missing scaffolding" },
          { value: "overwrite", label: "Overwrite", hint: "Replace template files with new setup" },
          { value: "abort", label: "Cancel", hint: "Exit initialization without changes" },
        ],
        initialValue: "merge",
      });

      if (p.isCancel(conflictAction) || conflictAction === "abort") {
        p.cancel("Initialization cancelled.");
        process.exit(0);
      }

      conflictStrategy = conflictAction as "overwrite" | "merge" | "abort";
    }
  }

  // 2. Select Agent Harnesses
  let selectedAgents: AgentHarness[] = ["claude", "opencode"];
  if (options.agents) {
    selectedAgents = options.agents
      .split(",")
      .map((a) => a.trim().toLowerCase())
      .filter((a): a is AgentHarness => a === "claude" || a === "opencode");
  } else if (!isNonInteractive) {
    const agentChoices = await p.multiselect({
      message: "Select AI agent harnesses to install Scoutspec skills into:",
      options: [
        { value: "claude", label: "Claude Code (.claude/skills/)", hint: "Anthropic Claude Code CLI" },
        { value: "opencode", label: "OpenCode (.opencode/skills/)", hint: "OpenCode agent" },
      ],
      initialValues: ["claude", "opencode"],
      required: false,
    });

    if (p.isCancel(agentChoices)) {
      p.cancel("Initialization cancelled.");
      process.exit(0);
    }

    selectedAgents = agentChoices as AgentHarness[];
  }

  // 3. Business Context Configuration
  let contextAnswers: ContextAnswers = {};
  if (!isNonInteractive) {
    const configureContext = await p.confirm({
      message: "Would you like to seed initial business context and project knowledge interactively?",
      initialValue: true,
    });

    if (p.isCancel(configureContext)) {
      p.cancel("Initialization cancelled.");
      process.exit(0);
    }

    if (configureContext) {
      const business = await p.text({
        message: "Business Context & Goals (e.g. target market, core value prop):",
        placeholder: "Autonomous specification intelligence for AI coding agents...",
      });
      if (p.isCancel(business)) {
        p.cancel("Initialization cancelled.");
        process.exit(0);
      }
      if (business) contextAnswers.businessContext = business;

      const tech = await p.text({
        message: "Team & Technical Constraints (e.g. stack, language, architecture):",
        placeholder: "TypeScript, Node.js >= 18, spec-driven development...",
      });
      if (p.isCancel(tech)) {
        p.cancel("Initialization cancelled.");
        process.exit(0);
      }
      if (tech) contextAnswers.technicalConstraints = tech;

      const competitors = await p.text({
        message: "Competitors & Reference Benchmarks (optional):",
        placeholder: "OpenSpec, BMAD-METHOD, Aider...",
      });
      if (p.isCancel(competitors)) {
        p.cancel("Initialization cancelled.");
        process.exit(0);
      }
      if (competitors) contextAnswers.competitorKnowledge = competitors;

      const personas = await p.text({
        message: "Customer Personas & Primary Use Cases (optional):",
        placeholder: "Product engineers, autonomous agents executing specs...",
      });
      if (p.isCancel(personas)) {
        p.cancel("Initialization cancelled.");
        process.exit(0);
      }
      if (personas) contextAnswers.customerPersonas = personas;
    }
  }

  // 4. Execute Scaffolding
  const spinner = isNonInteractive ? null : p.spinner();
  if (spinner) spinner.start("Scaffolding Scoutspec repository and injecting skills...");

  const scaffoldRes = scaffoldScoutspecDirectory({
    cwd,
    contextAnswers,
    conflictStrategy,
  });

  const injectRes = injectSkills({
    cwd,
    agents: selectedAgents,
    overwrite: conflictStrategy === "overwrite",
  });

  if (spinner) spinner.stop("Scoutspec initialization complete!");

  // 5. Summary / Outro
  if (!isNonInteractive) {
    const summaryLines: string[] = [];
    if (scaffoldRes.created.length > 0) {
      summaryLines.push(pc.green(`✔ Created ${scaffoldRes.created.join(", ")}`));
    }
    if (scaffoldRes.skipped.length > 0) {
      summaryLines.push(pc.dim(`- Kept existing ${scaffoldRes.skipped.join(", ")}`));
    }

    for (const [agent, files] of Object.entries(injectRes.injected)) {
      if (files.length > 0) {
        summaryLines.push(pc.green(`✔ Injected skills into .${agent}/skills/`));
      }
    }

    p.note(
      summaryLines.join("\n") +
        "\n\n" +
        pc.bold("Next steps:") +
        `\n  Run ${pc.cyan("/scout:product-requirement <prompt>")} in Claude Code or OpenCode to start autonomous requirements discovery.`,
      "Initialization Summary"
    );

    p.outro(pc.green("Happy hacking with Scoutspec!"));
  } else {
    console.log(pc.green("Scoutspec initialized successfully."));
  }
}
