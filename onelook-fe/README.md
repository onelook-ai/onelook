<p align="center">
<img src="https://github.com/user-attachments/assets/9034f499-be55-4e53-bcd7-70b66a20f2c7" width="150" height="150" style="margin-left: auto; margin-right: auto;" />
</p>

# Onelook Frontend

This is the frontend for [Onelook](https://github.com/onelook-ai/onelook), built using NextJS and Refine.dev.

## Get Started

### Requirements

- Nodejs >= v20
- [Onelook backend service](../onelook-be/) is required for this app to function fully.

### Installation

1. Git clone this repo

   ```sh
   git clone git@github.com:onelook-ai/onelook.git && cd onelook/onelook-fe
   ```

2. Install dependencies

   ```sh
   yarn
   ```

### Copy sample files

Copy `sample.env` into `.env` and modify the values as necessary.
If you are running all of your services in development mode, you can leave the default values unchanged.

## ⚡️ Running Onelook

You can run Onelook in either production mode or in development mode.

### Development

1. When running in development mode, the project will watch code changes and rebuild when changes are detected.

   ```sh
   yarn dev
   ```

It will open `localhost:3000` in your default browser.

### Production

1. Build production app

   ```sh
   yarn build
   ```

2. Start service

   ```sh
   yarn start
   ```

## Contact

Got any questions, you can contact us at [hey@onelook.ai](mailto:hey@onelook.ai?subject=Onelook%20Github%20Repo)

## License

See the [LICENSE](../LICENSE) file for details.
