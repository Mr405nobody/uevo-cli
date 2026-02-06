# Authentication Setup

The uEVO CLI supports only the following authentication methods:

1. **Login with Google (Gemini Code Assist):**
   - Use this option to log in with your Google account.
   - During initial startup, uEVO CLI will direct you to a webpage for authentication. Once authenticated, your credentials will be cached locally so the web login can be skipped on subsequent runs.
   - The web login must be done in a browser that can communicate with the machine uEVO CLI is being run from. (Specifically, the browser will be redirected to a localhost url that uEVO CLI will be listening on.)

2. **Gemini API key:**
   - Obtain your API key from Google AI Studio.
   - Set the `GEMINI_API_KEY` environment variable. In the following methods, replace `YOUR_GEMINI_API_KEY` with the API key you obtained from Google AI Studio:
     - You can temporarily set the environment variable in your current shell session using the following command:
       ```bash
       export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
       ```
     - For repeated use, you can add the environment variable to your `.env` file.

     - Alternatively you can export the API key from your shell's configuration file (like `~/.bashrc`, `~/.zshrc`, or `~/.profile`). For example, the following command adds the environment variable to a `~/.bashrc` file:

       ```bash
       echo 'export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"' >> ~/.bashrc
       source ~/.bashrc
       ```

       :warning: Be advised that when you export your API key inside your shell configuration file, any other process executed from the shell can read it.

## Persisting Environment Variables with `.env` Files

You can create a **`.gemini/.env`** file in your project directory or in your home directory. Creating a plain **`.env`** file also works, but `.gemini/.env` is recommended to keep Gemini variables isolated from other tools.

uEVO CLI automatically loads environment variables from the **first** `.env` file it finds, using the following search order:

1. Starting in the **current directory** and moving upward toward `/`, for each directory it checks:
   1. `.gemini/.env`
   2. `.env`
2. If no file is found, it falls back to your **home directory**:
   - `~/.gemini/.env`
   - `~/.env`

> **Important:** The search stops at the **first** file encountered—variables are **not merged** across multiple files.

### Examples

**Project-specific overrides** (take precedence when you are inside the project):

```bash
mkdir -p .gemini
echo 'GEMINI_API_KEY="your-gemini-api-key"' >> .gemini/.env
```

**User-wide settings** (available in every directory):

```bash
mkdir -p ~/.gemini
cat >> ~/.gemini/.env <<'EOF'
GEMINI_API_KEY="your-gemini-api-key"
EOF
```

## Non-Interactive Mode / Headless Environments

When running uEVO CLI in a non-interactive environment, you cannot use the interactive login flow.
Instead, you must configure authentication using environment variables.

The CLI will automatically detect if it is running in a non-interactive terminal and will use the
following authentication method if available:

1. **Gemini API Key:**
   - Set the `GEMINI_API_KEY` environment variable.
   - The CLI will use this key to authenticate with the Gemini API.

If `GEMINI_API_KEY` is not set in a non-interactive session, the CLI will exit with an error.
