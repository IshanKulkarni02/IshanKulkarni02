import fs from "node:fs/promises";
import path from "node:path";

const username = process.env.GITHUB_USERNAME || "IshanKulkarni02";
const token = process.env.GH_GRAPHQL_TOKEN || process.env.GITHUB_TOKEN;
const readmePath = process.env.README_PATH || "README.md";
const svgPath = process.env.STATS_SVG_PATH || "assets/github-stats.svg";
const firstGitHubYear = Number(process.env.FIRST_GITHUB_YEAR || "2008");
const now = new Date();
const currentYear = now.getUTCFullYear();

if (!token) {
  throw new Error("GITHUB_TOKEN is required.");
}

const query = `
  query($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        contributionCalendar {
          totalContributions
        }
      }
    }
  }
`;

async function fetchYear(year) {
  const from = `${year}-01-01T00:00:00Z`;
  const to =
    year === currentYear
      ? new Date().toISOString()
      : `${year}-12-31T23:59:59Z`;

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "profile-readme-contribution-updater",
    },
    body: JSON.stringify({
      query,
      variables: { username, from, to },
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join("; "));
  }

  const collection = payload.data?.user?.contributionsCollection;
  const totalContributions = collection?.contributionCalendar?.totalContributions;
  const totalCommits = collection?.totalCommitContributions;

  if (typeof totalContributions !== "number" || typeof totalCommits !== "number") {
    throw new Error(`Could not read contributions for ${username} in ${year}.`);
  }

  return {
    totalContributions,
    totalCommits,
  };
}

async function fetchCommitCount(from, to) {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "profile-readme-contribution-updater",
    },
    body: JSON.stringify({
      query,
      variables: { username, from, to },
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join("; "));
  }

  const totalCommits = payload.data?.user?.contributionsCollection?.totalCommitContributions;

  if (typeof totalCommits !== "number") {
    throw new Error(`Could not read commit count for ${username}.`);
  }

  return totalCommits;
}

function startOfUtcWeek(date) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = start.getUTCDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  start.setUTCDate(start.getUTCDate() - daysSinceMonday);
  return start;
}

const yearlyTotals = await Promise.all(
  Array.from({ length: currentYear - firstGitHubYear + 1 }, (_, index) =>
    fetchYear(firstGitHubYear + index),
  ),
);

const totalContributions = yearlyTotals.reduce(
  (sum, year) => sum + year.totalContributions,
  0,
);
const totalCommits = yearlyTotals.reduce((sum, year) => sum + year.totalCommits, 0);
const commitsThisWeek = await fetchCommitCount(startOfUtcWeek(now).toISOString(), now.toISOString());
const formatNumber = new Intl.NumberFormat("en-US").format;
const stats = [
  ["Total Contributions", formatNumber(totalContributions)],
  ["Commits This Week", formatNumber(commitsThisWeek)],
  ["Total Commits", formatNumber(totalCommits)],
];

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildStatsSvg(items) {
  const columns = items
    .map(([label, value], index) => {
      const x = 140 + index * 250;
      const divider =
        index === 0
          ? ""
          : `<line x1="${index * 250}" y1="34" x2="${index * 250}" y2="126" stroke="#30363d" stroke-width="1"/>`;

      return `${divider}
  <text x="${x}" y="63" text-anchor="middle" fill="#70a5fd" font-family="Segoe UI, Ubuntu, sans-serif" font-size="20" font-weight="700">${escapeXml(label)}</text>
  <text x="${x}" y="105" text-anchor="middle" fill="#38bdae" font-family="Segoe UI, Ubuntu, sans-serif" font-size="38" font-weight="700">${escapeXml(value)}</text>`;
    })
    .join("\n");

  return `<svg width="750" height="160" viewBox="0 0 750 160" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(username)} GitHub stats</title>
  <desc id="desc">Total contributions, commits this week, and total commits</desc>
  <rect x="0" y="0" width="750" height="160" rx="8" fill="#1a1b27"/>
  <rect x="0.5" y="0.5" width="749" height="159" rx="7.5" stroke="#30363d" stroke-opacity="0.35"/>
  ${columns}
</svg>
`;
}

const updatedBlock = `<!-- GITHUB-STATS:START -->
  <img src="assets/github-stats.svg" alt="GitHub contribution stats" />
  <!-- GITHUB-STATS:END -->`;

const readme = await fs.readFile(readmePath, "utf8");
const nextReadme = readme.replace(
  /<!-- GITHUB-STATS:START -->[\s\S]*?<!-- GITHUB-STATS:END -->/,
  updatedBlock,
);

await fs.mkdir(path.dirname(svgPath), { recursive: true });

const nextSvg = buildStatsSvg(stats);
const currentSvg = await fs.readFile(svgPath, "utf8").catch(() => "");
const readmeChanged = nextReadme !== readme;
const svgChanged = nextSvg !== currentSvg;

if (readmeChanged) {
  await fs.writeFile(readmePath, nextReadme);
}

if (svgChanged) {
  await fs.writeFile(svgPath, nextSvg);
}

if (readmeChanged || svgChanged) {
  console.log(
    `Updated stats for ${username}: ${totalContributions} contributions, ${commitsThisWeek} commits this week, ${totalCommits} total commits`,
  );
} else {
  console.log("README stats are already up to date.");
}
