const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('주기설정')
    .setDescription('메시지를 보낼 주기를 설정합니다')
    .addNumberOption(option =>
      option
        .setName('시간')
        .setDescription('몇 시간에 1번 보낼지 설정 (예: 24 = 24시간에 1번)')
        .setRequired(true)
        .setMinValue(0.5)
        .setMaxValue(168)
    ),

  async execute(interaction, { loadData, saveData }) {
    const hours = interaction.options.getNumber('시간');
    const guildId = interaction.guildId;

    const data = loadData(guildId);
    data.interval = hours;
    saveData(guildId, data);

    // 시간 표시 정리
    let display;
    if (hours < 1) {
      display = `${hours * 60}분`;
    } else if (hours === 1) {
      display = '1시간';
    } else if (Number.isInteger(hours)) {
      display = `${hours}시간`;
    } else {
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      display = h > 0 ? `${h}시간 ${m}분` : `${m}분`;
    }

    let note = '';
    if (data.active) {
      note = '\n\n⚠️ 현재 발송이 진행 중입니다. 새 주기를 적용하려면 `/보내기시작`을 다시 실행해주세요.';
    }

    return interaction.reply({
      content: `✅ 발송 주기가 설정되었습니다!\n⏱️ **${display}에 1번** 메시지를 보냅니다.${note}`,
      flags: 64
    });
  }
};
