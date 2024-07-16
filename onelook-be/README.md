<p align="center">
<img src="https://github.com/user-attachments/assets/9034f499-be55-4e53-bcd7-70b66a20f2c7" width="150" height="150" style="margin-left: auto; margin-right: auto;" />
</p>

# Onelook Backend

This is the backend for [Onelook](https://github.com/onelook-ai/onelook), built using NestJS.

## Get Started

### Requirements

- Nodejs >= v20
- A running instance of PostgreSQL database.
- A Gen-AI service you can connect to (self-host works too).
- `ffmpeg` and `ffprobe` installed and available on `$PATH`. (See https://ffmpeg.org/download.html.)

### Installation

1. Git clone this repo

   ```sh
   git clone git@github.com:onelook-ai/onelook.git && cd onelook/onelook-be
   ```

2. Install dependencies

   ```sh
   yarn
   ```

### Copy sample files

Copy `sample.env` into `.env` and modify the values as necessary.

If you are running all of your services in development mode, you can leave most of the default values unchanged.

#### Generative AI Service

Onelook allows you to choose the Generative AI (Large Language Model) service to connect with, even self-hosted ones. Configure your Gen-AI service with the environment variables prefixed with `GENAI_`.

| Env var        | Required | Remarks                                                                                                                                               |
| -------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| GENAI_SERVICE  | Required | Valid values: `openai`, `openai-compatible`, `google`, `anthropic`, `mistral`, `cohere`. If you are self-hosting your LLM, use `openai-compatible`\*. |
| GENAI_BASE_URL | Optional | Useful if self-hosting or for proxies.                                                                                                                |
| GENAI_PROJECT  | Optional | If present, only used for OpenAI.                                                                                                                     |
| GENAI_API_KEY  | Required | API key                                                                                                                                               |
| GENAI_MODEL    | Required | Model name (note: Google's models should be prefixed with `models/`)                                                                                  |

> **Notes**
>
> 1. This project uses Vercel's AI SDK, hence if you are running your own LLM, make sure it has OpenAI-compatible APIs and use `openai-compatible`. For more details, see https://sdk.vercel.ai/docs/foundations/providers-and-models#ai-sdk-providers.
> 2. The quality of the report generation will differ for different LLMs. Our tests with smaller context LLMs show that while the report generated is fairly decent, the biggest issue is the context size - you have to pick a smaller time window from the video to generate the report from.

#### Transactional Emails and Analytics

This project was started with using Brevo for transactional emails and Posthog for analytics. Both are optional and will not be used if you leave these values empty:

```
BREVO_API_KEY=
POSTHOG_KEY=
```

### Setup database

Log in to your PostgreSQL database as a superuser, for example `postgres`, and create the database and user. The values should match the database credentials that you specified in `.env` and `flyway.conf`.

### Run database migrations

We use [Flyway command line](https://flywaydb.org/documentation/usage/commandline/) to manage migrations. Install it first before attempting to run database migrations (You can use `brew install flyway` on a Mac.). Once installed, copy `flyway.conf.sample` to `flyway.conf` (this file is ignored by `.gitignore`) and change the values in `flyway.conf` accordingly. After that, you can run migrations with:

```sh
flyway migrate
```

#### Side note: database migrations

We use Flyway to manage database schema migrations. Read more about it [here](https://flywaydb.org/documentation/concepts/migrations.html), especially the section on [file name conventions](https://flywaydb.org/documentation/concepts/migrations.html#naming-1), and [their configuration options](https://flywaydb.org/documentation/configuration/configfile.html).

A few key points to note:

- Files prefixed with `V` means a forward migration, which is the only type of migration file we use.
- We don't use undo migrations, i.e. migration that starts with `U`.
- We use `YYYYDDMMHHMMSS` as the version in our migration files.
- We put our migration files in [migrations](migrations) folder.

## ⚡️ Running Onelook Backend

You can run Onelook Backend in either production mode or in development mode.

### Development

1. When running in development mode, the project will watch code changes and rebuild when changes are detected.

   ```sh
   yarn start:dev
   ```

It will open `localhost:3000` in your default browser.

### Production

1. Build production app

   ```sh
   yarn build
   ```

2. Start service

   ```sh
   yarn start:prod
   ```

Production build is now in `dist/`.

## Contact

Got any questions, you can contact us at [hey@onelook.ai](mailto:hey@onelook.ai?subject=Onelook%20Github%20Repo)

## License

See the [LICENSE](../LICENSE) file for details.
