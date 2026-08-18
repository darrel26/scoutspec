import { Command } from "commander";
import { runInit } from "./commands/init.js";

const program = new Command();

program
  .name("scoutspec")
  .description("Autonomous, spec-driven PDLC & SDLC intelligence harness for AI agents")
  .version("0.1.0");

program
  .command("init")
  .description("Initialize Scoutspec repository and inject agent skills")
  .option("-y, --yes", "Non-interactive mode, skip prompts with defaults", false)
  .option("--agents <agents>", "Comma-separated list of target agent harnesses (e.g. claude,opencode)")
  .action(async (options) => {
    try {
      await runInit(options);
    } catch (err: unknown) {
      console.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

program.parse();
