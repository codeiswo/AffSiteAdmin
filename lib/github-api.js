/**
 * GitHub API Client for SitesPro
 * Handles repository dispatch triggers to kick off Actions deployment workflows.
 */

export async function triggerGithubDeploy({
  githubToken,
  owner,
  repo,
  siteName,
  domain,
  primaryColor,
  accentColor,
  seoTitle,
  seoDescription,
  cfPagesProjectName,
  cfApiToken,
  cfAccountId,
  d1DatabaseId,
  siteId,
  callbackUrl,
  callbackSecret,
}) {
  const url = `https://api.github.com/repos/${owner}/${repo}/dispatches`;

  // GitHub repository dispatch allows no more than 10 properties at the root of client_payload.
  // We group related configurations into nested objects to meet this constraint.
  const payload = {
    event_type: 'deploy-site',
    client_payload: {
      site_config: {
        site_name: siteName,
        domain: domain,
        primary_color: primaryColor,
        accent_color: accentColor,
        seo_title: seoTitle,
        seo_description: seoDescription,
      },
      cloudflare: {
        cf_pages_project_name: cfPagesProjectName,
        cf_api_token: cfApiToken,
        cf_account_id: cfAccountId,
        d1_database_id: d1DatabaseId,
      },
      site_id: siteId,
      callback_url: callbackUrl,
      callback_secret: callbackSecret,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${githubToken}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'SitesPro-Builder',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to trigger GitHub Actions: ${res.statusText} (${res.status}) - ${text}`);
  }

  // HTTP 204 No Content indicates success
  return true;
}
