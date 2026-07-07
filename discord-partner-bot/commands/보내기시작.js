const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('보내기시작')
    .setDescription('설정된 웹훅으로 자동 메시지 발송을 시작합니다')
    .addStringOption(option =>
      option
        .setName('봇이름')
        .setDescription('웹훅 메시지에 표시될 봇 이름 (기본값: 파트너봇)')
        .setRequired(false)
        .setMaxLength(80)
    ),

  async execute(interaction, { loadData, saveData, startInterval, sendToWebhooks }) {
    const botName = interaction.options.getString('봇이름');
    const guildId = interaction.guildId;

    const data = loadData(guildId);

    // 필수 설정 확인
    const missing = [];
    if (data.webhooks.length === 0) missing.push('• 웹훅 URL (`/웹훅등록`)');
    if (!data.interval) missing.push('• 발송 주기 (`/주기설정`)');
    if (!data.message) missing.push('• 전송 문구 (`/보낼문구`)');

    if (missing.length > 0) {
      return interaction.reply({
        content: `❌ 발송을 시작하려면 아래 설정이 필요합니다:\n${missing.join('\n')}`,
        flags: 64
      });
    }

    // 봇 이름 업데이트
    if (botName) {
      data.botName = botName;
    }

    data.active = true;
    saveData(guildId, data);

    // 인터벌 시작
    startInterval(guildId, data);

    // 즉시 1회 전송
    await sendToWebhooks(guildId);

    let hours = data.interval;
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

    return interaction.reply({
      content: [
        `🚀 자동 메시지 발송이 시작되었습니다!`,
        ``,
        `🤖 봇 이름: **${data.botName}**`,
        `🔗 등록된 웹훅: **${data.webhooks.length}개**`,
        `⏱️ 발송 주기: **${display}에 1번**`,
        `📝 메시지: \`${data.message.slice(0, 50)}${data.message.length > 50 ? '...' : ''}\``,
        ``,
        `✅ 지금 즉시 1회 발송되었습니다!`
      ].join('\n'),
      flags: 64
    });
  }
};
