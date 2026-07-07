require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

// 커맨드 파일 로드
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  }
}

// 서버별 활성 인터벌 저장
const activeIntervals = new Map();

// 데이터 로드
function loadData(guildId) {
  const dataPath = path.join(__dirname, 'data', `${guildId}.json`);
  const defaultData = { webhooks: [], interval: null, message: null, botName: '파트너봇', active: false };
  if (!fs.existsSync(dataPath)) return defaultData;
  try {
    return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  } catch (err) {
    console.error(`데이터 파일 파싱 오류 (${guildId}):`, err.message);
    return defaultData;
  }
}

// 데이터 저장
function saveData(guildId, data) {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, `${guildId}.json`), JSON.stringify(data, null, 2));
}

// 웹훅으로 메시지 전송
async function sendToWebhooks(guildId) {
  const data = loadData(guildId);
  if (!data.active || !data.message || data.webhooks.length === 0) return;

  for (const webhookUrl of data.webhooks) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: data.botName || '파트너봇',
          ...(data.avatarUrl ? { avatar_url: data.avatarUrl } : {}),
          content: data.message
        })
      });
      if (!response.ok) {
        console.error(`웹훅 전송 실패 [${webhookUrl}]: HTTP ${response.status}`);
      }
    } catch (err) {
      console.error(`웹훅 전송 오류 [${webhookUrl}]:`, err.message);
    }
  }
}

// 인터벌 시작
function startInterval(guildId, data) {
  stopInterval(guildId);
  const ms = data.interval * 60 * 60 * 1000;
  const interval = setInterval(() => sendToWebhooks(guildId), ms);
  activeIntervals.set(guildId, interval);
}

// 인터벌 중지
function stopInterval(guildId) {
  if (activeIntervals.has(guildId)) {
    clearInterval(activeIntervals.get(guildId));
    activeIntervals.delete(guildId);
  }
}

// 봇 재시작 시 활성 인터벌 복원
function restoreIntervals() {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) return;

  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
  let restored = 0;
  for (const file of files) {
    const gId = file.replace('.json', '');
    const data = loadData(gId);
    if (data.active && data.webhooks.length > 0 && data.message && data.interval) {
      startInterval(gId, data);
      restored++;
    }
  }
  if (restored > 0) console.log(`✅ ${restored}개 서버의 자동 발송이 복원되었습니다.`);
}

client.once('ready', () => {
  console.log(`✅ ${client.user.tag} 봇이 준비되었습니다!`);
  restoreIntervals();
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, {
      loadData,
      saveData,
      startInterval,
      stopInterval,
      activeIntervals,
      sendToWebhooks
    });
  } catch (error) {
    console.error('명령어 실행 오류:', error);
    const reply = { content: '❌ 명령어 실행 중 오류가 발생했습니다.', flags: 64 };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
