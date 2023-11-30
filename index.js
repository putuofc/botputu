const {
default: makeWASocket,
DisconnectReason,
delay,
useMultiFileAuthState,
generateForwardMessageContent,
downloadContentFromMessage,
makeInMemoryStore,
fetchLatestBaileysVersion,
getBinaryNodeMessages,
makeCacheableSignalKeyStore,
jidDecode,
jidNormalizedUser,
PHONENUMBER_MCC,
proto
} = require('@adiwajshing/baileys');
const pino = require('pino');
const { Boom } = require('@hapi/boom');
const { join } = require("path");
const Jimp = require('jimp')
const lolcatjs = require('lolcatjs');
const fs = require("fs");
const util = require("util");
const speed = require("performance-now");
const os = require("os");
const chalk = require("chalk");
const moment = require("moment-timezone");
const readline = require("readline");
const axios = require('axios');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const question = (text) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(text, resolve)
    })
};

//Function
async function downloadM(msg) {
if (!msg) throw new Error("message can not be empty")
let type = Object.keys(msg.message)[0]
msg = msg.message[type]?.contextInfo?.quotedMessage ?? msg.message
let quotedType = Object.keys(msg)[0]
let stream = await downloadContentFromMessage(msg[quotedType],
quotedType.split("M")[0])
let buff = await streamToBuff(stream)
return buff
}

const color = (text, color) => {
return !color ? chalk.green(text) : chalk.keyword(color)(text)
}


function deletePath(path) {
return fs.unlinkSync(path)
}

const generateProfilePicture = async (buffer) => {
    const jimp = await Jimp.read(buffer)
    const min = jimp.getWidth()
    const max = jimp.getHeight()
    const cropped = jimp.crop(0, 0, min, max)
    return {
        img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
        preview: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG)
    }
  }


function formatWaktu(seconds) {
seconds = Number(seconds);
var d = Math.floor(seconds / (3600 * 24));
var h = Math.floor(seconds % (3600 * 24) / 3600);
var m = Math.floor(seconds % 3600 / 60);
var s = Math.floor(seconds % 60);
var dDisplay = d > 0 ? d + (d == 1 ? " hari, " : " hari, ") : "";
var hDisplay = h > 0 ? h + (h == 1 ? " jam, " : " jam, ") : "";
var mDisplay = m > 0 ? m + (m == 1 ? " menit, " : " menit, ") : "";
var sDisplay = s > 0 ? s + (s == 1 ? " detik" : " detik") : "";
return dDisplay + hDisplay + mDisplay + sDisplay;
}
function formatTanggal(numer) {
const myMonths = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const myDays = ['Minggu','Senin','Selasa','Rabu','Kamis','Jum’at','Sabtu']; 
const tgl = new Date(numer);
const day = tgl.getDate();
const bulan = tgl.getMonth();
const thisDay = tgl.getDay();
const formattedDay = myDays[thisDay];
const yy = tgl.getYear();
const year = (yy < 1000) ? yy + 1900 : yy; 
const time = moment.tz('Asia/Jakarta').format('DD/MM HH:mm:ss');
const d = new Date();
const gmt = new Date(0).getTime() - new Date('1 January 1970').getTime();
const weton = ['Pahing', 'Pon','Wage','Kliwon','Legi'][Math.floor(((d * 1) + gmt) / 84600000) % 5];

return `${formattedDay}, ${day} - ${myMonths[bulan]} - ${year}`;
}
async function formatSize(bytes, si = true, dp = 2) {
const thresh = si ? 1000 : 1024;

if (Math.abs(bytes) < thresh) {
return `${bytes} B`;
}

const units = si
? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
: ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
let u = -1;
const r = 10 ** dp;

do {
bytes /= thresh;
++u;
} while (
Math.round(Math.abs(bytes) * r) / r >= thresh &&
u < units.length - 1
);

return `${bytes.toFixed(dp)} ${units[u]}`;
}
app.get('/', (_, res) => {
  res.sendFile(join(__dirname, '/index.html'));
});
//Web Page
app.all('/status', async (req, res) => {
const laten = speed();
const tenla = speed() - laten;
const output = `
      ◦ Speed: ${tenla.toFixed(4)} ms
      ◦ Runtime: ${await formatWaktu(process.uptime())}
      ◦ RAM: ${await formatSize(os.totalmem() - os.freemem())} / ${await formatSize(os.totalmem())}
      ◦ FreeRAM: ${await formatSize(os.freemem())}
      ◦ Server Date & Time: ${moment.tz('Asia/Jakarta').format('HH:mm:ss')} WIB
      ◦ All cpu: ${os.cpus().length}
      ◦ Type cpu: ${os.cpus()[0]?.model ?? "Not Detected"}
      ◦ Speed cpu: ${os.cpus()[0]?.speed ?? "Not Detected"}
      ◦ platform: ${os.platform()} ${os.arch()}
      ◦ Hostname: ${os.hostname()}
      ◦ Tanggal: ${formatTanggal(Date.now())}`;
res.set('Refresh', '1'); // Setel ulang halaman setiap 1 detik
res.type('text/plain').send(output);
});

   app.listen(PORT, () => {
                 lolcatjs.fromString(`[ Express listening on port ] ${PORT}`);
});

const setting = {
owner: ['6287752825741@s.whatsapp.net'],
prefix: '.',
};
const usePairingCode = true
async function startptz() {
const { state, saveCreds } = await useMultiFileAuthState('sesi')
const ptz = makeWASocket({
logger: pino({ level: 'silent' }),
printQRInTerminal: !usePairingCode,
auth: state,
browser: ['Chrome (Linux)', '', '']
});

if(usePairingCode && !ptz.authState.creds.registered) {
const phoneNumber = await question(color('\n\n\nSilahkan masukin nomor Whatsapp Awali dengan 62:\n', 'magenta'));
const code = await ptz.requestPairingCode(phoneNumber.trim())
console.log(color(`⚠︎ Kode Pairing Bot Whatsapp kamu :`,"gold"), color(`${code}`, "white"))

}
ptz.ev.on('connection.update', (update) => {
const {
connection,
lastDisconnect,
qr
} = update;
if (connection === 'close') {
let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
if (reason === DisconnectReason.badSession) {
console.log('Bad Session File, Please Delete Session and Scan Again');
startptz();
} else if (reason === DisconnectReason.connectionClosed) {
console.log('Connection closed, reconnecting....');
startptz();
} else if (reason === DisconnectReason.connectionLost) {
console.log('Connection Lost from Server, reconnecting...');
startptz();
} else if (reason === DisconnectReason.connectionReplaced) {
console.log('Connection Replaced, Another New Session Opened, Please Close Current Session First');
startptz();
} else if (reason === DisconnectReason.loggedOut) {
console.log('Device Logged Out, Please Scan Again And Run.');
// process.exit();
//startptz();
} else if (reason === DisconnectReason.restartRequired) {
console.log('Restart Required, Restarting...');
startptz();
} else if (reason === DisconnectReason.timedOut) {
console.log('Connection TimedOut, Reconnecting...');
startptz();
} else {
ptz.end(`Unknown DisconnectReason: ${reason}|${connection}`);
}
} else if (connection === 'connecting') {
lolcatjs.fromString('[Sedang mengkoneksikan]');
} else if (connection === 'open') {
lolcatjs.fromString('[Connecting to] WhatsApp web');
lolcatjs.fromString('[Connected] ' + JSON.stringify(ptz.user.id, null, 2));
}
});

ptz.ev.on("messages.upsert",
async (message) => {
try {
if (!message.messages[0]) return;
let timestamp = new Date();
let msg = message.messages[0];
if (!msg.message) return;
let type = Object.keys(msg.message)[0];
let from = msg.key.remoteJid;
let isGroup = from.endsWith("@g.us");
let sender = msg.key.fromMe ? ptz.user.jid : msg.participant ? msg.participant : msg.key.participant ? msg.key.participant : from;
let metadata = isGroup ? await ptz.groupMetadata(from) : "";
let isMeAdmin = isGroup ? metadata.participants.find(v => v.id == ptz.user.id.split(":")[0] + "@s.whatsapp.net").admin : "";
let isAdmin = isGroup ? metadata.participants.find(u => u.id == sender)?.admin : "";
isMeAdmin = isMeAdmin == "admin" || isMeAdmin == "superadmin";
isAdmin = isAdmin == "admin" || isAdmin == "superadmin";
let pushname = msg.pushName;
let body = msg.message?.conversation || msg.message?.imageMessage?.caption || msg.message?.videoMessage?.caption || msg.message?.extendedTextMessage?.text || msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId || msg.message?.buttonsResponseMessage?.selectedButtonId || "";
let quoted = msg.message?.imageMessage || msg.message?.videoMessage ||
msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage ||
msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage || null
  var budy = typeof msg.text == "string" ? m.text : "";
let args = body.trim().split(/ +/).slice(1);
let q = text = args.join(" ") || "";
let command = body.slice(0).trim().split(/ +/).shift().toLowerCase();
let time = moment.tz("Asia/Jakarta").format("HH:mm:ss");
let prefix = setting.prefix;
  const isCmd = body.startsWith(prefix);
const botNumber = "6285658939117@s.whatsapp.net"
if (isCmd) {
let titida = ['composing', 'recording']
yte = titida[Math.floor(titida.length * Math.random())]
ptz.readMessages([msg.key])
ptz.sendPresenceUpdate(yte, from)
}


function reply(text) {
ptz.sendMessage(from, {
text
}, {
quoted: msg
})
}
switch (command) {
    case prefix + "ai":{
if (!text) return reply('Mau nanya apa sama putu')
        let response = await axios.get(`https://aemt.me/gpt4?text=${text}`)
let hasil = `${response.data.result}`
reply(hasil);
}
break
}} catch (e) {
console.log(e)
}
});

ptz.ev.on('creds.update', saveCreds);
}

// dijalankan di file utama
startptz();
