# Fastest-Engineer-Web: URL Shortener

Fastest-Engineer-Web: Ship your SaaS in days, not months. Start building and working on the features that matter and get to market quicker. Save weeks of work by using a ready made SAAS boilerplate.

![GitHub](https://img.shields.io/github/license/profullstack/hynt-web)
![GitHub issues](https://img.shields.io/github/issues/profullstack/hynt-web)
![GitHub stars](https://img.shields.io/github/stars/profullstack/hynt-web)
![GitHub last commit](https://img.shields.io/github/last-commit/profullstack/hynt-web)

## Features

-   PrimateJS boilerplate
-   SEO & Blog
-   Mailgun emails
-   Twilio SMS
-   Stripe
-   SurrealDB 1.x
-   SurrealDB User Auth
-   Svelte Components
-   ChatGPT prompts for terms & privacy
-   Discord community & Leaderboard
-   Lifetime updates
-   Pay once. Build unlimited projects!

## Getting Started

### Prerequisites

To run Fastest-Web on your server, make sure you have the following prerequisites:

-   Node.js and npm installed.
-   Database system (e.g., MySQL, PostgreSQL, MongoDB, SurrealDB) for storing link data.
-   Redis (optional) for caching and performance optimization.

### Installation

1. Clone the Fastest-Web repository to your server:

    ```shell
    git clone https://github.com/fastestengineer/fastest-web.git
    ```

2. Install project dependencies:

    ```shell
    cd fastest-web
    npm install
    ```

3. Configure your database connection and other settings in `.env` files.

    # be sure to delete windows and/or linux variables if not using that OS

    cp .env.sample .env.local

4. Start the Fastest-Web server:

    ```shell
    npm run db:start
    # new window
    npm run dev
    ```

    The application will run on the default port (e.g., 3000). You can access it via your web browser at `http://localhost:3000`.

## Contributing

We welcome contributions from the community. If you'd like to contribute to Fastest-Web, please follow these guidelines:

-   Fork the repository and create a new branch.
-   Ensure your code follows the coding standards and conventions.
-   Submit a pull request with a clear description of your changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
