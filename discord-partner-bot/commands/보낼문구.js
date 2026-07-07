const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('보낼문구')
    .setDescription('웹훅으로 전송할 메시지 내용을 설정합니다 (팝업 창에서 입력)'),

  async execute(interaction, { loadData, saveData }) {
    const guildId = interaction.guildId;
    const data = loadData(guildId);

    // 팝업(Modal) 생성 - 줄바꿈, 빈 줄 모두 그대로 입력 가능
    const modal = new ModalBuilder()
      .setCustomId(`보낼문구_modal_${guildId}`)
      .setTitle('보낼 메시지 입력');

    const messageInput = new TextInputBuilder()
      .setCustomId('message_input')
      .setLabel('전송할 메시지 (Enter로 줄바꿈 가능)')
      .setStyle(TextInputStyle.Paragraph)  // 여러 줄 입력
      .setRequired(true)
      .setMaxLength(2000)
      .setPlaceholder('여기에 메시지를 입력하세요...\n줄바꿈, 빈 줄 모두 그대로 전송됩니다.');

    // 기존 메시지가 있으면 미리 채워주기
    if (data.message) {
      messageInput.setValue(data.message);
    }

    const row = new ActionRowBuilder().addComponents(messageInput);
    modal.addComponents(row);

    // 팝업 띄우기
    await interaction.showModal(modal);

    // 팝업 제출 대기 (5분)
    try {
      const submitted = await interaction.awaitModalSubmit({
        filter: i => i.customId === `보낼문구_modal_${guildId}` && i.user.id === interaction.user.id,
        time: 300_000
      });

      // CRLF → LF 통일, 앞뒤 공백 제거
      const message = submitted.fields.getTextInputValue('message_input')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .trimEnd();

      const freshData = loadData(guildId);
      freshData.message = message;
      saveData(guildId, freshData);

      const preview = message.length > 150 ? message.slice(0, 150) + '...' : message;

      await submitted.reply({
        content: `✅ 전송할 문구가 설정되었습니다!\n\n📝 **미리보기:**\n\`\`\`\n${preview}\n\`\`\``,
        flags: 64
      });
    } catch {
      // 시간 초과 시 조용히 종료
    }
  }
};
