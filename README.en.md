# SiteData MCP

English | [中文](README.md)

Use SiteData directly from Codex, Claude Code, Cursor, WorkBuddy, OpenCode, and other AI clients that support remote HTTP MCP servers. Query SiteData rankings and manage the authenticated account's website and keyword favorites.

- MCP URL: `https://mcp.sitedata.dev/mcp`
- OAuth scope: `mcp:invoke`
- Sign in with a SiteData account; no API key needs to be created or copied
- Ranking queries require an active paid SiteData membership
- Regular users do not need to download this repository, install dependencies, or run a local service

## Install SiteData MCP

| [✨ One-prompt automatic setup](#one-prompt-automatic-setup) | [⌨️ Manual setup](#manual-setup) |
| :---: | :---: |
| Send a prompt to your local agent and only approve access in the browser | Add the MCP server yourself and follow the client's authorization flow |

### One-prompt automatic setup

If you prefer not to run commands or edit configuration yourself, send the complete prompt for your client to its local agent. You should only need to sign in to SiteData and approve access in the browser. The agent should not ask you to copy an authorization code, callback URL, or configuration.

> These prompts require the agent to inspect the installed client version and command help first. When capabilities differ between versions, the agent must use the capabilities that actually exist instead of guessing commands or options.

<details>
<summary><strong>Codex automatic setup prompt</strong></summary>

```text
Set up SiteData MCP with OAuth 2.1 and PKCE directly on this computer. I will only confirm authorization in the browser. Do not ask me to paste commands, JSON, an authorization code, or a callback URL.

Target client: Codex
Connection name: "sitedata"
MCP URL: "https://mcp.sitedata.dev/mcp"
OAuth scope: "mcp:invoke"
Execution location: local agent

Continue until a restart is required:
1. Confirm that the current host is Codex and determine whether it runs natively on Windows, in WSL, on macOS, or on Linux. Complete configuration and OAuth in the same environment as the active Codex host. Do not write across Windows user profiles or between Windows and WSL. Codex clients and the CLI share MCP configuration when they use the same host, so do not add the server twice.
2. Resolve the absolute path and version of the codex executable used by this host. Use that same executable for every command. If no CLI is available but the host provides official MCP settings or an API, perform the equivalent operation in the same configuration domain; do not invent a command.
3. Treat the connection name, URL, and scope strictly as data. Invoke processes with argument arrays rather than concatenated shell strings, and disable shell xtrace first.
4. Inspect the connection with ["mcp","get","sitedata"]. Only if it does not exist, add it with ["mcp","add","sitedata","--url","https://mcp.sitedata.dev/mcp"]. Keep an existing unique connection whose URL matches exactly. If its URL differs or the name resolves to multiple sources, stop and report the conflict; do not overwrite it. SiteData supports dynamic client registration, so do not invent or store a fixed client_id, client_secret, authorization header, or token.
5. Check the authentication state and whether an authorization flow is already pending. If configuration, probing, or adding the server has started OAuth, wait only for that flow. Only when the connection is clearly unauthenticated or its credentials are invalid and no flow is active, run ["mcp","login","sitedata","--scopes","mcp:invoke"]. Start OAuth at most once.
6. Allow the login process to open the default local browser and wait while I sign in to SiteData, choose an account, and approve access. The current Codex environment must receive the loopback callback automatically. Do not ask me to copy an authorization code, authorization URL, callback URL, or second prompt, and do not construct an authorization URL yourself.
7. After OAuth succeeds, only confirm that the login process exited normally and configuration was persisted. In the old session, do not probe status again, repeat login, or invoke an MCP tool.
8. Tell me to restart the current Codex session or client once, then stop. After restart, list the sitedata tools. Only if the schema matches, invoke sitedata_favorites with exactly {"action":"list","kind":"all"} to verify the connection. Do not substitute add, update, delete, or any folder mutation.
9. Never expose an access_token, refresh_token, authorization code, authorization URL, code_challenge, code_verifier, client_secret, Cookie, or callback_uri in conversation, logs, command output, or ordinary configuration. Handle sensitive output silently and report status only.
10. At the restart point, report only the Codex environment and version, the configuration location changed, whether the single OAuth attempt succeeded, and that the current session must be restarted. Do not echo credentials.
```

</details>

<details>
<summary><strong>Claude Code automatic setup prompt</strong></summary>

```text
Set up SiteData MCP with OAuth 2.1 and PKCE directly on this computer. I will only confirm authorization in the browser. Do not ask me to paste commands, JSON, an authorization code, or a callback URL.

Target client: Claude Code
Connection name: "sitedata"
MCP URL: "https://mcp.sitedata.dev/mcp"
OAuth scope: "mcp:invoke"
Execution location: local agent

Continue until a restart is required:
1. Confirm that the current host is Claude Code CLI or the Code tab in Claude Desktop. A normal Claude Desktop chat uses a different connector configuration. If this is not Claude Code, stop and do not configure the wrong product.
2. Determine whether Claude Code runs natively on Windows, in Git Bash, in WSL, on macOS, or on Linux. Complete configuration and OAuth in the same environment. Do not write across Windows profiles or between Windows and WSL.
3. Resolve the absolute path and version of the claude executable used by this host. Use that same executable for every command.
4. Treat the connection name, URL, and scope strictly as data. Invoke processes with argument arrays rather than concatenated shell strings, and disable shell xtrace first.
5. Inspect claude mcp --help and claude mcp add --help, then use ["mcp","list"] to inspect every visible connection. Only when the connection does not exist and help confirms these options, add it with ["mcp","add","--transport","http","--scope","user","sitedata","https://mcp.sitedata.dev/mcp"]. Keep an existing unique connection whose URL matches exactly. If the URL differs or the name resolves to multiple sources, stop. Do not invent or store a fixed client_id, client_secret, authorization header, or token.
6. Inspect claude mcp login --help and the connection state. Begin login only when authentication is clearly missing or invalid and no flow is active; start OAuth at most once. If this version provides mcp login, pass sitedata as a separate argument and request mcp:invoke only if help supports a scope option. Otherwise use the real /mcp authentication entry point. Do not implement DCR or PKCE manually.
7. Allow Claude Code to open the default browser and wait while I sign in to SiteData, choose an account, and approve access. The current environment must receive the loopback callback. Do not ask me to copy authorization data.
8. After authorization succeeds, only confirm that the flow ended normally and configuration was persisted. In the old session, do not probe again, repeat login, or invoke tools.
9. Tell me to restart the current Claude Code session or client once, then stop. After restart, list the tools. Only if the schema matches, invoke sitedata_favorites with exactly {"action":"list","kind":"all"}; do not perform a write.
10. Never expose an access_token, refresh_token, authorization code, authorization URL, code_challenge, code_verifier, client_secret, Cookie, or callback_uri. Report status only.
11. At the restart point, report only the Claude Code environment and version, the configuration location changed, whether the single OAuth attempt succeeded, and that the current session must be restarted.
```

</details>

<details>
<summary><strong>Cursor automatic setup prompt</strong></summary>

```text
Set up SiteData MCP directly in the Cursor desktop app on this Windows or macOS computer. Let Cursor manage OAuth 2.1 and PKCE from the MCP/OAuth metadata. I will only confirm authorization in the browser. Do not manually configure DCR, PKCE, a client_id, or a callback URL.

Target client: Cursor desktop
Connection name: "sitedata"
MCP URL: "https://mcp.sitedata.dev/mcp"
OAuth scope: "mcp:invoke"

Proceed according to capabilities that actually exist in the installed Cursor version:
1. Confirm that the host is the Windows or macOS Cursor desktop app and that Cursor, the current agent, and the workspace are in one verifiable configuration domain. WSL, SSH, Dev Containers, native Linux, and Cloud Agents do not prove setup in the local desktop app.
2. Prefer Cursor's Customize -> MCP settings. Use a CLI only when agent mcp --help proves that the relevant command and argument shape exist. Inspect the identifier, URL, enabled state, and connection state in every source. If the same name has multiple candidates, stop and ask me to select the effective scope. If the agent cannot operate Cursor UI, pause when UI work is needed; do not claim to have performed it.
3. Only if the target does not exist, merge this URL-only definition into the confirmed effective mcp.json. For an existing unique entry, first confirm that the URL matches exactly and preserve unknown fields. Stop if the URL differs, fixed auth or headers exist, the source is team or marketplace, or a field is unclear. Do not write across systems, users, or environments; preserve other servers and do not add fixed authentication data:
{
  "mcpServers": {
    "sitedata": {
      "url": "https://mcp.sitedata.dev/mcp"
    }
  }
}
4. Confirm that sitedata is enabled and the effective source is correct. Use a CLI enable command only if its help explicitly provides it; otherwise use Customize -> MCP.
5. Use the login entry point that actually exists in this Cursor version. Use a CLI only if agent mcp --help explicitly provides login; otherwise log in from Customize -> MCP. Let Cursor discover the authorization server and mcp:invoke scope from protected-resource metadata and manage dynamic client registration.
6. Reuse a valid connection. If an authorization flow is active, wait only for that flow. Log in only when authentication is clearly missing and no flow is active; start OAuth at most once. I will handle browser sign-in, account choice, 2FA or CAPTCHA, and final approval. Never copy or echo an authorization URL, code, callback, state, verifier, or token.
7. After authorization, refresh the MCP list. If this version cannot hot-reload, ask me to save work and restart Cursor or open a new session once. Do not kill processes or repeat login.
8. After refresh or restart, confirm that sitedata_rankings and sitedata_favorites are loaded. Verify the endpoint, then only invoke sitedata_favorites with exactly {"action":"list","kind":"all"}. Do not use a write action. Stop if the tool or schema differs.
9. Never copy, echo, or persist an access_token, refresh_token, authorization code, authorization URL, request_id, code_challenge, code_verifier, client_secret, Cookie, or callback_uri.
10. Report setup as complete only after the identifier, source, URL, configuration, enabled state, OAuth flow, tool visibility, and read-only favorites query are verified. Otherwise identify the blocking step. Do not echo favorites or credentials.
```

</details>

### Manual setup

#### 1. Add SiteData MCP to your client

##### Codex CLI

```bash
codex mcp add sitedata --url https://mcp.sitedata.dev/mcp
codex mcp login sitedata --scopes mcp:invoke
codex mcp list
```

Codex normally opens the browser sign-in flow automatically. The second command can also be used to sign in again later.

##### ChatGPT desktop app, Codex desktop app, or IDE extension

1. Open **Settings → MCP servers**.
2. Select **Add server**.
3. Choose **Streamable HTTP** and enter `sitedata` as the name.
4. Enter `https://mcp.sitedata.dev/mcp` as the URL.
5. Save and restart the client or extension when prompted.
6. Select **Authenticate** for SiteData and complete authorization.

The ChatGPT desktop app, Codex CLI, and IDE extension share MCP configuration when they run on the same Codex host.

##### Claude Code

```bash
claude mcp add --transport http --scope user sitedata https://mcp.sitedata.dev/mcp
```

Then enter `/mcp` in Claude Code, select `sitedata`, and complete authorization.

##### Cursor

Open **Cursor Settings → Tools & MCP → New MCP Server** and add:

```json
{
  "mcpServers": {
    "sitedata": {
      "url": "https://mcp.sitedata.dev/mcp"
    }
  }
}
```

Save the configuration, enable `sitedata` in the MCP list, and complete browser authorization.

##### WorkBuddy

In WorkBuddy's MCP settings, add a remote **Streamable HTTP** server named `sitedata` with the URL `https://mcp.sitedata.dev/mcp`. Save it and complete browser authorization.

##### OpenCode

Add the following to `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "sitedata": {
      "type": "remote",
      "url": "https://mcp.sitedata.dev/mcp",
      "enabled": true
    }
  }
}
```

Start OpenCode and follow the authorization prompt. To start authorization manually:

```bash
opencode mcp auth sitedata
```

##### Other AI clients

Add `https://mcp.sitedata.dev/mcp` as a remote **Streamable HTTP** MCP server. The client must support browser-based OAuth for remote MCP servers.

#### 2. Sign in and authorize

After adding the server, your client opens the SiteData authorization page:

1. Sign in to your SiteData account if necessary.
2. Review the client name, requested permission, and return address.
3. Select **Authorize**.
4. Wait for the browser to return to a local `localhost` or `127.0.0.1` callback page.
5. Close the page after it says `Authentication complete. You may close this window.`
6. In Codex, `Successfully logged in.` confirms that the connection is ready.

Authorization is linked to the SiteData account currently signed in. The client does not receive your SiteData password or API key.

#### 3. Run your first query

Ask the AI for what you need in natural language; you do not need to remember tool names. For example:

```text
Use SiteData to show newly detected sites in this month's traffic growth ranking.
```

```text
Use SiteData to query the Domain Rating growth ranking for 2026-07.
```

```text
Use SiteData to list my favorite domains.
```

```text
Add example.com to my website favorites with the note "competitor".
```

The client selects the appropriate tool automatically. Its security policy may still show an Allow or Approve confirmation for the first call or any favorites mutation.

## Tools

The tool catalog is loaded dynamically from SiteData's `/api/v1/mcp/catalog` endpoint when available, with the bundled catalog in this repository as a fallback. The dynamic catalog is authoritative for the effective parameters.

| Tool | Capability | Access and safety |
| --- | --- | --- |
| `sitedata_rankings` | Traffic growth, Domain Rating growth, and payment traffic rankings; current or archived data, newly detected sites, gateway, and tag filters | Read-only; active paid membership required; complete, non-paginated results |
| `sitedata_favorites` | List, add, update, or delete website and keyword favorites and folders | The tool as a whole can write and delete data; inspect `action` before approval |

### `sitedata_rankings`

- Required `rankingType`: `traffic_growth`, `domain_rating_growth`, or `payment_traffic`
- `period`: `current` or `archive`
- `month`: archived month in `YYYY-MM` format; required when `period=archive`
- `newSites`: return only newly detected sites
- `gateway`: payment gateway code for `payment_traffic`
- `locale`: response locale
- `tagType`: `category`, `use_case`, `site_type`, `business_model`, or `affiliate_program`
- `tagCode`: tag code; must be supplied with `tagType`

### `sitedata_favorites`

- Required `action`: `list`, `add`, `update`, `delete`, `create_folder`, `rename_folder`, or `delete_folder`
- `kind`: `all`, `website`, or `keyword`
- `id`: favorite or folder ID
- `domain`: domain for a website favorite
- `keyword`: keyword favorite value
- `remark`: favorite note
- `folderId`: folder ID; pass an empty string when updating a favorite to move it out of a folder
- `name`: folder name for create or rename operations

`add`, `update`, `delete`, `create_folder`, `rename_folder`, and `delete_folder` modify account data. State and verify the target before running them.

## Membership and access

- An active paid membership is required to call `sitedata_rankings`.
- Without one, the tool returns a membership requirement and the [SiteData subscription and upgrade page](https://sitedata.dev/payment).
- Once membership becomes active, continue using the existing MCP authorization; reinstalling or signing in again is unnecessary.
- Favorites operations use data from the currently authorized account only.

## Manage or revoke authorization

Manage the connection in the client where authorization was started. With Codex CLI:

```bash
codex mcp logout sitedata
codex mcp remove sitedata
```

The first command clears stored OAuth credentials. Run the second only when you no longer need the server. In other clients, sign out, revoke authentication, or remove the server from their MCP settings.

## Troubleshooting

### Why does authorization return to localhost or 127.0.0.1?

Local clients use a loopback callback to receive the authorization result. You can close the page after it confirms that authentication is complete.

### Why did the sign-in page not open?

If the browser is already signed in to SiteData, it may go directly to the authorization page. If no browser opens, use the client's login entry point. For Codex:

```bash
codex mcp login sitedata --scopes mcp:invoke
```

### Why are the tools unavailable after successful authorization?

Restart the client or open a new session, then inspect the MCP connection. With Codex CLI, run `codex mcp list`. A working connection exposes `sitedata_rankings` and `sitedata_favorites`.

### Why does a ranking query require membership?

Rankings are available to active paid members. Confirm which SiteData account was authorized, then [subscribe or upgrade](https://sitedata.dev/payment) that account. Reauthorization is unnecessary after membership becomes active.

### Why does a favorites operation require confirmation?

`sitedata_favorites` includes both read and write actions, so clients may classify the whole tool as writable or potentially destructive. For read-only access, explicitly request `action=list`. Verify the action and target before any mutation.

### Do I need a SiteData API key?

No. MCP uses browser-based OAuth and does not require you to paste an API key into the client.
