# Optional ChatGPT Web supervisor bridge

This project does not bundle or maintain `codex-chatgpt-web`.

Upstream repository: `https://github.com/miuuyy/codex-chatgpt-web`

A compatible bridge can expose ChatGPT Web models inside Codex and, in full-harness mode, route tool calls back through MCP.

## Field-tested topology

```text
GPT-5.6 Sol (Web) High       <- supervisor
   +--> explorer: GPT-6 Luna Medium
   +--> worker:   GPT-6 Luna High
   +--> reviewer: GPT-6 Luna High
```

The split can keep high-level reasoning with a strong supervisor while native Luna agents execute bounded work.

## Security

A Web bridge adds browser automation, persistent session data, local services, tunnels, and account sessions to the trust model. Protect launcher/profile data and credentials and follow the bridge's current security documentation.

## Compatibility

Model names, permission UI, and available reasoning levels can change. Always validate a tiny read-only subagent run before launching a long unattended Goal.
