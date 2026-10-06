"use client";

import { useState } from "react";
import { saveGithubUsername } from "@/lib/local-progress";
import { useLocalProgress } from "@/lib/client-state";

type GithubUser = { login: string; name: string | null; bio: string | null; public_repos: number; followers: number; html_url: string };
type GithubRepo = { id: number; name: string; description: string | null; html_url: string; language: string | null; stargazers_count: number; updated_at: string };

export default function GithubPage() {
  const progress = useLocalProgress();
  const [username, setUsername] = useState<string | null>(null);
  const [user, setUser] = useState<GithubUser | null>(null);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanUsername = (username ?? progress.githubUsername).trim();
    if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(cleanUsername)) {
      setError("Enter a valid public GitHub username.");
      return;
    }
    setLoading(true);
    setError("");
    setUser(null);
    try {
      const [profileResponse, repoResponse] = await Promise.all([
        fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}`),
        fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}/repos?sort=updated&per_page=100`),
      ]);
      const profile = await profileResponse.json();
      if (!profileResponse.ok) throw new Error(profile.message ?? "Could not find that public GitHub profile.");
      const repositoryData = await repoResponse.json();
      if (!repoResponse.ok) throw new Error(repositoryData.message ?? "Could not load public repositories.");
      setUser(profile as GithubUser);
      setRepos(Array.isArray(repositoryData) ? repositoryData as GithubRepo[] : []);
      saveGithubUsername(cleanUsername);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "GitHub profile analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  const languages = repos.reduce<Record<string, number>>((counts, repo) => {
    if (repo.language) counts[repo.language] = (counts[repo.language] ?? 0) + 1;
    return counts;
  }, {});
  const topLanguages = Object.entries(languages).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <main className="min-h-[80vh] bg-[#fafafa] px-4 py-8 text-slate-900 dark:bg-[#09090b] dark:text-slate-50 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#635bff]">INTERMEDIATE · GITHUB INTELLIGENCE</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Turn your public work into evidence</h1>
        <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">Review public repository activity and identify ways to make your portfolio easier to evaluate. No private repositories are accessed.</p>
        <form onSubmit={analyze} className="mt-6 flex flex-wrap gap-3">
          <label className="sr-only" htmlFor="github-username">GitHub username</label>
          <input id="github-username" value={username ?? progress.githubUsername} onChange={(event) => setUsername(event.target.value)} placeholder="GitHub username" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-[#111113]" />
          <button disabled={loading || !(username ?? progress.githubUsername).trim()} className="rounded-xl bg-[#635bff] px-5 py-3 text-sm font-medium text-white disabled:opacity-50">{loading ? "Loading…" : "Analyze public profile"}</button>
        </form>
        {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-200">{error}</p>}
        {user && (
          <section className="mt-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#111113]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div><h2 className="text-2xl font-semibold">{user.name || user.login}</h2><p className="mt-1 text-sm text-slate-500">@{user.login}</p>{user.bio && <p className="mt-3 max-w-xl text-sm">{user.bio}</p>}</div>
                <a href={user.html_url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[#635bff]">Open GitHub ↗</a>
              </div>
              <div className="mt-5 flex gap-6 text-sm"><span><strong>{user.public_repos}</strong> public repos</span><span><strong>{user.followers}</strong> followers</span><span><strong>{repos.length}</strong> repos reviewed</span></div>
              <div className="mt-5"><h3 className="font-semibold">Most represented languages</h3>{topLanguages.length ? <div className="mt-2 flex flex-wrap gap-2">{topLanguages.map(([language, count]) => <span key={language} className="rounded-full bg-slate-100 px-3 py-1 text-xs dark:bg-slate-800">{language} · {count}</span>)}</div> : <p className="mt-2 text-sm text-slate-500">No language metadata was listed on the repositories reviewed.</p>}</div>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <article className="rounded-2xl bg-indigo-50 p-5 dark:bg-indigo-950/30"><h3 className="font-semibold">Portfolio improvements to consider</h3><ul className="mt-3 list-disc space-y-2 pl-5 text-sm"><li>Pin your strongest role-relevant repositories.</li><li>Add clear READMEs with setup steps, screenshots, and decisions.</li><li>Include tests and a working deployed demo where practical.</li><li>Describe your own contribution to collaborative projects.</li></ul></article>
              <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#111113]"><h3 className="font-semibold">Recently updated public repositories</h3><ul className="mt-3 space-y-3">{repos.slice(0, 5).map((repo) => <li key={repo.id}><a className="text-sm font-medium text-[#635bff]" href={repo.html_url} target="_blank" rel="noreferrer">{repo.name} ↗</a><p className="text-xs text-slate-500">{repo.language || "Language not specified"} · {repo.stargazers_count} stars{repo.description ? ` · ${repo.description}` : ""}</p></li>)}</ul>{repos.length === 0 && <p className="mt-2 text-sm text-slate-500">No public repositories found.</p>}</article>
            </div>
            <p className="mt-4 text-xs text-slate-500">This summary is based only on public GitHub API data and is not an assessment of code quality or employability. GitHub rate limits apply.</p>
          </section>
        )}
      </div>
    </main>
  );
}
