interface ContextAnswers {
    businessContext?: string;
    technicalConstraints?: string;
    competitorKnowledge?: string;
    customerPersonas?: string;
}
interface ScaffoldOptions {
    cwd?: string;
    contextAnswers?: ContextAnswers;
    conflictStrategy?: "overwrite" | "merge" | "abort";
}
declare function getTemplatesDir(): string;
declare function renderContextTemplate(templateContent: string, answers?: ContextAnswers): string;
declare function scaffoldScoutspecDirectory(options?: ScaffoldOptions): {
    created: string[];
    skipped: string[];
};

type AgentHarness = "claude" | "opencode";
interface InjectSkillsOptions {
    cwd?: string;
    agents: AgentHarness[];
    overwrite?: boolean;
}
declare function copyDirectoryRecursive(src: string, dest: string, overwrite?: boolean): string[];
declare function injectSkills(options: InjectSkillsOptions): {
    injected: Record<AgentHarness, string[]>;
};

interface InitCommandOptions {
    yes?: boolean;
    agents?: string;
    cwd?: string;
}
declare function runInit(options?: InitCommandOptions): Promise<void>;

export { type AgentHarness, type ContextAnswers, type InitCommandOptions, type InjectSkillsOptions, type ScaffoldOptions, copyDirectoryRecursive, getTemplatesDir, injectSkills, renderContextTemplate, runInit, scaffoldScoutspecDirectory };
