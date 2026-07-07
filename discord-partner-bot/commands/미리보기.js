const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('미리보기')
    .setDescription('현재 저장된 메시지가 어떻게 전송되는지 미리 확인합니다'),

  async execute(interaction, { loadData }) {
    const guildId = interaction.guildId;
    const data = loadData(guildId);

    if (!data.message) {
      return interaction.reply({
        content: '❌ 아직 보낼 문구가 설정되지 않았습니다. `/보낼문구`로 먼저 설정해주세요.',
        flags: 64
      });
    }

    // 줄바꿈 개수 확인
    const lineCount = (data.message.match(/\n/g) || []).length + 1;

    await interaction.reply({
      content: [
        `📋 **저장된 메시지 정보**`,
        `글자 수: ${data.message.length}자 | 줄 수: ${lineCount}줄`,
        ``,
        `**── 실제 전송될 모습 ──**`,
        data.message,
        `**── 여기까지 ──**`
      ].join('\n'),
      flags: 64
    });
  }
};
