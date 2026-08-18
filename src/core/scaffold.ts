import fs from "node:fs";
import path from "node:path";

export interface ContextAnswers {
  businessContext?: string;
  technicalConstraints?: string;
  competitorKnowledge?: string;
  customerPersonas?: string;
}

export interface ScaffoldOptions {
  cwd?: string;
  contextAnswers?: ContextAnswers;
  conflictStrategy?: "overwrite" | "merge" | "abort";
}

export function getTemplatesDir(): string {
  // Check common locations relative to runtime cwd or module package root
  const candidates = [
    path.resolve(process.cwd(), "templates"),
    path.resolve(__dirname, "../templates"),
    path.resolve(__dirname, "../../templates"),
    path.resolve(__dirname, "../../../templates"),
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  return path.resolve(process.cwd(), "templates");
}

export function renderContextTemplate(
  templateContent: string,
  answers?: ContextAnswers
): string {
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

export function scaffoldScoutspecDirectory(options: ScaffoldOptions = {}): {
  created: string[];
  skipped: string[];
} {
  const cwd = options.cwd || process.cwd();
  const scoutspecDir = path.join(cwd, "scoutspec");
  const templatesDir = getTemplatesDir();

  const created: string[] = [];
  const skipped: string[] = [];

  const dirsToCreate = [
    scoutspecDir,
    path.join(scoutspecDir, "specs"),
    path.join(scoutspecDir, "requirements"),
  ];

  for (const dir of dirsToCreate) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      created.push(path.relative(cwd, dir));
    }
  }

  // Handle context.md
  const contextDest = path.join(scoutspecDir, "context.md");
  const contextTemplatePath = path.join(templatesDir, "scoutspec", "context.md");
  let templateContent = "";
  if (fs.existsSync(contextTemplatePath)) {
    templateContent = fs.readFileSync(contextTemplatePath, "utf8");
  } else {
    templateContent = `# Project Context & Persistent Knowledge Base\n\n## Business Context\n{{BUSINESS_CONTEXT}}\n\n## Team & Technical Constraints\n{{TECHNICAL_CONSTRAINTS}}\n\n## Competitor & Market Knowledge\n{{COMPETITOR_KNOWLEDGE}}\n\n## Customer Personas & Workflows\n{{CUSTOMER_PERSONAS}}\n`;
  }

  const renderedContext = renderContextTemplate(templateContent, options.contextAnswers);

  if (!fs.existsSync(contextDest) || options.conflictStrategy === "overwrite") {
    fs.writeFileSync(contextDest, renderedContext, "utf8");
    created.push(path.relative(cwd, contextDest));
  } else {
    skipped.push(path.relative(cwd, contextDest));
  }

  // Handle index.yaml
  const indexDest = path.join(scoutspecDir, "index.yaml");
  const indexTemplatePath = path.join(templatesDir, "scoutspec", "index.yaml");
  let indexContent = "version: 1\nrequirements: []\n";
  if (fs.existsSync(indexTemplatePath)) {
    indexContent = fs.readFileSync(indexTemplatePath, "utf8");
  }

  if (!fs.existsSync(indexDest) || options.conflictStrategy === "overwrite") {
    fs.writeFileSync(indexDest, indexContent, "utf8");
    created.push(path.relative(cwd, indexDest));
  } else {
    skipped.push(path.relative(cwd, indexDest));
  }

  return { created, skipped };
}
