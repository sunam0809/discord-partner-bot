const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('세팅초기화')
    .setDescription('모든 설정을 초기화하고 자동 발송을 중지합니다'),

  async execute(interaction, { loadData, saveData, stopInterval }) {
    const guildId = interaction.guildId;
    const data = loadData(guildId);

    // 확인 버튼 생성
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('reset_confirm')
        .setLabel('✅ 초기화 확인')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('reset_cancel')
        .setLabel('❌ 취소')
        .setStyle(ButtonStyle.Secondary)
    );

    const confirmMsg = await interaction.reply({
      content: [
        `⚠️ **정말로 모든 설정을 초기화하시겠습니까?**`,
        ``,
        `현재 설정:`,
        `🔗 등록된 웹훅: **${data.webhooks.length}개**`,
        `⏱️ 발송 주기: **${data.interval ? data.interval + '시간' : '미설정'}**`,
        `📝 메시지: **${data.message ? '설정됨' : '미설정'}**`,
        `🔄 발송 상태: **${data.active ? '진행 중' : '중지됨'}**`,
        ``,
        `초기화하면 모든 설정이 삭제되고 자동 발송이 중지됩니다.`
      ].join('\n'),
      components: [row],
      flags: 64,
      fetchReply: true
    });

    // 버튼 응답 대기 (30초)
    const filter = i => i.user.id === interaction.user.id;
    try {
      const buttonInteraction = await confirmMsg.awaitMessageComponent({ filter, time: 30_000 });

      if (buttonInteraction.customId === 'reset_confirm') {
        // 인터벌 중지
        stopInterval(guildId);

        // 데이터 파일 삭제
        const dataPath = path.join(__dirname, '..', 'data', `${guildId}.json`);
        if (fs.existsSync(dataPath)) {
          fs.unlinkSync(dataPath);
        }

        await buttonInteraction.update({
          content: '✅ 모든 설정이 초기화되었습니다. 자동 발송이 중지되었습니다.',
          components: []
        });
      } else {
        await buttonInteraction.update({
          content: '❌ 초기화가 취소되었습니다.',
          components: []
        });
      }
    } catch {
      await interaction.editReply({
        content: '⏰ 시간이 초과되어 초기화가 취소되었습니다.',
        components: []
      });
    }
  }
};
