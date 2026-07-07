const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('보내기중지')
    .setDescription('자동 메시지 발송을 중지합니다 (설정은 유지됩니다)'),

  async execute(interaction, { loadData, saveData, stopInterval }) {
    const guildId = interaction.guildId;
    const data = loadData(guildId);

    if (!data.active) {
      return interaction.reply({
        content: '⚠️ 현재 발송이 진행 중이지 않습니다.',
        flags: 64
      });
    }

    stopInterval(guildId);
    data.active = false;
    saveData(guildId, data);

    return interaction.reply({
      content: [
        '⏹️ 자동 메시지 발송이 중지되었습니다.',
        '',
        '설정은 그대로 유지됩니다.',
        '다시 시작하려면 `/보내기시작`을 사용하세요.'
      ].join('\n'),
      flags: 64
    });
  }
};
