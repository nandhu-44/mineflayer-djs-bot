# Mineflayer Discord Controller Bot

Control a Mineflayer Minecraft bot completely from Discord slash commands.

## What You Get

- Slash command handler (modular, auto register)
- Single Discord channel relay (status, chat, events)
- Movement / follow / mine / collect / back / home / say / tpa / tpaccept / stop
- Status + player list + control panel buttons
- Auto reconnect + optional auto `/login`
- Pathfinder + tool + collectblock + pvp plugins pre‑loaded
- Optional prismarine viewer & optional tiny web heartbeat server

## Quick Start

1. Copy `.env.example` to `.env` and fill the required values:

    ```sh
    cp .env.example .env
    ```

    - Discord: `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_GUILD_ID`, `DISCORD_CONTROL_CHANNEL_ID`
    - Minecraft: `MC_HOST`, `MC_PORT`, `MC_USERNAME`, (optional) `MC_PASSWORD`, `MC_AUTH` (`offline` or `microsoft`)

2. (Optional) Put overrides in `src/config/config.json` instead / in addition.
3. Install deps:

    ```bash
    npm install
    ```

4. Register slash commands (re-run after adding/removing commands):

    ```bash
    npm run register
    ```

5. Start:

    ```bash
    npm start
    ```

## Key Env Flags (see `.env.example`)

| Purpose | Variable | Default |
|---------|----------|---------|
| Status update interval (ms) | `STATUS_UPDATE_INTERVAL_MS` | 5000 |
| Status output mode (edit/send/off) | `STATUS_MODE` | edit |
| Suppress noisy protocol logs | `SUPPRESS_PROTOCOL_SPAM` | false |
| Force MC version (blank = auto) | `MC_VERSION` |  (auto) |
| Enable web viewer | `ENABLE_VIEWER` | false |
| Viewer port | `VIEWER_PORT` | 3002 |
| Enable web heartbeat | `ENABLE_WEB_SERVER` | false |
| Web server port | `WEB_SERVER_PORT` | 3001 |

Enable optional pieces by setting the flag to `true` (e.g. `ENABLE_VIEWER=true`).

## Adding a Command

Add a file in `src/commands/<category>/yourcommand.js` exporting a default instance of the `Command` class. Re-run `npm run register` to push new slash definitions.

## Control Channel

Everything (chat relay, status edits or posts, teleport notices, errors) goes to the single channel you set in `DISCORD_CONTROL_CHANNEL_ID`.

## Notes

- Use a dedicated alt and follow server rules.
- For Microsoft auth set `MC_AUTH=microsoft`; additional auth flows (device code, tokens) are not included here.

Enjoy.
