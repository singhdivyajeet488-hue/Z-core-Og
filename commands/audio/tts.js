const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, TextDisplayBuilder, ContainerBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState, setFFmpegPath } = require('@discordjs/voice');
const ffmpegPath = require('ffmpeg-static');
const https = require('https');
const fs = require('fs');
const path = require('path');

// FFmpeg setup
setFFmpegPath(ffmpegPath);

const activeSessions = new Map();
const messageQueue = new Map();
const userCooldowns = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tts-live')
        .setDescription('Live TTS - Bot reads messages')
        .addSubcommand(sub =>
            sub.setName('start')
                .setDescription('Start session')
                .addStringOption(opt => opt.setName('language').setDescription('Language').addChoices(
                    { name: 'English', value: 'en' }, { name: 'Hindi', value: 'hi' }
                )))
        .addSubcommand(sub => sub.setName('stop').setDescription('Stop session')),

    async execute(interaction) {
        await interaction.deferReply();
        const sub = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        if (sub === 'start') {
            const voiceChannel = interaction.member.voice.channel;
            if (!voiceChannel) return this.sendError(interaction, 'Join a voice channel!');

            try {
                const connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: guildId,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                });

                // Connection stable hone ka wait
                await entersState(connection, VoiceConnectionStatus.Ready, 30000);

                const player = createAudioPlayer();
                connection.subscribe(player);

                activeSessions.set(guildId, {
                    connection, player, language: interaction.options.getString('language') || 'en',
                    channelId: interaction.channel.id, isPlaying: false
                });
                messageQueue.set(guildId, []);

                this.setupMessageListener(interaction.client, guildId);
                await interaction.editReply('✅ TTS Live Started! Type `!tts <text>`');
            } catch (err) {
                console.error(err);
                await this.sendError(interaction, 'Failed to connect. Ensure bot has permissions.');
            }
        } else {
            this.cleanup(guildId);
            await interaction.editReply('🛑 TTS Stopped.');
        }
    },

    setupMessageListener(client, guildId) {
        const handler = async (msg) => {
            const session = activeSessions.get(guildId);
            if (!session || msg.author.bot || msg.channel.id !== session.channelId || !msg.content.startsWith('!tts ')) return;

            const text = msg.content.slice(5).trim();
            if (!text) return;

            messageQueue.get(guildId).push({ text, language: session.language });
            if (!session.isPlaying) this.processQueue(guildId);
        };
        client.on('messageCreate', handler);
    },

    async processQueue(guildId) {
        const session = activeSessions.get(guildId);
        const queue = messageQueue.get(guildId);
        if (!session || !queue || queue.length === 0) return (session.isPlaying = false);

        session.isPlaying = true;
        const item = queue.shift();
        const tempFile = path.join(__dirname, `tts_${Date.now()}.mp3`);
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${item.language}&client=tw-ob&q=${encodeURIComponent(item.text)}`;

        try {
            await this.downloadFile(ttsUrl, tempFile);
            const resource = createAudioResource(tempFile);
            session.player.play(resource);
            session.player.once(AudioPlayerStatus.Idle, () => {
                try { fs.unlinkSync(tempFile); } catch (e) {}
                this.processQueue(guildId);
            });
        } catch (e) {
            session.isPlaying = false;
            this.processQueue(guildId);
        }
    },

    downloadFile(url, dest) {
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(dest);
            https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
                res.pipe(file);
                file.on('finish', resolve);
            }).on('error', reject);
        });
    },

    cleanup(guildId) {
        const session = activeSessions.get(guildId);
        if (session) session.connection.destroy();
        activeSessions.delete(guildId);
        messageQueue.delete(guildId);
    },

    sendError(i, msg) { i.editReply(`❌ ${msg}`); }
};
