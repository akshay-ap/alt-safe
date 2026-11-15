#!/usr/bin/env node
// PreToolUse hook: permission rules only match command prefixes, so any Bash
// command that references a .env file (or dumps the environment) is rejected here.
import { readFileSync } from "node:fs";

const ENV_FILE_PATTERN = /\.env/i;
const ENV_DUMP_PATTERN = /(^|[\s;&|()`$])(printenv|env|export\s+-p|set)(\s*($|[;&|)`]))/;

const input = JSON.parse(readFileSync(0, "utf8"));
const command = input?.tool_input?.command ?? "";

if (ENV_FILE_PATTERN.test(command) || ENV_DUMP_PATTERN.test(command)) {
  process.stderr.write(
    "Blocked by .claude/hooks/block-env-bash.mjs: Bash access to .env files or environment variables is not allowed.\n",
  );
  process.exit(2);
}

process.exit(0);
