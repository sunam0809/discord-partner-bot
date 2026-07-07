const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('웹훅등록')
    .setDescription('메시지를 보낼 웹훅 URL을 등록합니다 (최대 20개)')
    .addStringOption(option =>
      option
        .setName('url')
        .setDescription('디스코드 웹훅 URL')
        .setRequired(true)
    ),

  async execute(interaction, { loadData, saveData }) {
    const url = interaction.options.getString('url');
    const guildId = interaction.guildId;

    // URL 형식 검증
    if (!url.startsWith('https://discord.com/api/webhooks/') && !url.startsWith('https://discordapp.com/api/webhooks/')) {
      return interaction.reply({
        content: '❌ 올바른 디스코드 웹훅 URL이 아닙니다.\n`https://discord.com/api/webhooks/...` 형식이어야 합니다.',
        flags: 64
      });
    }

    const data = loadData(guildId);

    // 중복 확인
    if (data.webhooks.includes(url)) {
      return interaction.reply({
        content: '⚠️ 이미 등록된 웹훅 URL입니다.',
        flags: 64
      });
    }

    // 최대 20개 제한
    if (data.webhooks.length >= 20) {
      return interaction.reply({
        content: `❌ 웹훅은 최대 20개까지만 등록할 수 있습니다.\n현재 등록된 웹훅: **${data.webhooks.length}개**\n먼저 \`/세팅초기화\`로 초기화하거나 일부를 삭제해주세요.`,
        flags: 64
      });
    }

    data.webhooks.push(url);
    saveData(guildId, data);

    return interaction.reply({
      content: `✅ 웹훅이 등록되었습니다!\n현재 등록된 웹훅: **${data.webhooks.length}개 / 20개**`,
      flags: 64
    });
  }
};
