# VX-Core - Professional Discord Bot

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Discord.js](https://img.shields.io/badge/discord.js-v14-blue)
![Node.js](https://img.shields.io/badge/node.js-v18+-green)
![License](https://img.shields.io/badge/license-MIT-green)

A fully-featured, production-ready Discord bot built with discord.js v14 and Node.js. Features ticket system, giveaways, credit system, level system, moderation commands, and more.

## ✨ Features

### Core Features
- **Slash Commands** - Modern command system with discord.js v14
- **Ticket System** - Support tickets with categories and buttons
- **Giveaway System** - Create and manage giveaways with reactions
- **Credit System** - Award and manage user credits
- **Level System** - XP and leveling for active members
- **Moderation Commands** - Ban, kick, timeout, clear, warn
- **Auto Role** - Automatically assign roles to new members
- **Welcome & Leave Messages** - Customizable member messages
- **Verification System** - Button-based verification
- **Logging System** - Log all guild events
- **MongoDB Support** - Full database integration

### Advanced Features
- **Security Managers** - Configuration, Security, Logger, and Cache management
- **Protection Modules** - Anti-raid, anti-nuke, anti-spam, anti-link, and more
- **Backup & Recovery** - Guild backup and recovery system
- **Whitelist & Blacklist** - User and guild management
- **Advanced Logging** - Detailed event tracking and auditing

## 📋 Requirements

- Node.js 18.0 or higher
- npm or yarn
- Discord bot token
- MongoDB database (Atlas recommended)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/moaazmohammed080-cell/vx-core.git
cd vx-core
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Discord Bot
BOT_TOKEN=your_discord_bot_token_here
GUILD_ID=your_guild_id

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vx-core?retryWrites=true&w=majority

# Bot Settings
BOT_STATUS=online
BOT_ACTIVITY=Slash Commands

# Roles
VERIFICATION_ROLE_ID=your_verification_role_id
MOD_ROLE_ID=your_mod_role_id
ADMIN_ROLE_ID=your_admin_role_id

# Channels
LOG_CHANNEL_ID=your_log_channel_id
WELCOME_CHANNEL_ID=your_welcome_channel_id
TICKET_LOG_CHANNEL_ID=your_ticket_log_channel_id
GIVEAWAY_LOG_CHANNEL_ID=your_giveaway_log_channel_id

# Features
TICKET_SYSTEM_ENABLED=true
GIVEAWAY_SYSTEM_ENABLED=true
CREDIT_SYSTEM_ENABLED=true
LEVEL_SYSTEM_ENABLED=true
VERIFICATION_ENABLED=true
AUTO_ROLE_ENABLED=true
```

### 4. Create Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Go to "Bot" section and click "Add Bot"
4. Copy the token and paste it in `.env`
5. Enable these Intents:
   - Guilds
   - Guild Members
   - Guild Messages
   - Message Content
   - Direct Messages
6. Go to OAuth2 > URL Generator
7. Select scope: `bot`
8. Select permissions: `Administrator`
9. Copy and open the generated URL to invite the bot

### 5. Set Up MongoDB

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Create a database user
4. Get the connection string
5. Paste it in `.env` as `MONGODB_URI`

### 6. Run the Bot

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

## 📁 Project Structure

```
vx-core/
├── src/
│   ├── commands/              # All bot commands
│   │   ├── moderation/        # Moderation commands
│   │   ├── ticket/            # Ticket system
│   │   ├── giveaway/          # Giveaway system
│   │   ├── credit/            # Credit system
│   │   ├── level/             # Level system
│   │   └── utility/           # Utility commands
│   ├── events/                # Discord.js event handlers
│   ├── handlers/              # Command, event, button handlers
│   ├── database/              # MongoDB connection & models
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Ticket.js
│   │   │   ├── Giveaway.js
│   │   │   └── Guild.js
│   │   └── connect.js
│   ├── config/                # Configuration files
│   ├── core/                  # Core managers
│   ├── protection/            # Protection modules
│   └── utils/                 # Utility functions
├── .env                       # Environment variables
├── .env.example               # Example configuration
├── package.json               # Dependencies
├── index.js                   # Bot entry point
└── README.md                  # Documentation
```

## 🎮 Available Commands

### Moderation
- `/ban` - Ban a member from the server
- `/kick` - Kick a member from the server
- `/timeout` - Timeout a member
- `/clear` - Clear messages from channel
- `/warn` - Warn a member

### Ticket System
- `/ticket` - Create ticket setup message
- `/closeticket` - Close a ticket

### Giveaway System
- `/giveaway` - Start a new giveaway
- `/endgiveaway` - End an active giveaway

### Credit System
- `/addcredit` - Add credits to user
- `/removecredit` - Remove credits from user
- `/balance` - Check credit balance

### Level System
- `/rank` - Check user rank and profile

### Utility
- `/ping` - Check bot latency

## 🔒 Security Features

### Protection Modules
- **Anti-Raid** - Prevent raid attacks
- **Anti-Nuke** - Protect against mass deletion
- **Anti-Spam** - Filter spam messages
- **Anti-Link** - Block unwanted links
- **Anti-Invite** - Block Discord invites
- **Anti-Webhook** - Detect webhook abuse
- **Anti-Bot** - Control bot addition
- **Anti-Channel** - Monitor channel changes
- **Anti-Role** - Monitor role changes
- **Anti-Guild** - Monitor guild changes
- **Whitelist/Blacklist** - User management
- **Backup & Recovery** - Guild backup system

## 🗄️ Database Models

### User
- User profile, credits, XP, level
- Verification status
- Warning history
- Timeout records

### Ticket
- Ticket information
- Status tracking
- Message history
- Close reason

### Giveaway
- Giveaway details
- Participants
- Winners
- Status

### Guild
- Guild configuration
- Feature settings
- Channel mappings
- Logging configuration

## 📝 Configuration

### Enabling/Disabling Features

Edit `.env` to enable or disable features:

```env
TICKET_SYSTEM_ENABLED=true
GIVEAWAY_SYSTEM_ENABLED=true
CREDIT_SYSTEM_ENABLED=true
LEVEL_SYSTEM_ENABLED=true
VERIFICATION_ENABLED=true
AUTO_ROLE_ENABLED=true
```

## 🛡️ Security

- Keep `.env` file secret (added to `.gitignore`)
- Use strong Discord bot token
- Secure MongoDB credentials
- Regularly update dependencies
- Enable audit logs
- Use bot permission restrictions

## 🔧 Troubleshooting

### Bot not responding to commands
- Verify bot has `applications.commands` scope
- Check bot permissions
- Restart the bot

### Database connection errors
- Verify `MONGODB_URI` is correct
- Check MongoDB cluster whitelist
- Ensure database user permissions

### Permission errors
- Ensure bot role is above user roles
- Check channel permissions
- Verify required permissions

## 📦 Dependencies

- **discord.js** - Discord API wrapper
- **mongoose** - MongoDB object modeling
- **dotenv** - Environment variable loader
- **colors** - Terminal string styling

## 📝 License

MIT License - feel free to use this project!

## 👨‍💻 Author

Created by moaazmohammed080-cell

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## 📞 Support

For support, issues, or questions, please open a GitHub issue.

---

**Made with ❤️ for the Discord community**
