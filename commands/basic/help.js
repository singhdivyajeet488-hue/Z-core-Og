const { SlashCommandBuilder } = require('@discordjs/builders');
const { 
    TextDisplayBuilder, 
    ContainerBuilder, 
    SeparatorBuilder, 
    SeparatorSpacingSize, 
    MessageFlags, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    StringSelectMenuBuilder 
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays the command list and bot information')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('Get detailed information about a specific command')
                .setRequired(false)
                .setAutocomplete(true)
        ),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const commands = this.getAllCommands();
        
        const filtered = commands
            .filter(cmd => cmd.name.toLowerCase().includes(focusedValue))
            .slice(0, 25)
            .map(cmd => ({
                name: `${cmd.name}${cmd.subcommands.length > 0 ? ` (${cmd.subcommands.length} sub)` : ''}`.substring(0, 100),
                value: cmd.name
            }));

        await interaction.respond(filtered);
    },

    getAllCommands() {
        const allCommands = [];
        const COMMANDS_DIR = path.join(__dirname, '../../commands');
        const EXCESS_COMMANDS_DIR = path.join(__dirname, '../../excesscommands');

        const readCmds = (basePath, configSet) => {
            for (const [category, enabled] of Object.entries(configSet)) {
                if (!enabled) continue;
                const categoryPath = path.join(basePath, category);
                
                if (!fs.existsSync(categoryPath)) continue;

                fs.readdirSync(categoryPath)
                    .filter(file => file.endsWith('.js'))
                    .forEach(file => {
                        try {
                            const cmd = require(path.join(categoryPath, file));
                            const subcommands = this.extractSubcommands(cmd);
                            allCommands.push({
                                name: cmd.data?.name || cmd.name || 'unnamed',
                                description: (cmd.data?.description || cmd.description || 'No description').substring(0, 100),
                                category,
                                subcommands,
                                type: basePath.includes('excesscommands') ? 'prefix' : 'slash'
                            });
                        } catch (err) {
                            console.error(`Error loading ${file}:`, err);
                        }
                    });
            }
        };

        readCmds(COMMANDS_DIR, config.categories);
        readCmds(EXCESS_COMMANDS_DIR, config.excessCommands);
        
        return allCommands;
    },

    extractSubcommands(cmd) {
        const subcommands = [];
        if (!cmd.data?.toJSON) return subcommands;

        const dataJSON = cmd.data.toJSON();
        if (!dataJSON.options || !Array.isArray(dataJSON.options)) return subcommands;

        for (const option of dataJSON.options) {
            if (option.type === 1) {
                subcommands.push({
                    name: option.name,
                    description: (option.description || 'No description').substring(0, 80),
                    type: 'subcommand'
                });
            } else if (option.type === 2 && option.options) {
                const groupSubs = option.options
                    .filter(opt => opt.type === 1)
                    .map(opt => ({
                        name: `${option.name} ${opt.name}`,
                        description: (opt.description || 'No description').substring(0, 80),
                        type: 'group'
                    }));
                subcommands.push(...groupSubs);
            }
        }
        return subcommands;
    },

    async execute(interaction) {
        await interaction.deferReply();

        const specificCommand = interaction.options.getString('command');

        if (specificCommand) {
            return this.showCommandDetails(interaction, specificCommand);
        }

        return this.showMainHelp(interaction);
    },

    async showCommandDetails(interaction, commandName) {
        const commands = this.getAllCommands();
        const cmd = commands.find(c => c.name.toLowerCase() === commandName.toLowerCase());

        if (!cmd) {
            const container = new ContainerBuilder().setAccentColor(0xff3860);
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `## ❌ Command Not Found\n\n` +
                    `The command \`${commandName}\` doesn't exist.\n` +
                    `Use \`/help\` to browse all commands.`
                )
            );
            
            const navRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`help_back_main`)
                    .setLabel('Back to Main Menu')
                    .setEmoji('🏠')
                    .setStyle(ButtonStyle.Primary)
            );
            
            return interaction.editReply({
                components: [container, navRow],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const CATEGORY_ICONS = {
            media: "🎬",
            basic: "📁",
            utility: "🛠️",
            moderation: "🛡️",
            core: "🤖",
            lavalink: "🎵",
            fun: "🎮",
            distube: "🎶",
            setups: "⚙️",
            audio: "🔊"
        };
        const categoryIcon = CATEGORY_ICONS[cmd.category.toLowerCase()] || "📁";
        const prefix = cmd.type === 'slash' ? '/' : config.prefix || '!';

        const displayComponents = [];

        const headerContainer = new ContainerBuilder().setAccentColor(0x5865F2);
        headerContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## ${categoryIcon} \`${prefix}${cmd.name}\`\n\n${cmd.description}`
            )
        );
        displayComponents.push(headerContainer);
        displayComponents.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));

        const infoContainer = new ContainerBuilder().setAccentColor(0x5865F2);
        let infoText = `**Category:** ${cmd.category}\n**Type:** ${cmd.type === 'slash' ? 'Slash Command' : 'Prefix Command'}\n**Total Subcommands:** ${cmd.subcommands.length}`;
        infoContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(infoText)
        );
        displayComponents.push(infoContainer);

        if (cmd.subcommands.length > 0) {
            displayComponents.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
            
            const SUBS_PER_CONTAINER = 15;
            const totalContainers = Math.ceil(cmd.subcommands.length / SUBS_PER_CONTAINER);
            
            for (let i = 0; i < totalContainers; i++) {
                const start = i * SUBS_PER_CONTAINER;
                const end = Math.min(start + SUBS_PER_CONTAINER, cmd.subcommands.length);
                const containerSubs = cmd.subcommands.slice(start, end);
                
                const subContainer = new ContainerBuilder().setAccentColor(0x667eea);
                let subText = `**Subcommands (${start + 1}-${end} of ${cmd.subcommands.length}):**\n\n`;
                
                containerSubs.forEach((sub, idx) => {
                    const globalIdx = start + idx + 1;
                    subText += `**${globalIdx}.** \`${sub.name}\`\n${sub.description}\n\n`;
                });
                
                subContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(subText.trim())
                );
                displayComponents.push(subContainer);
                
                if (i < totalContainers - 1) {
                    displayComponents.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
                }
            }
        }

        displayComponents.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
        const footerContainer = new ContainerBuilder().setAccentColor(0x95A5A6);
        footerContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `💡 **Tip:** Use \`${prefix}${cmd.name} <subcommand>\` to execute`
            )
        );
        displayComponents.push(footerContainer);

        const navRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`help_back_main`)
                .setLabel('Back')
                .setEmoji('🏠')
                .setStyle(ButtonStyle.Success)
        );

        const reply = await interaction.editReply({
            components: [...displayComponents, navRow],
            flags: MessageFlags.IsComponentsV2
        });

        this.setupCommandDetailsCollector(reply, interaction.user.id);
    },

    setupCommandDetailsCollector(message, userId) {
        const collector = message.createMessageComponentCollector({ 
            time: 300000,
            dispose: true 
        });

        collector.on('collect', async (i) => {
            if (i.user.id !== userId) {
                return i.reply({ 
                    content: '⚠️ This help menu can only be used by the command initiator.', 
                    ephemeral: true 
                });
            }

            if (i.customId === 'help_back_main') {
                await i.deferUpdate();
                return this.showMainHelp(i);
            }
        });

        collector.on('end', () => {
            message.edit({ components: [] }).catch(() => {});
        });
    },

    async showMainHelp(interaction) {
        const COMMANDS_DIR = path.join(__dirname, '../../commands');
        const EXCESS_COMMANDS_DIR = path.join(__dirname, '../../excesscommands');
        
        const slashCommands = this.readCommands(COMMANDS_DIR, config.categories, 'slash');
        const prefixCommands = this.readCommands(EXCESS_COMMANDS_DIR, config.excessCommands, 'prefix');

        const chunkedPages = this.createChunkedPages(slashCommands, prefixCommands);

        const viewData = {
            currentPage: 0,
            currentMode: 'slash',
            slashCommands,
            prefixCommands,
            chunkedPages,
            userId: interaction.user.id
        };

        return this.renderHelpView(interaction, viewData);
    },

    createChunkedPages(slashCommands, prefixCommands) {
        const pages = { slash: [], prefix: [] };
        const MAX_ITEMS_PER_PAGE = 60; 

        for (const mode of ['slash', 'prefix']) {
            const commandSet = mode === 'slash' ? slashCommands : prefixCommands;
            
            for (const category in commandSet) {
                const commands = commandSet[category];
                const chunks = [];
                let currentChunk = [];
                let currentItemCount = 0;
                let chunkIndex = 1;

                for (const cmd of commands) {
                    const cmdItemCount = 1 + cmd.subcommands.length; 
                    
                    if (currentItemCount + cmdItemCount > MAX_ITEMS_PER_PAGE && currentChunk.length > 0) {
                        chunks.push({
                            commands: currentChunk,
                            itemCount: currentItemCount,
                            chunkIndex: chunkIndex++
                        });
                        currentChunk = [];
                        currentItemCount = 0;
                    }
                    
                    currentChunk.push(cmd);
                    currentItemCount += cmdItemCount;
                }

                if (currentChunk.length > 0) {
                    chunks.push({
                        commands: currentChunk,
                        itemCount: currentItemCount,
                        chunkIndex: chunkIndex++
                    });
                }

                if (chunks.length === 1) {
                    pages[mode].push({
                        category: category,
                        displayName: category,
                        commands: chunks[0].commands,
                        itemCount: chunks[0].itemCount,
                        isChunked: false
                    });
                } else {
                    chunks.forEach((chunk, idx) => {
                        pages[mode].push({
                            category: category,
                            displayName: `${category} (Part ${idx + 1}/${chunks.length})`,
                            commands: chunk.commands,
                            itemCount: chunk.itemCount,
                            isChunked: true,
                            chunkIndex: idx + 1,
                            totalChunks: chunks.length
                        });
                    });
                }
            }
        }

        return pages;
    },

    readCommands(basePath, configSet, type) {
        const commandData = {};
        
        for (const [category, enabled] of Object.entries(configSet)) {
            if (!enabled) continue;
            
            const categoryPath = path.join(basePath, category);
            if (!fs.existsSync(categoryPath)) continue;

            const commands = fs.readdirSync(categoryPath)
                .filter(file => file.endsWith('.js'))
                .map(file => {
                    try {
                        const cmd = require(path.join(categoryPath, file));
                        const subcommands = this.extractSubcommands(cmd);
                        
                        return {
                            name: cmd.data?.name || cmd.name || 'unnamed',
                            description: (cmd.data?.description || cmd.description || 'No description').substring(0, 100),
                            subcommands,
                            type
                        };
                    } catch (error) {
                        console.error(`Error loading ${file}:`, error);
                        return null;
                    }
                })
                .filter(cmd => cmd !== null);

            if (commands.length > 0) {
                commandData[category] = commands;
            }
        }
        
        return commandData;
    },

    calculateStats(commandSet) {
        let masterCount = 0;
        let subCount = 0;
        
        for (const category in commandSet) {
            masterCount += commandSet[category].length;
            commandSet[category].forEach(cmd => {
                subCount += cmd.subcommands.length;
            });
        }
        
        return { masterCount, subCount, total: masterCount + subCount };
    },

    async renderHelpView(interaction, viewData, message = null) {
        const slashStats = this.calculateStats(viewData.slashCommands);
        const prefixStats = this.calculateStats(viewData.prefixCommands);

        const displayComponents = [];

        if (viewData.currentPage === 0) {
            const statsContainer = new ContainerBuilder().setAccentColor(0x5865F2);
            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `**📊 Command Statistics**\n\n` +
                    `**Slash Commands:** ${slashStats.total} total\n` +
                    `├─ ${slashStats.masterCount} master commands\n` +
                    `└─ ${slashStats.subCount} subcommands\n\n` +
                    `**Prefix Commands:** ${prefixStats.total} total\n` +
                    `├─ ${prefixStats.masterCount} master commands\n` +
                    `└─ ${prefixStats.subCount} subcommands\n\n` +
                    `**Total Pages:** ${viewData.chunkedPages[viewData.currentMode].length}`
                )
            );
            displayComponents.push(statsContainer);
            displayComponents.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));

            const navContainer = new ContainerBuilder().setAccentColor(0x57F287);
            navContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `**🎯 How to Navigate**\n\n` +
                    `🔽 **Dropdown:** Select category/part (max 30 items/page)\n` +
                    `⬅️➡️ **Arrows:** Navigate pages\n` +
                    `🏠 **Home:** Return to main menu\n` +
                    `🔄 **Mode:** Toggle Slash/Prefix\n` +
                    `📋 **Details:** \`/help command:<name>\``
                )
            );
            displayComponents.push(navContainer);
            displayComponents.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));

            const footerContainer = new ContainerBuilder().setAccentColor(0xFEE75C);
            footerContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `💡 **Tip:** Categories are auto-split to show max 30 items per page!`
                )
            );
            displayComponents.push(footerContainer);

        } else {
            const pageIndex = viewData.currentPage - 1;
            const pages = viewData.chunkedPages[viewData.currentMode];
            const page = pages[pageIndex];

            const pageContainer = new ContainerBuilder();
            let pageContent = `## 📁 ${page.displayName}\n\n`;

            const categoryKey = page.category.toLowerCase();
            if (categoryKey === 'media') {
                pageContainer.setAccentColor(0xFF0000); 
            } else if (categoryKey === 'basic') {
                pageContainer.setAccentColor(0x34495E);
            } else if (categoryKey === 'utility') {
                pageContainer.setAccentColor(0xF1C40F);
            } else if (categoryKey === 'moderation') {
                pageContainer.setAccentColor(0xE74C3C);
            } else if (categoryKey === 'core') {
                pageContainer.setAccentColor(0x9B59B6);
            } else if (categoryKey === 'lavalink') {
                pageContainer.setAccentColor(0x1ABC9C);
            } else if (categoryKey === 'fun') {
                pageContainer.setAccentColor(0x2ECC71);
            } else if (categoryKey === 'distube') {
                pageContainer.setAccentColor(0xE67E22);
            } else if (categoryKey === 'setups') {
                pageContainer.setAccentColor(0x7F8C8D);
            } else if (categoryKey === 'audio') {
                pageContainer.setAccentColor(0x3498DB);
            } else {
                pageContainer.setAccentColor(0x5865F2);
            }

            page.commands.forEach((cmd, idx) => {
                const prefix = viewData.currentMode === 'slash' ? '/' : config.prefix || '!';
                pageContent += `**${idx + 1}.** \`${prefix}${cmd.name}\`\n${cmd.description}\n`;
                if (cmd.subcommands.length > 0) {
                    pageContent += `└─ *Subcommands: ${cmd.subcommands.map(s => `\`${s.name}\``).join(', ')}*\n`;
                }
                pageContent += '\n';
            });

            pageContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(pageContent.trim())
            );
            displayComponents.push(pageContainer);
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('help_menu_select')
            .setPlaceholder('📁 Select a category or part...');

        // Safe array initialization to prevent components data parse schemes wrapper crash
        const 
