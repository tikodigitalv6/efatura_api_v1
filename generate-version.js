const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function safeExec(cmd, fallback) {
    try { return execSync(cmd, { stdio: ["pipe", "pipe", "pipe"] }).toString().trim(); }
    catch { return fallback; }
}

const commit = safeExec("git rev-parse HEAD", "unknown");
const data = {
    commit: commit,
    commit_short: commit.substring(0, 7),
    commit_date: safeExec("git log -1 --format=%cI", "unknown"),
    commit_message: safeExec("git log -1 --format=%s", "unknown"),
    build_date: new Date().toISOString(),
    branch: safeExec("git rev-parse --abbrev-ref HEAD", "unknown"),
};

const buildDir = path.join(__dirname, "build");
if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir, { recursive: true });
fs.writeFileSync(path.join(buildDir, "version.json"), JSON.stringify(data, null, 2));
console.log("[version] yazildi:", data.commit_short, "-", data.commit_message);
