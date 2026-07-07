const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('도움말')
    .setDescription('파트너봇 사용법을 안내합니다'),

  async execute(interaction, { loadData }) {
    const guildId = interaction.guildId;
    const data = loadData(guildId);

    const statusEmoji = data.active ? '🟢' : '🔴';
    const statusText = data.active ? '발송 중' : '중지됨';

    let hours = data.interval;
    let intervalDisplay = '미설정';
    if (hours) {
      if (hours < 1) {
        intervalDisplay = `${hours * 60}분`;
      } else if (hours === 1) {
        intervalDisplay = '1시간';
      } else if (Number.isInteger(hours)) {
        intervalDisplay = `${hours}시간`;
      } else {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        intervalDisplay = h > 0 ? `${h}시간 ${m}분` : `${m}분`;
      }
    }

    const embed = new EmbedBuilder()
      .setTitle('📖 파트너봇 사용법')
      .setColor(0x5865F2)
      .setDescription('디스코드 서버 파트너 채널에 자동으로 메시지를 보내주는 봇입니다.')
      .addFields(
        {
          name: '📋 명령어 목록',
          value: [
            '`/웹훅등록 [url]`\n메시지를 보낼 웹훅 URL 등록 (최대 20개)',
            '',
            '`/주기설정 [시간]`\n몇 시간에 1번 메시지를 보낼지 설정',
            '',
            '`/보낼문구 [메시지]`\n웹훅으로 전송할 메시지 내용 설정',
            '',
            '`/보내기시작 [봇이름]`\n자동 메시지 발송 시작 (봇 이름 설정 가능)',
            '',
            '`/보내기중지`\n자동 발송 중지 (설정은 유지됨)',
            '',
            '`/세팅초기화`\n모든 설정 초기화 및 발송 중지',
            '',
            '`/도움말`\n이 도움말 보기'
          ].join('\n')
        },
        {
          name: '📌 사용 순서',
          value: [
            '**1단계** → `/웹훅등록`으로 웹훅 URL 등록',
            '**2단계** → `/주기설정`으로 발송 주기 설정',
            '**3단계** → `/보낼문구`로 보낼 메시지 작성',
            '**4단계** → `/보내기시작`으로 봇 이름 설정 후 발송 시작',
            '**일시중지** → `/보내기중지`로 발송만 중지 (설정 유지)',
            '**초기화** → `/세팅초기화`로 모든 설정 삭제'
          ].join('\n')
        },
        {
          name: '💡 웹훅 URL 얻는 방법',
          value: '채널 편집 → 연동 → 웹후크 → 새 웹후크 → URL 복사'
        },
        {
          name: `${statusEmoji} 현재 이 서버 상태`,
          value: [
            `발송 상태: **${statusText}**`,
            `등록된 웹훅: **${data.webhooks.length}개**`,
            `발송 주기: **${intervalDisplay}**`,
            `전송 문구: **${data.message ? '설정됨' : '미설정'}**`,
            `봇 이름: **${data.botName || '파트너봇'}**`
          ].join('\n')
        }
      )
      .setFooter({ text: '파트너봇 • 자동 파트너 메시지 발송' });

    return interaction.reply({ embeds: [embed], flags: 64 });
  }
};
