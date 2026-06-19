/*
 ██████▗  ██▗      ██████  ████████▗███████████▗██▗   ██▗█████████
██▄▄▄▄▄  ██▄     ██▄▄▄▄▄  ██▄▄▄▄▄▄▄██▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
██▌  ███ ██▌     ███████  ████████▌█████████████▌   ██▌█████████▌
██▌   ██▌██▌     ██▄▄▄▄▄  ██▄▄▄▄▄▄▄█████▄▄▄▄▄▄▄    ██▌█████▄▄▄▄▄ 
█████████▌███████████████▌█████████▌█████████████▌   ██▌█████████▌
 ▀▀▀▀▀▀▀ ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀   ▀▀▀▀▀▀▀▀▀▀▀▀▀

-------------------------------------
📡 Discord : https://discord.gg/xQF9f9yUEM
🌐 Website : https://glaceyt.com
🎥 YouTube : https://youtube.com/@GlaceYT
✅ Verified | 🧩 Tested | ⚙️ Stable
-------------------------------------
> © 2025 GlaceYT.com | All rights reserved.
*/
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SectionBuilder, ThumbnailBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const musicIcons = require('../../UI/icons/musicicons');
const cmdIcons = require('../../UI/icons/commandicons');
const { autoplayCollection } = require('../../mongodb');
const { playlistCollection } = require('../../mongodb');
const SpotifyWebApi = require('spotify-web-api-node');
const { getData } = require('spotify-url-info')(fetch);
const config = require('../../config.js');

const spotifyApi = new SpotifyWebApi({
    clientId: config.spotifyClientId,
    clientSecret: config.spotifyClientSecret,
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('🎵 Advanced music player with V2 components')
        .addSubcommand(subcommand =>
            subcommand
                .setName('play')
                .setDescription('Play a song or playlist in the voice channel.')
                .addStringOption(option =>
                    option.setName('query')
                        .setDescription('Enter the song name or URL.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('nowplaying')
                .setDescription('Get information about the currently playing song.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('loop')
                .setDescription('Toggle looping mode for the current track or the entire queue.')
                .addStringOption(option =>
                    option.setName('mode')
                        .setDescription('Select loop mode: none, track, or queue.')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Disable Loop', value: 'none' },
                            { name: 'Track Loop', value: 'track' },
                            { name: 'Queue Loop', value: 'queue' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('pause')
                .setDescription('Pause the currently playing song.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('resume')
                .setDescription('Resume the paused song.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('shuffle')
                .setDescription('Shuffle the queue.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('skip')
                .setDescription('Skip the current song.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stop')
                .setDescription('Stop the music and clear the queue.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('queue')
                .setDescription('View the current music queue.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a specific song from the queue.')
                .addIntegerOption(option =>
                    option.setName('track')
                        .setDescription('Track number to remove.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('seek')
                .setDescription('Seek to a specific position in the current track.')
                .addIntegerOption(option =>
                    option.setName('position')
                        .setDescription('Seek position in seconds.')
                        .setRequired(true)
                        .setMinValue(1)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('createplaylist')
                .setDescription('Create a new playlist.')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Playlist name.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('visibility')
                        .setDescription('Choose if the playlist is public or private.')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Public', value: 'public' },
                            { name: 'Private', value: 'private' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('playplaylist')
                .setDescription('Play a saved playlist.')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Playlist name.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('viewmyplaylists')
                .setDescription('View your saved playlists.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('viewmyplaylistsongs')
                .setDescription('View songs in your playlist.')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Playlist name.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('allplaylists')
                .setDescription('View all public playlists.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('deletesong')
                .setDescription('Remove a song from your playlist.')
                .addStringOption(option =>
                    option.setName('playlist')
                        .setDescription('Playlist name.')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('index')
                        .setDescription('Song index to remove.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('deleteplaylist')
                .setDescription('Delete your playlist.')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Playlist name.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('autoplay')
                .setDescription('Enable or disable autoplay.')
                .addBooleanOption(option =>
                    option.setName('enabled')
                        .setDescription('Enable or disable autoplay.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('addsong')
                .setDescription('Add a song to a playlist.')
                .addStringOption(option =>
                    option.setName('playlist')
                        .setDescription('The playlist name.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('song')
                        .setDescription('Enter song name or URL.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('volume')
                .setDescription('Set the music volume (0-100).')
                .addIntegerOption(option =>
                    option.setName('level')
                        .setDescription('Volume level (0-100).')
                        .setRequired(true))),

    async execute(interaction) {
        try {
            await interaction.deferReply();
            const subcommand = interaction.options.getSubcommand();
            const userId = interaction.user.id;
            const guildId = interaction.guild.id;
            const member = interaction.member;
            const { channel } = member.voice;
            const client = interaction.client;

      
            const checkVoiceChannel = async () => {
                if (!channel) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**❌ VOICE CHANNEL REQUIRED**\nYou must be connected to a voice channel to use music commands.\n\nPlease join a voice channel and try again.')
                        );
                    
                    const reply = await interaction.editReply({ 
                        components: [errorContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                    setTimeout(() => reply.delete().catch(() => {}), 5000);
                    return false;
                }
        
                const botVoiceChannel = interaction.guild.members.me?.voice.channel;
                
                if (botVoiceChannel && botVoiceChannel.id !== channel.id) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**❌ CHANNEL CONFLICT**\nI\'m currently active in a different voice channel.\n\nPlease join the same channel or wait for the current session to end.')
                        );
                    
                    const reply = await interaction.editReply({ 
                        components: [errorContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                    setTimeout(() => reply.delete().catch(() => {}), 5000);
                    return false;
                }
                
             
                const permissions = channel.permissionsFor(client.user);
                if (!permissions.has(PermissionFlagsBits.Connect) || !permissions.has(PermissionFlagsBits.Speak)) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**❌ INSUFFICIENT PERMISSIONS**\nI need permission to connect and speak in the voice channel.\n\nPlease check my permissions and try again.')
                        );
                    
                    const reply = await interaction.editReply({ 
                        components: [errorContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                    setTimeout(() => reply.delete().catch(() => {}), 5000);
                    return false;
                }

                return true;
            };

      
            const getOrCreatePlayer = async () => {
                let player = client.riffy.players.get(guildId);
                
                if (!player) {
                    try {
                        player = await client.riffy.createConnection({
                            guildId,
                            voiceChannel: channel.id,
                            textChannel: interaction.channel.id,
                            deaf: true
                        });
                    } catch (error) {
                        console.error('Error creating player:', error);
                        
                        const errorContainer = new ContainerBuilder()
                            .setAccentColor(0xff4757)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**❌ CONNECTION FAILED**\nUnable to connect to the voice channel.\n\nPlease try again or contact support.')
                            );

                        await interaction.editReply({ 
                            components: [errorContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                        return null;
                    }
                }
                
                return player;
            };


            const checkPlayerExists = async () => {
                const player = client.riffy.players.get(guildId);
                
                if (!player) {
                    const noPlayerContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**❌ NO ACTIVE PLAYER**')
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('There is no active music player in this server.\n\n**💡 Quick Fix:**\nUse `/music play` to start playing music and initialize the player.')
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**🎵 Get Started:**\n• Join a voice channel\n• Use `/music play <song name>` to begin\n• Enjoy high-quality audio streaming')
                        );
                
                    const reply = await interaction.editReply({ 
                        components: [noPlayerContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                    setTimeout(() => reply.delete().catch(() => {}), 6000);
                    return false;
                }
                
                return player;
            };

            // Show queue as an embed
            const showQueueEmbed = async (interaction, player) => {
                if (!player || !player.queue || player.queue.length === 0) {
                    return {
                        embeds: [new EmbedBuilder()
                            .setColor(0xff4757)
                            .setTitle('📋 QUEUE')
                            .setDescription('The queue is empty!')
                            .setFooter({ text: 'Add songs with /music play' })
                        ],
                        ephemeral: true
                    };
                }

                const queue = player.queue;
                const queueList = queue.slice(0, 10).map((track, i) => 
                    `**${i + 1}.** ${track.info.title} - ${track.info.author || 'Unknown'}`
                ).join('\n');

                const embed = new EmbedBuilder()
                    .setColor(0xdc92ff)
                    .setTitle('🎶 MUSIC QUEUE')
                    .setDescription(queueList)
                    .addFields(
                        { name: '📊 Total Tracks', value: `${queue.length}`, inline: true },
                        { name: '⏱️ Estimated Duration', value: `~${Math.round(queue.length * 3.5)} minutes`, inline: true },
                        { name: '🔄 Loop Mode', value: player.loop || 'None', inline: true }
                    )
                    .setFooter({ text: `Requested by ${interaction.user.username}` })
                    .setTimestamp();

                if (queue.length > 10) {
                    embed.setFooter({ text: `...and ${queue.length - 10} more tracks` });
                }

                return { embeds: [embed], ephemeral: true };
            };

            // Create button collector for now playing messages
            const createButtonCollector = async (reply, player) => {
                const collector = reply.createMessageComponentCollector({ 
                    time: 120000 // 2 minutes
                });

                // Listen for track end event to delete the message
                const trackEndHandler = () => {
                    reply.delete().catch(() => {});
                    collector.stop();
                };

                // Store the handler to clean up later
                const handlerKey = `trackEnd_${reply.id}`;
                client[handlerKey] = trackEndHandler;

                // Listen for player track end
                player.once('trackEnd', trackEndHandler);

                collector.on('collect', async (i) => {
                    if (i.user.id !== interaction.user.id) {
                        await i.reply({ 
                            content: '❌ You cannot control this player!', 
                            ephemeral: true 
                        });
                        return;
                    }

                    const player = client.riffy.players.get(guildId);
                    
                    if (!player || !player.current) {
                        await i.reply({ 
                            content: '❌ No track is currently playing!', 
                            ephemeral: true 
                        });
                        return;
                    }

                    const currentPosition = player.position;
                    const trackDuration = player.current.info.length;

                    try {
                        let newPosition = currentPosition;

                        // Handle seek buttons
                        if (i.customId.startsWith('seek_back_10')) {
                            newPosition = Math.max(0, currentPosition - 10000);
                            await player.seek(newPosition);
                            await i.reply({ content: `⏪ Rewound 10 seconds!`, ephemeral: true });
                        } 
                        else if (i.customId.startsWith('seek_back_5')) {
                            newPosition = Math.max(0, currentPosition - 5000);
                            await player.seek(newPosition);
                            await i.reply({ content: `◀️ Rewound 5 seconds!`, ephemeral: true });
                        }
                        else if (i.customId.startsWith('seek_forward_5')) {
                            newPosition = Math.min(trackDuration, currentPosition + 5000);
                            await player.seek(newPosition);
                            await i.reply({ content: `▶️ Forward 5 seconds!`, ephemeral: true });
                        }
                        else if (i.customId.startsWith('seek_forward_10')) {
                            newPosition = Math.min(trackDuration, currentPosition + 10000);
                            await player.seek(newPosition);
                            await i.reply({ content: `⏩ Forward 10 seconds!`, ephemeral: true });
                        }
                        // Handle volume buttons
                        else if (i.customId.startsWith('volume_down_')) {
                            const newVolume = Math.max(0, player.volume - 10);
                            player.setVolume(newVolume);
                            await i.reply({ content: `🔉 Volume decreased to ${newVolume}%`, ephemeral: true });
                        }
                        else if (i.customId.startsWith('volume_up_')) {
                            const newVolume = Math.min(100, player.volume + 10);
                            player.setVolume(newVolume);
                            await i.reply({ content: `🔊 Volume increased to ${newVolume}%`, ephemeral: true });
                        }
                        // Handle playback speed
                        else if (i.customId.startsWith('speed_')) {
                            const speedMap = {
                                '0.5': '0.5x',
                                '0.75': '0.75x',
                                '1.0': '1.0x',
                                '1.25': '1.25x',
                                '1.5': '1.5x',
                                '2.0': '2.0x'
                            };
                            const speed = i.customId.split('_')[1];
                            await player.setSpeed(parseFloat(speed));
                            await i.reply({ content: `⏩ Playback speed set to **${speedMap[speed] || speed}**`, ephemeral: true });
                        }
                        // Handle queue button
                        else if (i.customId.startsWith('queue_')) {
                            const queueData = await showQueueEmbed(i, player);
                            await i.reply(queueData);
                            return;
                        }
                        // Handle existing controls
                        else if (i.customId.startsWith('pause_')) {
                            if (player.paused) {
                                player.pause(false);
                                await i.reply({ content: '▶️ Resumed playback!', ephemeral: true });
                            } else {
                                player.pause(true);
                                await i.reply({ content: '⏸️ Paused playback!', ephemeral: true });
                            }
                        }
                        else if (i.customId.startsWith('skip_')) {
                            player.stop();
                            await i.reply({ content: '⏭️ Skipped track!', ephemeral: true });
                        }
                        else if (i.customId.startsWith('stop_')) {
                            player.destroy();
                            await i.reply({ content: '⏹️ Stopped playback!', ephemeral: true });
                            collector.stop();
                            reply.delete().catch(() => {});
                        }
                        else if (i.customId.startsWith('loop_')) {
                            const loopModes = ['none', 'track', 'queue'];
                            const currentIndex = loopModes.indexOf(player.loop || 'none');
                            const nextMode = loopModes[(currentIndex + 1) % loopModes.length];
                            player.setLoop(nextMode);
                            await i.reply({ content: `🔄 Loop mode set to: **${nextMode}**`, ephemeral: true });
                        }
                        else if (i.customId.startsWith('shuffle_')) {
                            if (player.queue.length > 0) {
                                player.queue.shuffle();
                                await i.reply({ content: '🔀 Queue shuffled!', ephemeral: true });
                            } else {
                                await i.reply({ content: '❌ Queue is empty!', ephemeral: true });
                            }
                        }

                        // Update the now playing message with new position
                        if (player.current && !i.customId.startsWith('stop_') && !i.customId.startsWith('queue_')) {
                            const updatedEmbed = createNowPlayingEmbed(player, interaction);
                            if (updatedEmbed) {
                                await i.editReply({ 
                                    components: [updatedEmbed]
                                });
                            }
                        }

                    } catch (error) {
                        console.error('Button interaction error:', error);
                        await i.reply({ 
                            content: '❌ An error occurred while processing your request.', 
                            ephemeral: true 
                        });
                    }
                });

                collector.on('end', () => {
                    // Clean up the event listener
                    if (client[handlerKey]) {
                        player.off('trackEnd', client[handlerKey]);
                        delete client[handlerKey];
                    }
                });

                return collector;
            };

            // Helper function to create the now playing embed with buttons
            const createNowPlayingEmbed = (player, interaction) => {
                if (!player || !player.current) return null;
                
                const guildId = interaction.guild.id;
                const currentTrack = player.current;
                const isPaused = player.paused;
                
                // Get requester info with @mention
                const requester = currentTrack.requester;
                const requesterMention = requester ? `<@${requester.id}>` : 'Unknown';
                
                // Row 1: Seek buttons (-10s, -5s, +5s, +10s)
                const row1 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`seek_back_10_${guildId}`)
                            .setLabel('⏪ -10s')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId(`seek_back_5_${guildId}`)
                            .setLabel('◀️ -5s')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId(`seek_forward_5_${guildId}`)
                            .setLabel('▶️ +5s')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId(`seek_forward_10_${guildId}`)
                            .setLabel('⏩ +10s')
                            .setStyle(ButtonStyle.Primary)
                    );

                // Row 2: Volume and Playback Speed buttons
                const row2 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`volume_down_${guildId}`)
                            .setLabel('🔉 Vol -')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId(`volume_up_${guildId}`)
                            .setLabel('🔊 Vol +')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId(`speed_0.5_${guildId}`)
                            .setLabel('0.5x')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId(`speed_1.0_${guildId}`)
                            .setLabel('1.0x')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId(`speed_1.5_${guildId}`)
                            .setLabel('1.5x')
                            .setStyle(ButtonStyle.Secondary)
                    );

                // Row 3: More speed and controls
                const row3 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`speed_0.75_${guildId}`)
                            .setLabel('0.75x')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId(`speed_1.25_${guildId}`)
                            .setLabel('1.25x')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId(`speed_2.0_${guildId}`)
                            .setLabel('2.0x')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId(`loop_${guildId}`)
                            .setLabel(`🔄 ${player.loop || 'Loop'}`)
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId(`shuffle_${guildId}`)
                            .setLabel('🔀 Shuffle')
                            .setStyle(ButtonStyle.Secondary)
                    );

                // Row 4: Control buttons (Pause, Skip, Stop, Queue)
                const row4 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`pause_${guildId}`)
                            .setLabel(isPaused ? '▶️ Resume' : '⏸️ Pause')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId(`skip_${guildId}`)
                            .setLabel('⏭️ Skip')
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId(`stop_${guildId}`)
                            .setLabel('⏹️ Stop')
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId(`queue_${guildId}`)
                            .setLabel('📋 Queue')
                            .setStyle(ButtonStyle.Secondary)
                    );

                return new ContainerBuilder()
                    .setAccentColor(0xdc92ff)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**🎵 NOW PLAYING**')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addSectionComponents(
                        section => section
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**${currentTrack.info.title}**\n\n**Artist:** ${currentTrack.info.author || 'Unknown'}\n**Duration:** ${formatDuration(currentTrack.info.length)}\n**Source:** ${currentTrack.info.sourceName || 'YouTube'}\n**Quality:** High Definition\n\n**Requested by:** ${requesterMention}\n**Queue Position:** Playing Now\n**Volume:** ${player.volume}%\n**Loop:** ${player.loop || 'none'}\n**Status:** ${isPaused ? '⏸️ Paused' : '▶️ Playing'}`)
                            )
                            .setThumbnailAccessory(
                                thumbnail => thumbnail
                                    .setURL(currentTrack.info.artwork || currentTrack.requester?.avatarURL || 'https://via.placeholder.com/300x300')
                                    .setDescription('Now Playing')
                            )
                    )
                    .addSeparatorComponents(separator => separator)
                    .addActionRowComponents(
                        row => row.addComponents(row1.components)
                    )
                    .addActionRowComponents(
                        row => row.addComponents(row2.components)
                    )
                    .addActionRowComponents(
                        row => row.addComponents(row3.components)
                    )
                    .addActionRowComponents(
                        row => row.addComponents(row4.components)
                    );
            };

            // Helper functions
            const formatDuration = (ms) => {
                const seconds = Math.floor(ms / 1000);
                const minutes = Math.floor(seconds / 60);
                const hours = Math.floor(minutes / 60);
                
                if (hours > 0) {
                    return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
                } else {
                    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
                }
            };
  
            switch (subcommand) {
                case 'play': {
                    try {
                        if (!await checkVoiceChannel()) return;
                    
                        const query = interaction.options.getString('query');
                        const user = interaction.user;
                        let player = await getOrCreatePlayer();
                        if (!player) return;
                
                        // Send loading message
                        const loadingContainer = new ContainerBuilder()
                            .setAccentColor(0xffa500)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**🔄 LOADING...**\nSearching for your track. Please wait...')
                            );

                        await interaction.editReply({ 
                            components: [loadingContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });

                        // Track resolution logic
                        if (query.includes('spotify.com')) {
                            try {
                                const spotifyData = await getData(query);
                                const token = await spotifyApi.clientCredentialsGrant();
                                spotifyApi.setAccessToken(token.body.access_token);
                        
                                let trackList = [];
                        
                                if (spotifyData.type === 'track') {
                                    const searchQuery = `${spotifyData.name} - ${spotifyData.artists.map(a => a.name).join(', ')}`;
                                    trackList.push(searchQuery);
                                } else if (spotifyData.type === 'playlist') {
                                    const playlistId = query.split('/playlist/')[1].split('?')[0];
                                    let offset = 0;
                                    const limit = 100;
                                    let fetched = [];
                        
                                    do {
                                        const data = await spotifyApi.getPlaylistTracks(playlistId, { limit, offset });
                                        fetched = data.body.items.filter(item => item.track).map(item =>
                                            `${item.track.name} - ${item.track.artists.map(a => a.name).join(', ')}`
                                        );
                                        trackList.push(...fetched);
                                        offset += limit;
                                    } while (fetched.length === limit);
                                }
                
                                if (trackList.length === 0) {
                                    const noTracksContainer = new ContainerBuilder()
                                        .setAccentColor(0xff4757)
                                        .addTextDisplayComponents(
                                            textDisplay => textDisplay.setContent('**❌ NO TRACKS FOUND**\nNo valid tracks found in this Spotify link.\n\nPlease verify the URL and try again.')
                                        );

                                    const reply = await interaction.editReply({ 
                                        components: [noTracksContainer], 
                                        flags: MessageFlags.IsComponentsV2 
                                    });
                                    setTimeout(() => reply.delete().catch(() => {}), 5000);
                                    return;
                                }
                        
                                let added = 0;
                                for (const trackQuery of trackList) {
                                    const result = await client.riffy.resolve({ query: trackQuery, requester: user });
                                    if (result && result.tracks && result.tracks.length > 0) {
                                        const resolvedTrack = result.tracks[0];
                                        resolvedTrack.requester = {
                                            id: user.id,
                                            username: user.username,
                                            avatarURL: user.displayAvatarURL()
                                        };
                                        player.queue.add(resolvedTrack);
                                        added++;
                                    }
                                }
                        
                                if (!player.playing && !player.paused) {
                                    player.play();
                                }
                                
                            } catch (spotifyError) {
                                console.error('Spotify error:', spotifyError);
                                
                                const spotifyErrorContainer = new ContainerBuilder()
                                    .setAccentColor(0xff4757)
                                    .addTextDisplayComponents(
                                        textDisplay => textDisplay.setContent('**❌ SPOTIFY ERROR**')
                                    )
                                    .addSeparatorComponents(separator => separator)
                                    .addTextDisplayComponents(
                                        textDisplay => textDisplay.setContent('**Failed to process Spotify link**\n\nThis could be due to:\n• Invalid or private Spotify URL\n• API rate limiting\n• Spotify service issues\n• Configuration problems')
                                    )
                                    .addSeparatorComponents(separator => separator)
                                    .addTextDisplayComponents(
                                        textDisplay => textDisplay.setContent('**💡 Solutions:**\n• Try a different Spotify link\n• Ensure the playlist/track is public\n• Use YouTube or direct search instead\n• Contact support if issue persists')
                                    );
                                
                                const reply = await interaction.editReply({ 
                                    components: [spotifyErrorContainer], 
                                    flags: MessageFlags.IsComponentsV2 
                                });
                                setTimeout(() => reply.delete().catch(() => {}), 10000);
                                return;
                            }
                        }  
                        else if (query.includes('youtube.com') || query.includes('youtu.be')) {
                            let isPlaylist = query.includes('list=');
                            let isMix = query.includes('list=RD');
                    
                            if (isMix) {
                                const mixContainer = new ContainerBuilder()
                                    .setAccentColor(0xff4757)
                                    .addTextDisplayComponents(
                                        textDisplay => textDisplay.setContent('**❌ UNSUPPORTED CONTENT**\nYouTube mixes and auto-generated playlists are not supported.\n\nPlease use regular playlists, individual videos, or search queries.')
                                    );
                            
                                const reply = await interaction.editReply({ 
                                    components: [mixContainer], 
                                    flags: MessageFlags.IsComponentsV2 
                                });
                                setTimeout(() => reply.delete().catch(() => {}), 5000);
                                return;
                            }
                            
                            const resolve = await client.riffy.resolve({ query, requester: user });
                            if (!resolve || !resolve.tracks || resolve.tracks.length === 0) {
                                const noResultsContainer = new ContainerBuilder()
                                    .setAccentColor(0xff4757)
                                    .addTextDisplayComponents(
                                        textDisplay => textDisplay.setContent('**❌ NO RESULTS FOUND**\nCouldn\'t find any tracks matching your YouTube link.\n\nPlease check the URL and try again.')
                                    );

                                const reply = await interaction.editReply({ 
                                    components: [noResultsContainer], 
                                    flags: MessageFlags.IsComponentsV2 
                                });
                                setTimeout(() => reply.delete().catch(() => {}), 5000);
                                return;
                            }
                            
                            if (isPlaylist) {
                                for (const track of resolve.tracks) {
                                    track.requester = {
                                        id: user.id,
                                        username: user.username,
                                        avatarURL: user.displayAvatarURL()
                                    };
                                    player.queue.add(track);
                                }
                    
                                if (!player.playing && !player.paused) {
                                    player.play();
                                }
                            } else {
                                const track = resolve.tracks[0];
                                track.requester = {
                                    id: user.id,
                                    username: user.username,
                                    avatarURL: user.displayAvatarURL()
                                };
                                player.queue.add(track);
                    
                                if (!player.playing && !player.paused) {
                                    player.play();
                                }
                            }
                        }
                        else {
                            const resolve = await client.riffy.resolve({ query, requester: user });
                            
                            if (!resolve || !resolve.tracks || resolve.tracks.length === 0) {
                                const noResultsContainer = new ContainerBuilder()
                                    .setAccentColor(0xff4757)
                                    .addTextDisplayComponents(
                                        textDisplay => textDisplay.setContent('**❌ NO SEARCH RESULTS**\nNo tracks found matching your search query.\n\n**💡 Tips:**\n• Try different keywords\n• Include artist name\n• Check spelling\n• Use more specific terms')
                                    );
                            
                                const reply = await interaction.editReply({ 
                                    components: [noResultsContainer], 
                                    flags: MessageFlags.IsComponentsV2 
                                });
                                setTimeout(() => reply.delete().catch(() => {}), 6000);
                                return;
                            }
                
                            const track = resolve.tracks[0];
                            track.requester = {
                                id: user.id,
                                username: user.username,
                                avatarURL: user.displayAvatarURL()
                            };
                            player.queue.add(track);
                
                            if (!player.playing && !player.paused) {
                                player.play();
                            }
                        }

                        // Send now playing with buttons after a short delay - ONLY ONE MESSAGE
                        setTimeout(async () => {
                            const updatedPlayer = client.riffy.players.get(guildId);
                            if (updatedPlayer && updatedPlayer.current) {
                                const nowPlayingEmbed = createNowPlayingEmbed(updatedPlayer, interaction);
                                if (nowPlayingEmbed) {
                                    const reply = await interaction.editReply({ 
                                        components: [nowPlayingEmbed], 
                                        flags: MessageFlags.IsComponentsV2 
                                    });
                                    await createButtonCollector(reply, updatedPlayer);
                                }
                            }
                        }, 1000);
                        
                    } catch (error) {
                        console.error('Error resolving query:', error);
                    
                        const errorContainer = new ContainerBuilder()
                            .setAccentColor(0xff4757)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**❌ PLAYBACK ERROR**')
                            )
                            .addSeparatorComponents(separator => separator)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**Something went wrong while processing your request.**\n\nThis could be due to:\n• Network connectivity issues\n• Invalid or restricted content\n• Lavalink server problems\n• Rate limiting')
                            )
                            .addSeparatorComponents(separator => separator)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**🔧 Troubleshooting:**\n• Try a different song or URL\n• Check your internet connection\n• Wait a moment and try again\n• Contact support if issues persist\n\n*Advanced users: Check Lavalink configuration*')
                            );
                    
                        const reply = await interaction.editReply({ 
                            components: [errorContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                        setTimeout(() => reply.delete().catch(() => {}), 10000);
                    }
                    
                    break;
                }
                
                case 'nowplaying': {
                    const player = await checkPlayerExists();
                    if (!player) return;
                    
                    const currentTrack = player.current;
                    if (!currentTrack) {
                        const noTrackContainer = new ContainerBuilder()
                            .setAccentColor(0xff4757)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**❌ NO TRACK PLAYING**\nNo track is currently active.\n\nUse `/music play` to start playing music.')
                            );

                        const reply = await interaction.editReply({ 
                            components: [noTrackContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                        setTimeout(() => reply.delete().catch(() => {}), 5000);
                        return;
                    }
                    
                    const nowPlayingEmbed = createNowPlayingEmbed(player, interaction);
                    if (!nowPlayingEmbed) {
                        const errorContainer = new ContainerBuilder()
                            .setAccentColor(0xff4757)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**❌ ERROR**\nFailed to create now playing display.')
                            );
                        await interaction.editReply({ 
                            components: [errorContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                        return;
                    }
                    
                    const reply = await interaction.editReply({ 
                        components: [nowPlayingEmbed], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                    
                    await createButtonCollector(reply, player);
                    
                    break;
                }

                case 'pause': {
                    const player = await checkPlayerExists();
                    if (!player) return;
                    
                    player.pause(true);
                    
                    const pauseContainer = new ContainerBuilder()
                        .setAccentColor(0xffa500)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**⏸️ PLAYBACK PAUSED**\nMusic has been paused successfully.\n\nUse `/music resume` to continue playing.')
                        );

                    const reply = await interaction.editReply({ 
                        components: [pauseContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                    setTimeout(() => reply.delete().catch(() => {}), 5000);
                    break;
                }

                case 'resume': {
                    const player = await checkPlayerExists();
                    if (!player) return;
                    
                    player.pause(false);
                    
                    const resumeContainer = new ContainerBuilder()
                        .setAccentColor(0x2ecc71)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**▶️ PLAYBACK RESUMED**\nMusic playback has been resumed.\n\nEnjoy your music!')
                        );

                    const reply = await interaction.editReply({ 
                        components: [resumeContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                    setTimeout(() => reply.delete().catch(() => {}), 5000);
                    break;
                }

                case 'shuffle': {
                    const player = await checkPlayerExists();
                    if (!player) return;
                    
                    if (player.queue.length === 0) {
                        const emptyQueueContainer = new ContainerBuilder()
                            .setAccentColor(0xff4757)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**❌ EMPTY QUEUE**\nCannot shuffle an empty queue.\n\nAdd some tracks first with `/music play`.')
                            );

                        const reply = await interaction.editReply({ 
                            components: [emptyQueueContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                        setTimeout(() => reply.delete().catch(() => {}), 5000);
                        return;
                    }
                    
                    player.queue.shuffle();
                    
                    const shuffleContainer = new ContainerBuilder()
                        .setAccentColor(0xe91e63)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**🔀 QUEUE SHUFFLED**\nThe music queue has been shuffled randomly.\n\n**Queue Info:**\n• Total Tracks: ' + player.queue.length + '\n• Order: Randomized\n• Next Up: ' + (player.queue[0]?.info.title || 'None'))
                        );

                    const reply = await interaction.editReply({ 
                        components: [shuffleContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                    setTimeout(() => reply.delete().catch(() => {}), 6000);
                    break;
                }

                case 'skip': {
                    const player = await checkPlayerExists();
                    if (!player) return;
                    
                    const currentTrack = player.current;
                    player.stop();
                    
                    const skipContainer = new ContainerBuilder()
                        .setAccentColor(0x3498db)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**⏭️ TRACK SKIPPED**\n' + (currentTrack ? `Skipped: **${currentTrack.info.title}**` : 'Current track has been skipped.') + '\n\nMoving to the next track in queue...')
                        );

                    const reply = await interaction.editReply({ 
                        components: [skipContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                    setTimeout(() => reply.delete().catch(() => {}), 5000);
                    break;
                }

                case 'stop': {
                    const player = await checkPlayerExists();
                    if (!player) return;
                    
                    const queueLength = player.queue.length;
                    player.destroy();
                    
                    const stopContainer = new ContainerBuilder()
                        .setAccentColor(0xe74c3c)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**⏹️ MUSIC STOPPED**')
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Playback has been completely stopped.**\n\n**Actions Performed:**\n• Music playback stopped\n• Queue cleared (${queueLength} tracks removed)\n• Player disconnected from voice channel\n• All resources cleaned up\n\nUse \`/music play\` to start a new session.`)
                        );

                    const reply = await interaction.editReply({ 
                        components: [stopContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                    setTimeout(() => reply.delete().catch(() => {}), 8000);
                    break;
                }

                case 'queue': {
                    const player = await checkPlayerExists();
                    if (!player) return;
                    
                    const queue = player.queue;
                    if (!queue || queue.length === 0) {
                        const emptyQueueContainer = new ContainerBuilder()
                            .setAccentColor(0xff4757)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**❌ EMPTY QUEUE**\nThe music queue is currently empty.\n\nAdd tracks with `/music play` to see them here.')
                            );

                        const reply = await interaction.editReply({ 
                            components: [emptyQueueContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                        setTimeout(() => reply.delete().catch(() => {}), 5000);
                        return;
                    }
                    
                  
                    const formattedQueue = queue.slice(0, 15).map((track, i) => 
                        `**${i + 1}.** ${track.info.title}\n> *Requested by ${track.requester?.username || 'Unknown'}*`
                    ).join('\n\n');
                    
                    const queueContainer = new ContainerBuilder()
                        .setAccentColor(0xdc92ff)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**🎶 MUSIC QUEUE**')
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Queue Information:**\n• Total Tracks: **${queue.length}**\n• Estimated Duration: **~${Math.round(queue.length * 3.5)} minutes**\n• Loop Mode: **${player.loop || 'None'}**\n• Shuffle: ${player.queue.shuffled ? '✅ On' : '❌ Off'}`)
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**📋 Up Next:**\n\n${formattedQueue}${queue.length > 15 ? `\n\n*...and ${queue.length - 15} more tracks*` : ''}`)
                        );
                    
                    const reply = await interaction.editReply({ 
                        components: [queueContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                    setTimeout(() => reply.delete().catch(() => {}), 15000);
                    break;
                }

                case 'loop': {
                    const player = await checkPlayerExists();
                    if (!player) return;
                    
                    const mode = interaction.options.getString('mode');
                    
                    try {
                        player.setLoop(mode);
                        
                        const loopContainer = new ContainerBuilder()
                            .setAccentColor(0x9c27b0)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**🔄 LOOP MODE UPDATED**')
                            )
                            .addSeparatorComponents(separator => separator)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**Loop mode set to: ${mode.toUpperCase()}**\n\n**Mode Details:**\n${this.getLoopModeDescription(mode)}\n\n**Current Status:**\n• Active: ${mode !== 'none' ? '✅ Yes' : '❌ No'}\n• Type: ${mode === 'track' ? '🔂 Single Track' : mode === 'queue' ? '🔁 Entire Queue' : '➡️ No Loop'}`)
                            );

                        const reply = await interaction.editReply({ 
                            components: [loopContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                        setTimeout(() => reply.delete().catch(() => {}), 8000);
                    } catch (error) {
                        console.error('Error setting loop mode:', error);
                        
                        const errorContainer = new ContainerBuilder()
                            .setAccentColor(0xff4757)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**❌ LOOP ERROR**\nFailed to set loop mode.\n\nPlease try again or contact support.')
                            );

                        const reply = await interaction.editReply({ 
                            components: [errorContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                        setTimeout(() => reply.delete().catch(() => {}), 5000);
                    }
                    break;
                }

                case 'remove': {
                    const player = await checkPlayerExists();
                    if (!player) return;
                    
                    const trackNumber = interaction.options.getInteger('track');
                    if (trackNumber < 1 || trackNumber > player.queue.length) {
                        const invalidContainer = new ContainerBuilder()
                            .setAccentColor(0xff4757)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**❌ INVALID TRACK NUMBER**\nTrack number must be between 1 and ${player.queue.length}.\n\nUse \`/music queue\` to see valid track numbers.`)
                            );

                        const reply = await interaction.editReply({ 
                            components: [invalidContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                        setTimeout(() => reply.delete().catch(() => {}), 6000);
                        return;
                    }
                    
                    const removedTrack = player.queue[trackNumber - 1];
                    player.queue.remove(trackNumber - 1);
                    
                    const removeContainer = new ContainerBuilder()
                        .setAccentColor(0xe74c3c)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**🗑️ TRACK REMOVED**')
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Removed from queue:**\n**${removedTrack.info.title}**\n\n**Details:**\n• Position: #${trackNumber}\n• Requested by: ${removedTrack.requester?.username || 'Unknown'}\n• Remaining tracks: ${player.queue.length}`)
                        );

                    const reply = await interaction.editReply({ 
                        components: [removeContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                    setTimeout(() => reply.delete().catch(() => {}), 7000);
                    break;
                }

                case 'seek': {
                    const player = await checkPlayerExists();
                    if (!player) return;
                    
                    const currentTrack = player.current;
                    if (!currentTrack) {
                        const noTrackContainer = new ContainerBuilder()
                            .setAccentColor(0xff4757)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**❌ NO TRACK PLAYING**\nNo track is currently playing.\n\nUse `/music play` to start playing music before seeking.')
                            );

                        const reply = await interaction.editReply({ 
                            components: [noTrackContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                        setTimeout(() => reply.delete().catch(() => {}), 5000);
                        return;
                    }
                    
                    const seekPosition = interaction.options.getInteger('position');
                    const trackDuration = currentTrack.info.length;
                    const seekMs = seekPosition * 1000; // Convert seconds to milliseconds
                    
                    if (seekMs > trackDuration) {
                        const invalidContainer = new ContainerBuilder()
                            .setAccentColor(0xff4757)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**❌ INVALID SEEK POSITION**\nSeek position exceeds track duration.\n\n**Track Duration:** ${formatDuration(trackDuration)}\n**Your Input:** ${seekPosition} seconds (${formatDuration(seekMs)})\n\nPlease enter a position within ${Math.floor(trackDuration / 1000)} seconds.`)
                            );

                        const reply = await interaction.editReply({ 
                            components: [invalidContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                        setTimeout(() => reply.delete().catch(() => {}), 8000);
                        return;
                    }
                    
                    // Perform seek
                    try {
                        await player.seek(seekMs);
                        
                        const seekContainer = new ContainerBuilder()
                            .setAccentColor(0x9b59b6)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**⏩ TRACK POSITION UPDATED**')
                            )
                            .addSeparatorComponents(separator => separator)
                            .addSectionComponents(
                                section => section
                                    .addTextDisplayComponents(
                                        textDisplay => textDisplay.setContent(`**${currentTrack.info.title}**\n\n**Seek Position:** ${formatDuration(seekMs)}\n**Track Duration:** ${formatDuration(trackDuration)}\n**Remaining:** ${formatDuration(trackDuration - seekMs)}\n**Progress:** ${Math.round((seekMs / trackDuration) * 100)}%`)
                                    )
                                    .setThumbnailAccessory(
                                        thumbnail => thumbnail
                                            .setURL(currentTrack.info.artwork || interaction.user.displayAvatarURL({ dynamic: true }))
                                            .setDescription('Now Playing')
                                    )
                            )
                            .addSeparatorComponents(separator => separator)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**🎵 Track Info:**\n• Volume: ${player.volume}%\n• Loop: ${player.loop || 'None'}\n• Requested by: ${currentTrack.requester?.username || 'Unknown'}`)
                            );

                        const reply = await interaction.editReply({ 
                            components: [seekContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                        setTimeout(() => reply.delete().catch(() => {}), 10000);
                    } catch (seekError) {
                        console.error('Seek error:', seekError);
                        
                        const seekErrorContainer = new ContainerBuilder()
                            .setAccentColor(0xff4757)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**❌ SEEK ERROR**\nFailed to seek to the specified position.\n\nThis could be due to:\n• Player connection issues\n• Unsupported track format\n• Network latency\n\nPlease try again or use a different position.')
                            );

                        const reply = await interaction.editReply({ 
                            components: [seekErrorContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                        setTimeout(() => reply.delete().catch(() => {}), 7000);
                    }
                    break;
                }

                case 'volume': {
                    const player = await checkPlayerExists();
                    if (!player) return;
                    
                    const volume = interaction.options.getInteger('level');
                    if (volume < 0 || volume > 100) {
                        const invalidVolumeContainer = new ContainerBuilder()
                            .setAccentColor(0xff4757)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**❌ INVALID VOLUME**\nVolume must be between 0 and 100.\n\nPlease enter a valid volume level.')
                            );

                        const reply = await interaction.editReply({ 
                            components: [invalidVolumeContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                        setTimeout(() => reply.delete().catch(() => {}), 5000);
                        return;
                    }
                    
                    const oldVolume = player.volume;
                    player.setVolume(volume);
                    
                    const volumeContainer = new ContainerBuilder()
                        .setAccentColor(0x2196f3)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**🔊 VOLUME ADJUSTED**')
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Volume changed from ${oldVolume}% to ${volume}%**\n\n**Audio Level:**\n${this.getVolumeBar(volume)}\n\n**Status:**\n• Current: ${volume}%\n• Quality: ${volume > 80 ? 'High' : volume > 40 ? 'Medium' : 'Low'}\n• ${volume === 0 ? '🔇 Muted' : volume > 75 ? '🔊 Loud' : volume > 25 ? '🔉 Medium' : '🔈 Quiet'}`)
                        );

                    const reply = await interaction.editReply({ 
                        components: [volumeContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                    setTimeout(() => reply.delete().catch(() => {}), 8000);
                    break;
                }

                case 'createplaylist': {
                    try {
                        const name = interaction.options.getString('name');
                        const visibility = interaction.options.getString('visibility');

                        const existingPlaylist = await playlistCollection.findOne({ name, owner: userId });
                        if (existingPlaylist) {
                            const existsContainer = new ContainerBuilder()
                                .setAccentColor(0xff4757)
                                .addTextDisplayComponents(
                                    textDisplay => textDisplay.setContent(`**❌ PLAYLIST EXISTS**\nA playlist named **"${name}"** already exists in your collection.\n\nPlease choose a different name or delete the existing playlist first.`)
                                );

                            const reply = await interaction.editReply({ 
                                components: [existsContainer], 
                                flags: MessageFlags.IsComponentsV2 
                            });
                            setTimeout(() => reply.delete().catch(() => {}), 6000);
                            return;
                        }

                        await playlistCollection.insertOne({
                            name,
                            owner: userId,
                            visibility,
                            songs: [],
                            createdAt: new Date()
                        });

                        const createContainer = new ContainerBuilder()
                            .setAccentColor(0x2ecc71)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**📋 PLAYLIST CREATED**')
                            )
                            .addSeparatorComponents(separator => separator)
                            .addSectionComponents(
                                section => section
                                    .addTextDisplayComponents(
                                        textDisplay => textDisplay.setContent(`**${name}** has been created successfully!\n\n**Details:**\n• Name: **${name}**\n• Visibility: **${visibility.toUpperCase()}**\n• Owner: ${interaction.user.username}\n• Songs: 0 (empty)\n• Status: Ready for tracks\n\n**Next Steps:**\n• Use \`/music addsong\` to add tracks\n• Use \`/music playplaylist\` to play it`)
                                    )
                                    .setThumbnailAccessory(
                                        thumbnail => thumbnail
                                            .setURL(interaction.user.displayAvatarURL({ dynamic: true }))
                                            .setDescription('Created by')
                                    )
                            );

                        const reply = await interaction.editReply({ 
                            components: [createContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                        setTimeout(() => reply.delete().catch(() => {}), 10000);
                    } catch (error) {
                        console.error('Error creating playlist:', error);
                        
                        const errorContainer = new ContainerBuilder()
                            .setAccentColor(0xff4757)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**❌ CREATION FAILED**\nFailed to create playlist due to a database error.\n\nPlease try again later.')
                            );

                        const reply = await interaction.editReply({ 
                            components: [errorContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                        setTimeout(() => reply.delete().catch(() => {}), 5000);
                    }
                    break;
                }

                case 'playplaylist': {
                    if (!await checkVoiceChannel()) return;
                    
                    try {
                        const name = interaction.options.getString('name');
                        const playlist = await playlistCollection.findOne({ name });
                    
                        if (!playlist) {
                            const notFoundContainer = new ContainerBuilder()
                                .setAccentColor(0xff4757)
                                .addTextDisplayComponents(
                                    textDisplay => textDisplay.setContent(`**❌ PLAYLIST NOT FOUND**\nPlaylist **"${name}"** doesn't exist.\n\nUse \`/music viewmyplaylists\` to see available playlists.`)
                                );

                            const reply = await interaction.editReply({ 
                                components: [notFoundContainer], 
                                flags: MessageFlags.IsComponentsV2 
                            });
                            setTimeout(() => reply.delete().catch(() => {}), 6000);
                            return;
                        }
                    
                        if (playlist.visibility === 'private' && playlist.owner !== userId) {
                            const privateContainer = new ContainerBuilder()
                                .setAccentColor(0xff4757)
                                .addTextDisplayComponents(
                                    textDisplay => textDisplay.setContent(`**❌ PRIVATE PLAYLIST**\nYou don't have permission to play this private playlist.\n\nOnly the owner can access private playlists.`)
                                );

                            const reply = await interaction.editReply({ 
                                components: [privateContainer], 
                                flags: MessageFlags.IsComponentsV2 
                            });
                            setTimeout(() => reply.delete().catch(() => {}), 6000);
                            return;
                        }
                    
                        if (playlist.songs.length === 0) {
                            const emptyContainer = new ContainerBuilder()
                                .setAccentColor(0xff4757)
                                .addTextDisplayComponents(
                                    textDisplay => textDisplay.setContent(`**❌ EMPTY PLAYLIST**\nPlaylist **"${name}"** contains no songs.\n\nUse \`/music addsong\` to add tracks first.`)
                                );

                            const reply = await interaction.editReply({ 
                                components: [emptyContainer], 
                                flags: MessageFlags.IsComponentsV2 
                            });
                            setTimeout(() => reply.delete().catch(() => {}), 6000);
                            return;
                        }
                    
                        let player = await getOrCreatePlayer();
                        if (!player) return;
                    
                        // Send loading message
                        const loadingContainer = new ContainerBuilder()
                            .setAccentColor(0xffa500)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**🔄 LOADING PLAYLIST**\nResolving ${playlist.songs.length} tracks from **${name}**...\n\nThis may take a moment for large playlists.`)
                            );

                        await interaction.editReply({ 
                            components: [loadingContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                    
                        let addedTracks = 0;
                        let failedTracks = 0;
                        
                        for (const song of playlist.songs) {
                            try {
                                const resolve = await client.riffy.resolve({ query: song, requester: interaction.user });
                    
                                if (resolve.tracks.length > 0) {
                                    const track = resolve.tracks[0];
                                    track.requester = {
                                        id: interaction.user.id,
                                        username: interaction.user.username,
                                        avatarURL: interaction.user.displayAvatarURL()
                                    };
                                    player.queue.add(track);
                                    addedTracks++;
                                } else {
                                    failedTracks++;
                                }
                            } catch (error) {
                                console.warn(`Failed to resolve track: ${song}`, error);
                                failedTracks++;
                            }
                        }
                    
                        if (addedTracks === 0) {
                            const noTracksContainer = new ContainerBuilder()
                                .setAccentColor(0xff4757)
                                .addTextDisplayComponents(
                                    textDisplay => textDisplay.setContent(`**❌ PLAYLIST LOAD FAILED**\nCouldn't resolve any valid tracks from **"${name}"**.\n\nTracks may be unavailable or URLs may be invalid.`)
                                );

                            const reply = await interaction.editReply({ 
                                components: [noTracksContainer], 
                                flags: MessageFlags.IsComponentsV2 
                            });
                            setTimeout(() => reply.delete().catch(() => {}), 8000);
                            return;
                        }

                        if (!player.playing && !player.paused) {
                            player.play();
                        }

                        // Send now playing with buttons after a short delay - ONLY ONE MESSAGE
                        setTimeout(async () => {
                            const updatedPlayer = client.riffy.players.get(guildId);
                            if (updatedPlayer && updatedPlayer.current) {
                                const nowPlayingEmbed = createNowPlayingEmbed(updatedPlayer, interaction);
                                if (nowPlayingEmbed) {
                                    const reply = await interaction.editReply({ 
                                        components: [nowPlayingEmbed], 
                                        flags: MessageFlags.IsComponentsV2 
                                    });
                                    await createButtonCollector(reply, updatedPlayer);
                                }
                            }
                        }, 1000);
                        
                    } catch (error) {
                        console.error('Error playing playlist:', error);
                        
                        const errorContainer = new ContainerBuilder()
                            .setAccentColor(0xff4757)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**❌ PLAYLIST ERROR**\nFailed to play playlist due to an unexpected error.\n\nPlease try again later.')
                            );

                        const reply = await interaction.editReply({ 
                            components: [errorContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                        setTimeout(() => reply.delete().catch(() => {}), 6000);
                    }
                    break;
                }

                case 'viewmyplaylists': {
                    try {
                        const playlists = await playlistCollection.find({ owner: userId }).toArray();
                        if (playlists.length === 0) {
                            const noPlaylistsContainer = new ContainerBuilder()
                                .setAccentColor(0xff4757)
                                .addTextDisplayComponents(
                                    textDisplay => textDisplay.setContent('**📋 NO PLAYLISTS FOUND**\nYou haven\'t created any playlists yet.\n\nUse `/music createplaylist` to create your first playlist!')
                                );

                            const reply = await interaction.editReply({ 
                                components: [noPlaylistsContainer], 
                                flags: MessageFlags.IsComponentsV2 
                            });
                            setTimeout(() => reply.delete().catch(() => {}), 6000);
                            return;
                        }

                        const playlistList = playlists.map(p => 
                            `**📋 ${p.name}**\n> *${p.visibility === 'public' ? '🌍 Public' : '🔒 Private'} • ${p.songs.length} songs*`
                        ).join('\n\n');

                        const myPlaylistsContainer = new ContainerBuilder()
                            .setAccentColor(0x3498db)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**🎶 YOUR PLAYLISTS**')
                            )
                            .addSeparatorComponents(separator => separator)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**You have ${playlists.length} playlist${playlists.length !== 1 ? 's' : ''}**\n\n${playlistList}`)
                            )
                            .addSeparatorComponents(separator => separator)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**💡 Quick Actions:**\n• `/music playplaylist` - Play a playlist\n• `/music viewmyplaylistsongs` - View songs\n• `/music addsong` - Add more tracks\n• `/music deleteplaylist` - Remove playlist')
                            );

                        const reply = await interaction.editReply({ 
                            components: [myPlaylistsContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                        setTimeout(() => reply.delete().catch(() => {}), 15000);
                    } catch (error) {
                        console.error('Error viewing playlists:', error);
                        
                        const errorContainer = new ContainerBuilder()
                            .setAccentColor(0xff4757)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**❌ LOAD ERROR**\nFailed to retrieve your playlists.\n\nPlease try again later.')
                            );

                        const reply = await interaction.editReply({ 
                            components: [errorContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                        setTimeout(() => reply.delete().catch(() => {}), 5000);
                    }
                    break;
                }

                case 'viewmyplaylistsongs': {
                    try {
                        const playlistName = interaction.options.getString('name');
                        const playlist = await playlistCollection.findOne({ name: playlistName });
            
                        if (!playlist) {
                            const notFoundContainer = new ContainerBuilder()
                                .setAccentColor(0xff4757)
                                .addTextDisplayComponents(
                                    textDisplay => textDisplay.setContent(`**❌ PLAYLIST NOT FOUND**\nPlaylist **"${playlistName}"** doesn't exist.\n\nCheck the name and try again.`)
                                );

                            const reply = await interaction.editReply({ 
                                components: [notFoundContainer], 
                                flags: MessageFlags.IsComponentsV2 
                            });
                            setTimeout(() => reply.delete().catch(() => {}), 6000);
                            return;
                        }
            
                        if (playlist.visibility === 'private' && playlist.owner !== userId) {
                            const privateContainer = new ContainerBuilder()
                                .setAccentColor(0xff4757)
                                .addTextDisplayComponents(
                                    textDisplay => textDisplay.setContent(`**❌ ACCESS DENIED**\nYou don't have permission to view this private playlist.\n\nOnly the owner can view private playlist contents.`)
                                );

                            const reply = await interaction.editReply({ 
                                components: [privateContainer], 
                                flags: MessageFlags.IsComponentsV2 
                            });
                            setTimeout(() => reply.delete().catch(() => {}), 6000);
                            return;
                        }
            
                        if (playlist.songs.length === 0) {
                            const emptyContainer = new ContainerBuilder()
                                .setAccentColor(0xffa500)
                                .addTextDisplayComponents(
                                    textDisplay => textDisplay.setContent(`**📋 EMPTY PLAYLIST**\nPlaylist **"${playlistName}"** contains no songs yet.\n\nUse \`/music addsong\` to add some tracks!`)
                                );

                            const reply = await interaction.editReply({ 
                                components: [emptyContainer], 
                                flags: MessageFlags.IsComponentsV2 
                            });
                            setTimeout(() => reply.delete().catch(() => {}), 6000);
                            return;
                        }
            
                        const songList = playlist.songs.slice(0, 15).map((song, index) => 
                            `**${index + 1}.** ${song}`
                        ).join('\n');
            
                        const songsContainer = new ContainerBuilder()
                            .setAccentColor(0x3498db)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**🎵 SONGS IN "${playlistName.toUpperCase()}"**`)
                            )
                            .addSeparatorComponents(separator => separator)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**Playlist Details:**\n• Total Songs: **${playlist.songs.length}**\n• Owner: ${playlist.owner === userId ? 'You' : '<@' + playlist.owner + '>'}\n• Visibility: **${playlist.visibility === 'public' ? '🌍 Public' : '🔒 Private'}**\n• Created: ${playlist.createdAt ? new Date(playlist.createdAt).toLocaleDateString() : 'Unknown'}`)
                            )
                            .addSeparatorComponents(separator => separator)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**📋 Track List:**\n\n${songList}${playlist.songs.length > 15 ? `\n\n*...and ${playlist.songs.length - 15} more songs*` : ''}`)
                            );
            
                        const reply = await interaction.editReply({ 
                            components: [songsContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                        setTimeout(() => reply.delete().catch(() => {}), 20000);
                    } catch (error) {
                        console.error('Error viewing playlist songs:', error);
                        
                        const errorContainer = new ContainerBuilder()
                            .setAccentColor(0xff4757)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**❌ LOAD ERROR**\nFailed to retrieve playlist songs.\n\nPlease try again later.')
                            );

                        const reply = await interaction.editReply({ 
                            components: [errorContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                        setTimeout(() => reply.delete().catch(() => {}), 5000);
                    }
                    break;
                }

                case 'allplaylists': {
                    try {
                        const playlists = await playlistCollection.find({ visibility: 'public' }).toArray();
                        if (playlists.length === 0) {
                            const noPublicContainer = new ContainerBuilder()
                                .setAccentColor(0xffa500)
                                .addTextDisplayComponents(
                                    textDisplay => textDisplay.setContent('**🌍 NO PUBLIC PLAYLISTS**\nThere are currently no public playlists available.\n\nBe the first to create and share a public playlist!')
                                );

                            const reply = await interaction.editReply({ 
                                components: [noPublicContainer], 
                                flags: MessageFlags.IsComponentsV2 
                            });
                            setTimeout(() => reply.delete().catch(() => {}), 6000);
                            return;
                        }

                        const publicList = playlists.slice(0, 20).map(p => 
                            `**📋 ${p.name}**\n> *Owner: <@${p.owner}> • ${p.songs.length} songs*`
                        ).join('\n\n');

                        const allPlaylistsContainer = new ContainerBuilder()
                            .setAccentColor(0x2ecc71)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**🌍 PUBLIC PLAYLISTS**')
                            )
                            .addSeparatorComponents(separator => separator)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**${playlists.length} public playlist${playlists.length !== 1 ? 's' : ''} available**\n\nAnyone can play these playlists using \`/music playplaylist\``)
                            )
                            .addSeparatorComponents(separator => separator)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**📋 Available Playlists:**\n\n${publicList}${playlists.length > 20 ? `\n\n*...and ${playlists.length - 20} more playlists*` : ''}`)
                            );

                        const reply = await interaction.editReply({ 
                            components: [allPlaylistsContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                        setTimeout(() => reply.delete().catch(() => {}), 25000);
                    } catch (error) {
                        console.error('Error retrieving public playlists:', error);
                        
                        const errorContainer = new ContainerBuilder()
                            .setAccentColor(0xff4757)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**❌ LOAD ERROR**\nFailed to retrieve public playlists.\n\nPlease try again later.')
                            );

                        const reply = await interaction.editReply({ 
                            components: [errorContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                        setTimeout(() => reply.delete().catch(() => {}), 5000);
                    }
                    break;
                }

                case 'deletesong': {
                    try {
                        const playlistName = interaction.options.getString('playlist');
                        const songIndex = interaction.options.getInteger('index') - 1; 
                        
                        const playlist = await playlistCollection.findOne({ name: playlistName });
                        
                        if (!playlist) {
                            const notFoundContainer = new ContainerBuilder()
                                .setAccentColor(0xff4757)
                                .addTextDisplayComponents(
                                    textDisplay => textDisplay.setContent(`**❌ PLAYLIST NOT FOUND**\nPlaylist **"${playlistName}"** doesn't exist.\n\nCheck the name and try again.`)
                                );

                            const reply = await interaction.editReply({ 
                                components: [notFoundContainer], 
                                flags: MessageFlags.IsComponentsV2 
                            });
                            setTimeout(() => reply.delete().catch(() => {}), 6000);
                            return;
                        }
                        
                        if (playlist.owner !== userId) {
                            const noPermissionContainer = new ContainerBuilder()
                                .setAccentColor(0xff4757)
                                .addTextDisplayComponents(
                                    textDisplay => textDisplay.setContent('**❌ NO PERMISSION**\nYou can only delete songs from your own playlists.\n\nThis playlist belongs to another user.')
                                );

                            const reply = await interaction.editReply({ 
                                components: [noPermissionContainer], 
                                flags: MessageFlags.IsComponentsV2 
                            });
                            setTimeout(() => reply.delete().catch(() => {}), 6000);
                            return;
                        }
                        
                        if (songIndex < 0 || songIndex >= playlist.songs.length) {
                            const invalidIndexContainer = new ContainerBuilder()
                                .setAccentColor(0xff4757)
                                .addTextDisplayComponents(
                                    textDisplay => textDisplay.setContent(`**❌ INVALID SONG INDEX**\nSong index must be between 1 and ${playlist.songs.length}.\n\nUse \`/music viewmyplaylistsongs\` to see valid indices.`)
                                );

                            const reply = await interaction.editReply({ 
                                components: [invalidIndexContainer], 
                                flags: MessageFlags.IsComponentsV2 
                            });
                            setTimeout(() => reply.delete().catch(() => {}), 7000);
                            return;
                        }
                        
                        const removedSong = playlist.songs[songIndex];
                        
                     
                        playlist.songs.splice(songIndex, 1);
                        
                        await playlistCollection.updateOne(
                            { name: playlistName, owner: userId },
                            { $set: { songs: playlist.songs } }
                        );
                        
                        const deleteSongContainer = new ContainerBuilder()
                            .setAccentColor(0xe74c3c)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**🗑️ SONG REMOVED**')
                            )
                            .addSeparatorComponents(separator => separator)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**Successfully removed song from playlist!**\n\n**Removed Song:**\n${removedSong}\n\n**Playlist:** ${playlistName}\n**Remaining Songs:** ${playlist.songs.length}\n**Position:** #${songIndex + 1}`)
                            );

                        const reply = await interaction.editReply({ 
                            components: [deleteSongContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                        setTimeout(() => reply.delete().catch(() => {}), 8000);
                    } catch (error) {
                        console.error('Error deleting song from playlist:', error);
                        
                        const errorContainer = new ContainerBuilder()
                            .setAccentColor(0xff4757)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**❌ DELETE ERROR**\nFailed to delete song from playlist.\n\nPlease try again later.')
                            );

                        const reply = await interaction.editReply({ 
                            components: [errorContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                        setTimeout(() => reply.delete().catch(() => {}), 5000);
                    }
                    break;
                }

                case 'deleteplaylist': {
                    try {
                        const playlistName = interaction.options.getString('name');
                        
                        const playlist = await playlistCollection.findOne({ name: playlistName });
                        
                        if (!playlist) {
                            const notFoundContainer = new ContainerBuilder()
                                .setAccentColor(0xff4757)
                                .addTextDisplayComponents(
                                    textDisplay => textDisplay.setContent(`**❌ PLAYLIST NOT FOUND**\nPlaylist **"${playlistName}"** doesn't exist.\n\nCheck the name and try again.`)
                                );

                            const reply = await interaction.editReply({ 
                                components: [notFoundContainer], 
                                flags: MessageFlags.IsComponentsV2 
                            });
                            setTimeout(() => reply.delete().catch(() => {}), 6000);
                            return;
                        }
                        
                        if (playlist.owner !== userId) {
                            const noPermissionContainer = new ContainerBuilder()
                                .setAccentColor(0xff4757)
                                .addTextDisplayComponents(
                                    textDisplay => textDisplay.setContent('**❌ NO PERMISSION**\nYou can only delete your own playlists.\n\nThis playlist belongs to another user.')
                                );

                            const reply = await interaction.editReply({ 
                                components: [noPermissionContainer], 
                                flags: MessageFlags.IsComponentsV2 
                            });
                            setTimeout(() => reply.delete().catch(() => {}), 6000);
                            return;
                        }
                        
                        await playlistCollection.deleteOne({ name: playlistName, owner: userId });
                        
                        const deletePlaylistContainer = new ContainerBuilder()
                            .setAccentColor(0xe74c3c)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**🗑️ PLAYLIST DELETED**')
                            )
                            .addSeparatorComponents(separator => separator)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**Playlist permanently removed!**\n\n**Deleted:** ${playlistName}\n**Songs Lost:** ${playlist.songs.length}\n**Type:** ${playlist.visibility} playlist\n\n**⚠️ This action cannot be undone.**\n\nYou can create a new playlist with the same name if needed.`)
                            );

                        const reply = await interaction.editReply({ 
                            components: [deletePlaylistContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                        setTimeout(() => reply.delete().catch(() => {}), 10000);
                    } catch (error) {
                        console.error('Error deleting playlist:', error);
                        
                        const errorContainer = new ContainerBuilder()
                            .setAccentColor(0xff4757)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**❌ DELETE ERROR**\nFailed to delete playlist.\n\nPlease try again later.')
                            );

                        const reply = await interaction.editReply({ 
                            components: [errorContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                        setTimeout(() => reply.delete().catch(() => {}), 5000);
                    }
                    break;
                }

                case 'autoplay': {
                    if (!await checkVoiceChannel()) return;
                    
                    try {
                        const enable = interaction.options.getBoolean('enabled');
                        await autoplayCollection.updateOne(
                            { guildId },
                            { $set: { autoplay: enable, updatedAt: new Date() } },
                            { upsert: true }
                        );
                    
                        const autoplayContainer = new ContainerBuilder()
                            .setAccentColor(enable ? 0x2ecc71 : 0xff4757)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**🔄 AUTOPLAY SETTINGS**')
                            )
                            .addSeparatorComponents(separator => separator)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**Autoplay is now ${enable ? 'ENABLED' : 'DISABLED'}**\n\n**What this means:**\n${enable ? '• Automatic queue replenishment\n• Continuous music playback\n• Smart song suggestions\n• No manual intervention needed' : '• Queue stops when empty\n• Manual track addition required\n• Playback ends after last song\n• Full user control'}\n\n**Status:** ${enable ? '✅ Active' : '❌ Inactive'}`)
                            );

                        const reply = await interaction.editReply({ 
                            components: [autoplayContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                    
                        setTimeout(() => reply.delete().catch(() => {}), 8000);
                        
                       
                        const player = client.riffy.players.get(guildId);
                        if (player) {
                            player.autoplay = enable;
                        }
                    } catch (error) {
                        console.error('Error setting autoplay:', error);
                        
                        const errorContainer = new ContainerBuilder()
                            .setAccentColor(0xff4757)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**❌ AUTOPLAY ERROR**\nFailed to set autoplay status.\n\nPlease try again later.')
                            );

                        const reply = await interaction.editReply({ 
                            components: [errorContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                        setTimeout(() => reply.delete().catch(() => {}), 5000);
                    }
                    break;
                }

                case 'addsong': {
                    try {
                        const playlistName = interaction.options.getString('playlist');
                        const songInput = interaction.options.getString('song'); 
            
                        const playlist = await playlistCollection.findOne({ name: playlistName });
            
                        if (!playlist) {
                            const notFoundContainer = new ContainerBuilder()
                                .setAccentColor(0xff4757)
                                .addTextDisplayComponents(
                                    textDisplay => textDisplay.setContent(`**❌ PLAYLIST NOT FOUND**\nPlaylist **"${playlistName}"** doesn't exist.\n\nUse \`/music viewmyplaylists\` to see available playlists.`)
                                );

                            const reply = await interaction.editReply({ 
                                components: [notFoundContainer], 
                                flags: MessageFlags.IsComponentsV2 
                            });
                            setTimeout(() => reply.delete().catch(() => {}), 6000);
                            return;
                        }
            
                        if (playlist.owner !== userId && playlist.visibility === 'private') {
                            const noPermissionContainer = new ContainerBuilder()
                                .setAccentColor(0xff4757)
                                .addTextDisplayComponents(
                                    textDisplay => textDisplay.setContent(`**❌ ACCESS DENIED**\nYou don't have permission to add songs to this private playlist.\n\nOnly the owner can modify private playlists.`)
                                );

                            const reply = await interaction.editReply({ 
                                components: [noPermissionContainer], 
                                flags: MessageFlags.IsComponentsV2 
                            });
                            setTimeout(() => reply.delete().catch(() => {}), 7000);
                            return;
                        }
            
                      
                        await playlistCollection.updateOne(
                            { name: playlistName },
                            { 
                                $push: { songs: songInput },
                                $set: { updatedAt: new Date() }
                            }
                        );
            
                        const addSongContainer = new ContainerBuilder()
                            .setAccentColor(0x2ecc71)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**➕ SONG ADDED**')
                            )
                            .addSeparatorComponents(separator => separator)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**Successfully added to playlist!**\n\n**Song:** ${songInput}\n**Playlist:** ${playlistName}\n**Total Songs:** ${playlist.songs.length + 1}\n**Added by:** ${interaction.user.username}\n\n**Quick Actions:**\n• \`/music playplaylist\` - Play this playlist\n• \`/music viewmyplaylistsongs\` - View all songs`)
                            );

                        const reply = await interaction.editReply({ 
                            components: [addSongContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                        setTimeout(() => reply.delete().catch(() => {}), 10000);
                    } catch (error) {
                        console.error('Error adding song to playlist:', error);
                        
                        const errorContainer = new ContainerBuilder()
                            .setAccentColor(0xff4757)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**❌ ADD ERROR**\nFailed to add song to playlist.\n\nPlease try again later.')
                            );

                        const reply = await interaction.editReply({ 
                            components: [errorContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                        setTimeout(() => reply.delete().catch(() => {}), 5000);
                    }
                    break;
                }

                default:
                    const unknownContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**❌ UNKNOWN COMMAND**\nSubcommand **"${subcommand}"** is not recognized.\n\nPlease check the command and try again.`)
                        );

                    const reply = await interaction.editReply({ 
                        components: [unknownContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                    setTimeout(() => reply.delete().catch(() => {}), 5000);
                    break;
            }
        } catch (error) {
            console.error('Music command error:', error);
        
            const criticalErrorContainer = new ContainerBuilder()
                .setAccentColor(0xff4757)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('**❌ CRITICAL ERROR**')
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('**An unexpected error occurred while processing your music command.**\n\nThis could be due to:\n• Network connectivity issues\n• Database connection problems\n• Lavalink server unavailable\n• Discord API limitations')
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('**🔧 Recommended Actions:**\n• Try again in a few moments\n• Check your internet connection\n• Verify voice channel permissions\n• Contact support if issue persists\n\n*Error has been logged for investigation*')
                );

            try {
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply({ 
                        components: [criticalErrorContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                } else {
                    await interaction.reply({ 
                        components: [criticalErrorContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                }
            } catch (replyError) {
                console.error('Failed to send error message:', replyError);
            }
        }
    },


    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
        }
    },

    getLoopModeDescription(mode) {
        const descriptions = {
            'none': '• Music will play through the queue once\n• No tracks will repeat automatically\n• Queue ends when last track finishes',
            'track': '• Current track will repeat indefinitely\n• Same song plays over and over\n• Perfect for favorite tracks',
            'queue': '• Entire queue repeats when finished\n• Continuous playlist playback\n• All tracks cycle through repeatedly'
        };
        return descriptions[mode] || 'Unknown loop mode';
    },

    getVolumeBar(volume) {
        const barLength = 20;
        const filledLength = Math.round((volume / 100) * barLength);
        const emptyLength = barLength - filledLength;
        return '█'.repeat(filledLength) + '░'.repeat(emptyLength) + ` ${volume}%`;
    }
};

/*
 ██████▗  ██▗      ██████  ████████▗███████████▗██▗   ██▗█████████
██▄▄▄▄▄  ██▄     ██▄▄▄▄▄  ██▄▄▄▄▄▄▄██▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
██▌  ███ ██▌     ███████  ████████▌█████████████▌   ██▌█████████▌
██▌   ██▌██▌     ██▄▄▄▄▄  ██▄▄▄▄▄▄▄█████▄▄▄▄▄▄▄    ██▌█████▄▄▄▄▄ 
█████████▌███████████████▌█████████▌█████████████▌   ██▌█████████▌
 ▀▀▀▀▀▀▀ ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀   ▀▀▀▀▀▀▀▀▀▀▀▀▀

-------------------------------------
📡 Discord : https://discord.gg/xQF9f9yUEM
🌐 Website : https://glaceyt.com
🎥 YouTube : https://youtube.com/@GlaceYT
✅ Verified | 🧩 Tested | ⚙️ Stable
-------------------------------------
> © 2025 GlaceYT.com | All rights reserved.
*/
