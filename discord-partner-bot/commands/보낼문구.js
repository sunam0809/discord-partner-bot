const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('보낼문구')
    .setDescription('웹훅으로 전송할 메시지 내용을 설정합니다')
    .addStringOption(option =>
      option
        .setName('메시지')
        .setDescription('전송할 메시지 내용')
        .setRequired(true)
        .setMaxLength(2000)
    ),

  async execute(interaction, { loadData, saveData }) {
    const raw = interaction.options.getString('메시지');
    // \n 을 실제 줄바꿈으로 변환 (슬래시 커맨드에서 Enter 불가 문제 해결)
    const message = raw.replace(/\\n/g, '\n');
    const guildId = interaction.guildId;

    const data = loadData(guildId);
    data.message = message;
    saveData(guildId, data);

    const preview = message.length > 100 ? message.slice(0, 100) + '...' : message;

    return interaction.reply({
      content: `✅ 전송할 문구가 설정되었습니다!\n\n📝 **미리보기:**\n\`\`\`\n${preview}\n\`\`\``,
      flags: 64
    });
  }
};
