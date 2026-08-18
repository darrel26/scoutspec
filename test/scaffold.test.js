import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { scaffoldScoutspecDirectory, renderContextTemplate } from "../dist/index.js";
import { injectSkills } from "../dist/index.js";

describe("Scoutspec Scaffolding Engine", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "scoutspec-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("renders template with context answers", () => {
    const raw = "Business:\n{{BUSINESS_CONTEXT}}\nTech:\n{{TECHNICAL_CONSTRAINTS}}\n";
    const rendered = renderContextTemplate(raw, {
      businessContext: "B2B SaaS",
      technicalConstraints: "Node.js",
    });
    assert.match(rendered, /B2B SaaS/);
    assert.match(rendered, /Node.js/);
  });

  it("scaffolds scoutspec folder hierarchy", () => {
    const res = scaffoldScoutspecDirectory({
      cwd: tmpDir,
      contextAnswers: {
        businessContext: "AI spec system",
      },
    });

    assert.equal(fs.existsSync(path.join(tmpDir, "scoutspec", "context.md")), true);
    assert.equal(fs.existsSync(path.join(tmpDir, "scoutspec", "index.yaml")), true);
    assert.equal(fs.existsSync(path.join(tmpDir, "scoutspec", "specs")), true);
    assert.equal(fs.existsSync(path.join(tmpDir, "scoutspec", "requirements")), true);
    assert.equal(res.created.length > 0, true);
  });

  it("injects skills into target agent harnesses", () => {
    const res = injectSkills({
      cwd: tmpDir,
      agents: ["claude", "opencode"],
    });

    assert.equal(
      fs.existsSync(path.join(tmpDir, ".claude", "skills", "scout-product-requirement", "SKILL.md")),
      true
    );
    assert.equal(
      fs.existsSync(path.join(tmpDir, ".opencode", "skills", "scout-product-requirement", "SKILL.md")),
      true
    );
    assert.equal(res.injected.claude.length > 0, true);
    assert.equal(res.injected.opencode.length > 0, true);
  });
});
