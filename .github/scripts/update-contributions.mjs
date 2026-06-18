import fs from "node:fs/promises";

const username = process.env.GITHUB_USERNAME || "IshanKulkarni02";
const token = process.env.GH_GRAPHQL_TOKEN || process.env.GITHUB_TOKEN;
const readmePath = process.env.README_PATH || "README.md";
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
const updatedBlock = `<!-- GITHUB-STATS:START -->
  <strong>Total Contributions:</strong> ${formatNumber(totalContributions)}
  <br />
  <strong>Commits This Week:</strong> ${formatNumber(commitsThisWeek)}
  <br />
  <strong>Total Commits:</strong> ${formatNumber(totalCommits)}
  <!-- GITHUB-STATS:END -->`;

const readme = await fs.readFile(readmePath, "utf8");
const nextReadme = readme.replace(
  /<!-- GITHUB-STATS:START -->[\s\S]*?<!-- GITHUB-STATS:END -->/,
  updatedBlock,
);

if (nextReadme === readme) {
  console.log("README already has the latest contribution count.");
} else {
  await fs.writeFile(readmePath, nextReadme);
  console.log(
    `Updated stats for ${username}: ${totalContributions} contributions, ${commitsThisWeek} commits this week, ${totalCommits} total commits`,
  );
}
