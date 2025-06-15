# zymo.tv - A powerful, self-hosted media server that rivals Emby and Plex

[![Crypto Payment](https://paybadge.profullstack.com/badge.svg)](https://paybadge.profullstack.com/?tickers=btc%2Ceth%2Csol%2Cusdc)

A powerful, self-hosted media server that rivals Emby and Plex. Stream your movies, TV shows, music, podcasts, and books from anywhere. Host it yourself for complete control, or get started instantly at https://zymo.tv.

Self hosted or signup at https://zymo.tv

![GitHub](https://img.shields.io/github/license/profullstack/zymo-web)
![GitHub issues](https://img.shields.io/github/issues/profullstack/zymo-web)
![GitHub stars](https://img.shields.io/github/stars/profullstack/zymo-web)
![GitHub last commit](https://img.shields.io/github/last-commit/profullstack/zymo-web)

## Why Choose zymo.tv?

**🏠 Self-Hosted Freedom**: Complete control over your media library and data privacy
**☁️ Cloud Option**: Don't want to self-host? Sign up at https://zymo.tv for instant access
**🎬 Universal Media Support**: Movies, TV shows, music, podcasts, audiobooks, and more
**📱 Cross-Platform**: Access your content from any device, anywhere
**🚀 Modern Architecture**: Built with cutting-edge web technologies for speed and reliability

## Features

### Media Management
- **Movies & TV Shows**: Organize and stream your video collection with rich metadata
- **Music Library**: Full-featured music player with playlist support
- **Podcasts**: Subscribe to and manage your favorite podcasts
- **Books & Audiobooks**: Digital library management and reading/listening experience
- **Live TV**: Stream live television content
- **Torrent Integration**: Built-in torrent client for content acquisition

### Technical Features
- **PrimateJS Framework**: Modern, fast web framework
- **Real-time Streaming**: WebSocket-based live streaming capabilities
- **SurrealDB Backend**: High-performance, modern database
- **User Authentication**: Secure user management and access control
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **SEO Optimized**: Built-in blog and SEO features
- **Email Integration**: Mailgun email support
- **SMS Notifications**: Twilio SMS integration
- **Payment Processing**: Stripe integration for subscriptions
- **Affiliate Program**: Built-in referral system
- **Discord Integration**: Community features and notifications ([Join our Discord](https://discord.gg/nxHgWJzTVy))

### Advanced Features
- **Media Transcoding**: Automatic format conversion for compatibility
- **Remote Access**: Secure access to your media from anywhere
- **User Profiles**: Multiple user accounts with personalized libraries
- **Parental Controls**: Content filtering and access restrictions
- **Offline Sync**: Download content for offline viewing
- **Subtitle Support**: Multiple subtitle formats and languages
- **Chapter Support**: Navigate through content with chapter markers

## Getting Started

### Cloud Hosting (Easiest)

Simply visit **https://zymo.tv** and create your account. No setup required!

### Self-Hosting

#### Prerequisites

- Node.js 18+ and npm
- SurrealDB 1.5.5+
- FFmpeg (for media transcoding)
- Redis (optional, for caching)

#### Installation

1. Clone the repository:

    ```shell
    git clone https://github.com/zymo-tv/zymo-web.git
    cd zymo-web
    ```

2. Install dependencies:

    ```shell
    npm install
    ```

3. Configure environment:

    ```shell
    cp .env.local.sample .env.local
    # Edit .env.local with your configuration
    ```

4. Install and start SurrealDB:

    ```shell
    curl -sSf https://install.surrealdb.com | sh
    surreal upgrade --version 1.5.5
    npm run db:start
    ```

5. Run database migrations:

    ```shell
    chmod 755 ./migrations/*.sh
    for f in ./migrations/*.sh; do ./$f; done
    node ./migrations/scripts/migrate.js up
    ```

6. Install FFmpeg (for media processing):

    ```shell
    ./bin/install-ffmpeg.sh
    ```

7. Start the server:

    ```shell
    npm run dev
    ```

    Access your zymo.tv instance at `http://localhost:3000`

## Configuration

### Media Libraries

Configure your media directories in the dashboard:
- Movies: `/path/to/movies`
- TV Shows: `/path/to/tv`
- Music: `/path/to/music`
- Podcasts: Managed through RSS feeds
- Books: `/path/to/books`

### Remote Access

For remote access, configure your router's port forwarding or use a reverse proxy like nginx.

### Transcoding

zymo.tv automatically transcodes media for optimal streaming. Configure transcoding settings in the admin panel based on your server's capabilities.

## Comparison with Competitors

| Feature | zymo.tv | Plex | Emby |
|---------|---------|------|------|
| Self-Hosted | ✅ | ✅ | ✅ |
| Cloud Option | ✅ | ❌ | ❌ |
| Open Source | ✅ | ❌ | ❌ |
| Modern UI | ✅ | ✅ | ✅ |
| Live TV | ✅ | ✅ | ✅ |
| Podcasts | ✅ | ❌ | ❌ |
| Books/Audiobooks | ✅ | ❌ | ❌ |
| Torrent Integration | ✅ | ❌ | ❌ |
| No License Fees | ✅ | ❌ | ❌ |

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

- Fork the repository and create a feature branch
- Follow our coding standards and conventions
- Submit a pull request with a clear description of changes
- Join our Discord community for discussions: https://discord.gg/nxHgWJzTVy

## Support

- **Documentation**: Visit our wiki for detailed guides
- **Community**: Join our Discord server: https://discord.gg/nxHgWJzTVy
- **Issues**: Report bugs on GitHub
- **Commercial Support**: Available for enterprise deployments

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Ready to take control of your media?** 
- 🏠 **Self-host**: Clone this repo and follow the installation guide
- ☁️ **Cloud**: Sign up instantly at **https://zymo.tv**
