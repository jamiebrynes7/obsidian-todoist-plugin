import pc from "picocolors";

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import * as readline from "node:readline";

const REPO_ROOT = join(import.meta.dirname, "..", "..");

const MS_PER_SECOND = 1000;
const POLL_INTERVAL_MS = 10 * MS_PER_SECOND;

function exec(command: string, options?: { cwd?: string; silent?: boolean }): string {
  const showOutput = !options?.silent;

  if (showOutput) {
    console.log(pc.dim(`$ ${command}`));
  }

  try {
    const output = execSync(command, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      cwd: options?.cwd ?? REPO_ROOT,
    }).trim();

    if (showOutput && output) {
      // Indent and dim the output
      const indented = output
        .split("\n")
        .map((line) => pc.dim(`  ${line}`))
        .join("\n");
      console.log(indented);
    }

    return output;
  } catch (error) {
    const stderr = (error as { stderr?: string }).stderr ?? "";
    if (stderr) {
      console.error(pc.dim(`  ${stderr.trim()}`));
    }
    throw new Error(`Command failed: ${command}`);
  }
}

function logStarted(message: string): void {
  console.log(pc.cyan(`→ ${message}`));
}

function logCompleted(message: string): void {
  console.log(pc.green(`✓ ${message}`));
}

function error(message: string): never {
  console.error(pc.red(`✗ ${message}`));
  process.exit(1);
}

async function confirm(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(pc.yellow(`? ${message} (y/N) `), (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
}

async function pollUntil(
  check: () => boolean | Promise<boolean>,
  options: {
    timeoutMs: number;
    intervalMs: number;
  },
): Promise<void> {
  const startTime = Date.now();
  let attempts = 0;

  while (true) {
    attempts++;
    const elapsed = Math.floor((Date.now() - startTime) / MS_PER_SECOND);

    const result = await check();
    if (result) {
      return;
    }

    if (Date.now() - startTime > options.timeoutMs) {
      error(`Timed out after ${Math.floor(options.timeoutMs / MS_PER_SECOND)}s`);
    }

    console.log(pc.dim(`  Still waiting after ${attempts} checks... (${elapsed}s elapsed)`));
    await new Promise((resolve) => setTimeout(resolve, options.intervalMs));
  }
}

function validateVersion(version: string): void {
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    error(`Invalid version format: ${version}. Expected format: x.y.z`);
  }
}

function checkPrerequisites(): void {
  logStarted("Checking prerequisites...");

  // Check for gh CLI
  try {
    exec("which gh");
  } catch {
    error("gh CLI not found. Install it from https://cli.github.com/");
  }

  // Check git status
  const status = exec("git status --porcelain");
  const currentBranch = exec("git branch --show-current");

  if (currentBranch !== "master" && status.length > 0) {
    error("Cannot switch branches with uncommitted changes. Please commit or stash your changes.");
  }

  logCompleted("Prerequisites checked");
}

function ensureOnMaster(): void {
  const currentBranch = exec("git branch --show-current");

  if (currentBranch !== "master") {
    logStarted("Switching to master branch...");
    exec("git checkout master");
    logCompleted("Switched to master");
  }

  logStarted("Pulling latest master...");
  exec("git pull origin master");
  logCompleted("Pulled latest master");
}

function createReleaseBranch(version: string): void {
  const branchName = `chore/prepare-release-${version}`;
  logStarted(`Creating branch ${branchName}...`);
  exec(`git checkout -b ${branchName}`);
  logCompleted(`Created branch ${branchName}`);
}

function updateChangelog(version: string): void {
  logStarted("Updating changelog...");
  const changelogPath = join(REPO_ROOT, "docs", "docs", "changelog.md");
  const changelog = readFileSync(changelogPath, "utf-8");

  // Find the "Unreleased" section and replace with version + date
  const today = new Date().toISOString().split("T")[0];
  const updated = changelog.replace(/## Unreleased/, `## v${version} (${today})`);

  if (updated === changelog) {
    error(
      'Could not find "## Unreleased" section in changelog.md. Please ensure changelog has an Unreleased section.',
    );
  }

  writeFileSync(changelogPath, updated);
  logCompleted("Updated changelog with version and date");
}

function bumpDocsVersion(version: string): void {
  logStarted("Creating versioned documentation...");
  exec(`npm run bump-version -- ${version}`, { cwd: join(REPO_ROOT, "docs") });
  logCompleted("Created versioned documentation");
}

function updateVersionFiles(version: string): void {
  logStarted("Updating version files...");

  // Update manifest.json
  const manifestPath = join(REPO_ROOT, "manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
  manifest.version = version;
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  // Update plugin/package.json
  const packagePath = join(REPO_ROOT, "plugin", "package.json");
  const packageJson = JSON.parse(readFileSync(packagePath, "utf-8"));
  packageJson.version = version;
  writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

  // Update manifest.minAppVersion with the obsidian version from plugin/package.json
  const obsidianVersion = packageJson.dependencies?.obsidian;
  if (obsidianVersion) {
    manifest.minAppVersion = obsidianVersion;
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  }

  // Update versions.json
  const versionsPath = join(REPO_ROOT, "versions.json");
  const versions = JSON.parse(readFileSync(versionsPath, "utf-8"));
  const minAppVersion = manifest.minAppVersion;
  versions[version] = minAppVersion;

  // Re-sort versions in descending order
  const sortedVersions = Object.fromEntries(
    Object.entries(versions).sort(([a], [b]) => {
      const [aMajor, aMinor, aPatch] = a.split(".").map(Number);
      const [bMajor, bMinor, bPatch] = b.split(".").map(Number);

      if (aMajor !== bMajor) {
        return bMajor - aMajor;
      }
      if (aMinor !== bMinor) {
        return bMinor - aMinor;
      }
      return bPatch - aPatch;
    }),
  );

  writeFileSync(versionsPath, `${JSON.stringify(sortedVersions, null, 2)}\n`);
  logCompleted("Updated version files");

  logStarted("Running npm install to update package-lock.json...");
  exec("npm install", { cwd: REPO_ROOT });
  logCompleted("Updated package-lock.json");
}

function createAndPushPR(version: string): string {
  logStarted("Committing changes...");
  exec("git add .");
  exec(`git commit -m "chore: prepare release ${version}"`);
  logCompleted("Committed changes");

  logStarted("Pushing branch...");
  const branchName = `chore/prepare-release-${version}`;
  exec(`git push -u origin ${branchName}`);
  logCompleted("Pushed branch");

  logStarted("Creating pull request...");
  const prUrl = exec(
    `gh pr create --title "chore: prepare release ${version}" --body "Automated release preparation for version ${version}"`,
  );
  logCompleted(`Created pull request: ${prUrl}`);
  return prUrl;
}

async function waitForChecksAndMerge(prUrl: string): Promise<void> {
  const prNumber = prUrl.split("/").pop();

  console.log();
  console.log(pc.bold("Please review the pull request before proceeding:"));
  console.log(pc.cyan(`  ${prUrl}`));
  console.log();

  const confirmed = await confirm("Enable auto-merge and continue with the release?");
  if (!confirmed) {
    error("Release cancelled by user");
  }

  logStarted("Enabling auto-merge...");
  exec(`gh pr merge ${prNumber} --rebase --auto --delete-branch`);
  logCompleted("Auto-merge enabled");

  // Wait for checks to pass and merge to complete
  logStarted("Waiting for checks to pass and merge to complete...");
  const timeoutMinutes = 30;
  const prMergeTimeoutMs = timeoutMinutes * 60 * MS_PER_SECOND;
  await pollUntil(
    () => {
      const state = exec(`gh pr view ${prNumber} --json state -q '.state'`, { silent: true });
      return state === "MERGED";
    },
    {
      timeoutMs: prMergeTimeoutMs,
      intervalMs: POLL_INTERVAL_MS,
    },
  );
  logCompleted("PR merged successfully!");
}

function pullLatestMaster(): void {
  logStarted("Pulling latest master...");
  exec("git checkout master");
  exec("git pull origin master");
  logCompleted("Pulled latest master");
}

function createAndPushTag(version: string): void {
  logStarted(`Creating tag ${version}...`);
  exec(`git tag -a ${version} -m "Release ${version}"`);
  logCompleted(`Created tag ${version}`);

  logStarted("Pushing tag...");
  exec(`git push origin ${version}`);
  logCompleted("Pushed tag");
}

async function waitForReleaseBuild(version: string): Promise<void> {
  logStarted("Waiting for release build to complete...");

  const timeoutMinutes = 20;
  const buildTimeoutMs = timeoutMinutes * 60 * MS_PER_SECOND;
  // Poll for the workflow run
  await pollUntil(
    () => {
      const runs = exec(
        `gh run list --workflow=release.yml --json databaseId,status,conclusion,headBranch -L 5`,
        { silent: true },
      );
      const runList = JSON.parse(runs) as Array<{
        databaseId: number;
        status: string;
        conclusion: string | null;
        headBranch: string;
      }>;

      // Find run for our tag
      const run = runList.find((r) => r.headBranch === version);

      if (!run) {
        // Still waiting for workflow to start
        return false;
      }

      if (run.status === "completed") {
        if (run.conclusion === "success") {
          return true;
        }
        error(`Release build failed with conclusion: ${run.conclusion}`);
      }

      // Still running
      return false;
    },
    {
      timeoutMs: buildTimeoutMs,
      intervalMs: POLL_INTERVAL_MS,
    },
  );
  logCompleted("Release build completed successfully!");
}

function extractChangelogContent(version: string): string {
  const changelogPath = join(REPO_ROOT, "docs", "docs", "changelog.md");
  const changelog = readFileSync(changelogPath, "utf-8");

  // Find the section for this version
  const versionRegex = new RegExp(
    `## v${version.replace(/\./g, "\\.")} \\([^)]+\\)([\\s\\S]*?)(?=## v|$)`,
  );
  const match = changelog.match(versionRegex);

  if (!match) {
    error(`Could not find changelog content for version ${version}`);
  }

  return match[1].trim();
}

async function updateAndPublishRelease(version: string): Promise<void> {
  const changelogContent = extractChangelogContent(version);

  logStarted("Waiting for draft release to appear...");
  const timeoutMinutes = 5;

  await pollUntil(
    () => {
      const releases = exec(`gh release list --json tagName,isDraft,name -L 10`, { silent: true });
      const releaseList = JSON.parse(releases) as Array<{
        tagName: string;
        isDraft: boolean;
        name: string;
      }>;

      const draftRelease = releaseList.find((r) => r.isDraft && r.tagName.includes(version));
      return draftRelease !== undefined;
    },
    {
      timeoutMs: timeoutMinutes * 60 * MS_PER_SECOND,
      intervalMs: POLL_INTERVAL_MS,
    },
  );

  logCompleted("Draft release found");

  logStarted("Publishing release...");
  exec(
    `gh release edit ${version} --title "Sync with Todoist Plugin - v${version}" --notes ${JSON.stringify(changelogContent)} --draft=false`,
  );

  logCompleted(`Release v${version} published successfully! 🎉`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    error("Usage: npm run release -- <version>");
  }

  if (args.length > 1) {
    error(`Expected exactly 1 argument, got ${args.length}. Usage: npm run release -- <version>`);
  }

  const version = args[0];
  validateVersion(version);

  logStarted(`Starting release process for version ${version}...`);

  checkPrerequisites();
  ensureOnMaster();
  createReleaseBranch(version);
  updateChangelog(version);
  bumpDocsVersion(version);
  updateVersionFiles(version);
  const prUrl = createAndPushPR(version);
  await waitForChecksAndMerge(prUrl);
  pullLatestMaster();
  createAndPushTag(version);
  await waitForReleaseBuild(version);
  await updateAndPublishRelease(version);

  logCompleted(`Release process for version ${version} completed successfully!`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
