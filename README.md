# SiteData MCP

[English](README.en.md) | 中文

让 Codex、Claude Code（CC）、Cursor、WorkBuddy、OpenCode 和其他支持远程 HTTP MCP 的 AI 客户端直接查询 SiteData 排行榜，并管理当前账户的网站与关键词收藏。

- MCP 地址：`https://mcp.sitedata.dev/mcp`
- OAuth scope：`mcp:invoke`
- 使用 SiteData 账户登录授权，无需创建或复制 API Key
- 排行榜查询要求授权账户具有有效的 SiteData 付费会员
- 普通用户无需下载本仓库、安装依赖或运行本地服务

## 安装 SiteData MCP

| [✨ 一句话 Prompt 自动安装](#一句话-prompt-自动安装) | [⌨️ 手动安装](#手动安装) |
| :---: | :---: |
| 把提示词发给本机 Agent，只需在浏览器确认授权 | 自己添加 MCP，并按客户端提示完成授权 |

### 一句话 Prompt 自动安装

如果不想手动执行命令或编辑配置，可以把对应客户端的提示词完整发送给该客户端中的本机 Agent。用户只需在浏览器中登录 SiteData 并确认授权；Agent 不应要求用户复制授权码、回调地址或任何配置。

> 下面的提示词要求 Agent 先检查客户端的实际版本和命令帮助。不同版本能力不一致时，应以本机真实能力为准，不得猜测不存在的命令或参数。

<details>
<summary><strong>Codex 自动安装提示词</strong></summary>

```text
请直接在当前这台电脑完成 SiteData MCP OAuth 2.1 + PKCE 接入。我只会在浏览器确认授权；不要让我再粘贴命令、JSON、authorization code 或回调地址。

目标客户端：Codex
连接名称："sitedata"
MCP 地址："https://mcp.sitedata.dev/mcp"
OAuth scope："mcp:invoke"
运行位置：本机 Agent

请连续执行到需要重启为止：
1. 确认当前宿主确实是 Codex，并判断它运行在 Windows 原生、WSL、macOS 还是 Linux。配置和 OAuth 必须在当前 Codex 实际运行的同一环境完成，禁止跨 Windows 用户目录和 WSL Home 写入配置。Codex 客户端与 CLI 处于同一环境时共用 MCP 配置，不要重复添加。
2. 定位当前宿主实际使用的 codex 可执行文件绝对路径并读取版本；后续所有 Codex 命令均使用该路径。如果当前宿主没有可用 CLI，但提供官方 MCP 设置或宿主 API，则在同一配置域完成等价操作，不得编造命令。
3. 把连接名称、MCP 地址和 scope 作为纯数据处理。调用进程时使用参数数组，不拼接 shell 字符串；执行 shell 前关闭 xtrace。
4. 先使用参数数组 ["mcp","get","sitedata"] 检查连接。仅当连接不存在时，使用 ["mcp","add","sitedata","--url","https://mcp.sitedata.dev/mcp"] 添加。已有唯一同名连接且 URL 逐字正确时保留；URL 不一致或同名来源不唯一时停止并准确报告，不得覆盖。SiteData 支持动态客户端注册，不要虚构或写入固定 client_id、client_secret、认证请求头或 Token。
5. 检查认证状态及是否已有等待中的授权流程。配置、探测或添加操作已经触发 OAuth 时，只等待该流程。只有明确未认证或凭据失效且没有活动流程时，才使用 ["mcp","login","sitedata","--scopes","mcp:invoke"]；本次最多发起一次 OAuth。
6. 让登录进程打开本机默认浏览器并等待我登录 SiteData、选择账户及确认授权。由当前 Codex 环境自动接收 loopback 回调；不要让我复制 authorization code、authorization URL、callback 地址或第二段提示词，也不要自行拼接授权 URL。
7. OAuth 成功后，只确认登录进程正常退出和配置已持久化；不要在旧会话再次探测状态、重复登录或调用 MCP 工具。
8. 提醒我重启当前 Codex 会话或客户端一次，然后停止。重启后列出 sitedata 工具；只有 schema 与预期一致时，才调用 sitedata_favorites，参数严格限定为 {"action":"list","kind":"all"} 验证连接，不得改用任何写操作。
9. 全程不得在对话、日志、命令回显或普通配置中暴露 access_token、refresh_token、authorization code、authorization URL、code_challenge、code_verifier、client_secret、Cookie 或 callback_uri。敏感输出只能静默处理，只汇报状态。
10. 到达重启点后只汇报：Codex 运行环境与版本、修改的配置位置、一次 OAuth 是否成功、已明确需要重启当前会话。不要回显任何凭据。
```

</details>

<details>
<summary><strong>Claude Code（CC）自动安装提示词</strong></summary>

```text
请直接在当前这台电脑完成 SiteData MCP OAuth 2.1 + PKCE 接入。我只会在浏览器确认授权；不要让我再粘贴命令、JSON、authorization code 或回调地址。

目标客户端：Claude Code
连接名称："sitedata"
MCP 地址："https://mcp.sitedata.dev/mcp"
OAuth scope："mcp:invoke"
运行位置：本机 Agent

请连续执行到需要重启为止：
1. 确认当前宿主是 Claude Code CLI 或 Claude Desktop 的 Code 页签。Claude Desktop 普通聊天窗口使用另一套连接器配置；如果当前不是 Claude Code，立即停止，不要写入错误产品。
2. 判断 Claude Code 实际运行在 Windows 原生、Git Bash、WSL、macOS 还是 Linux。配置和 OAuth 必须在同一环境完成，禁止跨 Windows 用户目录和 WSL Home 写入。
3. 定位当前宿主实际使用的 claude 可执行文件绝对路径并读取版本；后续命令始终使用该路径。
4. 把连接名称、MCP 地址和 scope 作为纯数据处理。调用进程时使用参数数组，不拼接 shell 字符串；执行 shell 前关闭 xtrace。
5. 检查 claude mcp --help、claude mcp add --help，再用 ["mcp","list"] 检查所有可见连接。仅当连接不存在且帮助确认参数可用时，使用 ["mcp","add","--transport","http","--scope","user","sitedata","https://mcp.sitedata.dev/mcp"] 添加。已有唯一同名连接且 URL 正确时保留；URL 不一致或同名来源不唯一时停止。不要虚构或写入固定 client_id、client_secret、认证请求头或 Token。
6. 检查 claude mcp login --help 和连接状态。只有明确未认证或凭据失效且没有活动流程时才登录，本次最多一次。若当前版本真实提供 mcp login，则把 sitedata 作为独立参数，并仅在帮助明确支持时请求 mcp:invoke；否则使用 Claude Code 当前真实存在的 /mcp 认证入口，不得手工实现 DCR/PKCE。
7. 让 Claude Code 打开本机默认浏览器并等待我登录 SiteData、选择账户及确认授权。由当前环境接收 loopback 回调；不要让我复制任何授权码、授权 URL 或回调地址。
8. 授权成功后，只确认流程正常结束和配置已持久化；不要在旧会话重复探测、登录或调用工具。
9. 提醒我重启当前 Claude Code 会话或客户端一次，然后停止。重启后列出工具；只有 schema 一致时，才调用 sitedata_favorites，参数严格限定为 {"action":"list","kind":"all"}，不得执行写操作。
10. 全程不得暴露 access_token、refresh_token、authorization code、authorization URL、code_challenge、code_verifier、client_secret、Cookie 或 callback_uri，只汇报状态。
11. 到达重启点后只汇报：Claude Code 运行环境与版本、修改的配置位置、一次 OAuth 是否成功、已明确需要重启当前会话。
```

</details>

<details>
<summary><strong>Cursor 自动安装提示词</strong></summary>

```text
请直接在当前 Windows 或 macOS 的 Cursor 桌面端完成 SiteData MCP 接入，并让 Cursor 根据 MCP/OAuth 元数据管理 OAuth 2.1 + PKCE。我只会在浏览器确认授权；不要手工配置 DCR、PKCE、client_id 或回调地址。

目标客户端：Cursor 桌面端
连接名称："sitedata"
MCP 地址："https://mcp.sitedata.dev/mcp"
OAuth scope："mcp:invoke"

请按 Cursor 当前实际能力连续执行：
1. 确认宿主确实是 Windows 或 macOS 的 Cursor 桌面端，并确认 Cursor、当前 Agent 和工作区处于同一可验证配置域。WSL、SSH、Dev Container、原生 Linux 和 Cloud Agents 不能证明本机桌面端已完成接入。
2. 优先使用 Cursor 的 Customize → MCP 设置。只有 agent mcp --help 明确证明相关 CLI 和参数存在时才使用 CLI。检查所有来源中的 identifier、URL、启用状态和连接状态；同名候选不唯一时停止并请我选择作用域。如果 Agent 不能操作 Cursor UI，在需要 UI 时暂停，不得声称已操作。
3. 只有目标不存在时，才把下面的 URL-only 配置合并到确认生效的 mcp.json。已有唯一同名条目时先确认 URL 逐字一致并保留未知字段；URL 不一致、含固定 auth/headers、来源为 team/marketplace 或字段含义不明时停止。不得跨系统、用户或环境写入，不覆盖其他服务器，不写固定认证参数：
{
  "mcpServers": {
    "sitedata": {
      "url": "https://mcp.sitedata.dev/mcp"
    }
  }
}
4. 保存后确认 sitedata 已启用且生效来源正确。只有 CLI 帮助明确提供 enable 时才使用 CLI，否则在 Customize → MCP 中启用。
5. 使用当前版本真实提供的登录入口。只有 agent mcp --help 明确提供 login 时才通过 CLI 登录，否则在 Customize → MCP 中登录。让 Cursor 从 MCP 受保护资源元数据发现授权服务器和 mcp:invoke scope，并通过动态客户端注册管理 OAuth。
6. 已有有效连接直接复用；已有活动授权流程只等待当前流程。只有明确未认证且没有活动流程时才登录，本次最多一次。浏览器登录、账户选择、2FA/CAPTCHA 和最终授权由我完成。不得复制或回显授权 URL、code、callback、state、verifier 或 Token。
7. 授权成功后刷新 MCP 列表；无法热加载时提示我保存工作，再由我重启 Cursor 或新建会话一次。不要杀进程或重复登录。
8. 刷新或重启后确认 sitedata_rankings 和 sitedata_favorites 已加载。先核对 endpoint，再只允许调用 sitedata_favorites，参数严格限定为 {"action":"list","kind":"all"} 验证连接，不得使用写操作。工具或 schema 不一致时停止。
9. 全程不得复制、回显或持久化 access_token、refresh_token、authorization code、authorization URL、request_id、code_challenge、code_verifier、client_secret、Cookie 或 callback_uri。
10. 只有 identifier、source、URL、配置、启用状态、OAuth、工具可见性和只读收藏查询均已验证，才报告安装完成；否则准确说明阻塞步骤，不回显收藏内容或凭据。
```

</details>

### 手动安装

#### 1. 在客户端中添加 SiteData MCP

##### Codex CLI

```bash
codex mcp add sitedata --url https://mcp.sitedata.dev/mcp
codex mcp login sitedata --scopes mcp:invoke
codex mcp list
```

Codex 通常会自动打开浏览器开始登录；第二条命令也可用于之后重新登录。

##### ChatGPT 桌面端、Codex 桌面端或 IDE 扩展

1. 打开 **Settings → MCP servers**。
2. 选择 **Add server**。
3. 类型选择 **Streamable HTTP**，名称填写 `sitedata`。
4. URL 填写 `https://mcp.sitedata.dev/mcp`。
5. 保存并按提示重启客户端或扩展。
6. 选择 **Authenticate** 完成登录授权。

同一 Codex 宿主中的 ChatGPT 桌面端、Codex CLI 和 IDE 扩展会共享 MCP 配置。

##### Claude Code（CC）

```bash
claude mcp add --transport http --scope user sitedata https://mcp.sitedata.dev/mcp
```

然后在 Claude Code 中输入 `/mcp`，选择 `sitedata` 并完成登录授权。

##### Cursor

打开 **Cursor Settings → Tools & MCP → New MCP Server**，添加：

```json
{
  "mcpServers": {
    "sitedata": {
      "url": "https://mcp.sitedata.dev/mcp"
    }
  }
}
```

保存配置，在 MCP 列表中启用 `sitedata`，然后按提示完成浏览器授权。

##### WorkBuddy

在 WorkBuddy 的 MCP 设置中添加名为 `sitedata` 的远程 **Streamable HTTP** 服务，URL 填写 `https://mcp.sitedata.dev/mcp`，保存后完成浏览器授权。

##### OpenCode

在 `opencode.json` 中添加：

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

启动 OpenCode 后按提示完成授权；如果需要手动登录：

```bash
opencode mcp auth sitedata
```

##### 其他 AI 客户端

添加远程 **Streamable HTTP** MCP 服务 `https://mcp.sitedata.dev/mcp`。客户端必须支持远程 MCP 的浏览器 OAuth 登录。

#### 2. 登录并授权

添加 MCP 后，客户端会打开 SiteData 授权页面：

1. 如果尚未登录，请先登录 SiteData 账户。
2. 确认客户端名称、请求权限和返回地址。
3. 点击 **Authorize / 授权**。
4. 浏览器返回本机 `localhost` 或 `127.0.0.1` 回调页后，等待授权完成。
5. 页面显示 `Authentication complete. You may close this window.` 后即可关闭。
6. Codex 显示 `Successfully logged in.` 即表示连接成功。

授权绑定当前登录的 SiteData 账户。客户端不会获得你的 SiteData 密码或 API Key。

#### 3. 发起第一次查询

直接用自然语言告诉 AI 需要查询什么，不必记住工具名称。例如：

```text
通过 SiteData 查询本月新出现的网站流量增长榜
```

```text
通过 SiteData 查询 2026-07 的 Domain Rating 增长榜
```

```text
通过 SiteData 列出我收藏的域名
```

```text
把 example.com 添加到我的网站收藏，并备注“竞品”
```

客户端会自动选择工具。首次调用或收藏写操作可能显示 Allow / Approve 确认。

## 工具

工具清单优先从 SiteData 平台的 `/api/v1/mcp/catalog` 动态加载；平台暂时不可用时使用本仓库内置清单。动态清单是实际参数的最终依据。

| 工具 | 能力 | 权限提示 |
| --- | --- | --- |
| `sitedata_rankings` | 查询流量增长、Domain Rating 增长和支付流量排行榜；支持当前/历史月份、新网站、支付网关及标签筛选 | 只读；要求有效付费会员；返回完整结果，不分页 |
| `sitedata_favorites` | 查询、新增、更新、删除网站/关键词收藏及收藏夹 | 工具整体可写且可能删除数据；执行前检查 `action` |

### `sitedata_rankings`

- 必填 `rankingType`：`traffic_growth`、`domain_rating_growth` 或 `payment_traffic`
- `period`：`current` 或 `archive`
- `month`：历史榜单月份，格式 `YYYY-MM`；`period=archive` 时必填
- `newSites`：只返回新发现的网站
- `gateway`：`payment_traffic` 使用的支付网关代码
- `locale`：响应语言
- `tagType`：`category`、`use_case`、`site_type`、`business_model` 或 `affiliate_program`
- `tagCode`：标签代码，必须与 `tagType` 一起使用

### `sitedata_favorites`

- 必填 `action`：`list`、`add`、`update`、`delete`、`create_folder`、`rename_folder` 或 `delete_folder`
- `kind`：`all`、`website` 或 `keyword`
- `id`：收藏或收藏夹 ID
- `domain`：网站收藏的域名
- `keyword`：关键词收藏内容
- `remark`：收藏备注
- `folderId`：收藏夹 ID；更新收藏时传空字符串可移出收藏夹
- `name`：新建或重命名收藏夹时的名称

`add`、`update`、`delete`、`create_folder`、`rename_folder` 和 `delete_folder` 会修改账户数据。执行前应明确并核对目标。

## 会员与访问权限

- 账户需要有效的付费会员才能调用 `sitedata_rankings`。
- 没有有效会员时，工具会返回会员要求以及 [SiteData 订阅/升级页面](https://sitedata.dev/zh-cn/payment)。
- 会员生效后可继续使用现有 MCP 授权，无需重新安装或登录。
- 收藏管理只使用当前授权账户的数据。

## 管理或撤销授权

请在发起授权的客户端中管理连接。以 Codex CLI 为例：

```bash
codex mcp logout sitedata
codex mcp remove sitedata
```

第一条清除 OAuth 凭据；不再需要服务器时再执行第二条。其他客户端请在各自的 MCP 设置中退出登录、撤销认证或删除服务器。

## 常见问题

### 为什么授权后会跳到 localhost 或 127.0.0.1？

这是本地客户端接收授权结果的 loopback 回调地址，属于正常流程。页面提示认证完成后即可关闭。

### 为什么没有打开登录页面？

浏览器中已经登录 SiteData 时，可能直接进入授权确认页。如果客户端没有打开浏览器，请使用其登录入口。例如：

```bash
codex mcp login sitedata --scopes mcp:invoke
```

### 授权成功后为什么看不到工具？

重启客户端或重新打开会话，然后检查 MCP 连接。Codex CLI 可执行 `codex mcp list`。正常情况下会看到 `sitedata_rankings` 和 `sitedata_favorites`。

### 为什么排行榜查询提示需要会员？

排行榜只对有效付费会员开放。请确认授权账户，并为同一账户[开通或升级会员](https://sitedata.dev/zh-cn/payment)。会员生效后无需重新授权。

### 为什么收藏操作要求确认？

`sitedata_favorites` 同时包含读取和写入操作，客户端可能把整个工具标记为可写或具有删除风险。只查看数据时请明确要求 `action=list`；写入前请核对操作和目标。

### 需要创建 SiteData API Key 吗？

不需要。MCP 使用浏览器 OAuth 登录授权，不会要求你把 API Key 粘贴到客户端。
