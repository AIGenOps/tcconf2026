#!/usr/bin/env node
// ============================================================================
//  ⚡ ThunderCipher Conference 2026 — Admin CLI Tool
//  Single-file interactive administration console
//  Node.js built-in modules only: readline, fs, path, crypto
// ============================================================================

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ─── Paths ──────────────────────────────────────────────────────────────────
const BASE_DIR = path.join(__dirname, 'src', 'data');
const PROMOS_PATH = path.join(BASE_DIR, 'promos.json');
const REGISTRATIONS_PATH = path.join(BASE_DIR, 'registrations.json');
const BACKUPS_DIR = path.join(__dirname, 'backups');

// ─── Encryption constants ───────────────────────────────────────────────────
const ALGORITHM = 'aes-256-gcm';
const DB_SECRET = 'dev_default_secret_thunder_cipher_2026_key_32_bytes';

// ─── Ticket tiers ───────────────────────────────────────────────────────────
const TICKET_TIERS = {
  student: { name: 'Student Pass', price: 999 },
  individual: { name: 'Individual Pass', price: 1499 },
  woman_in_cyber: { name: 'Woman in Cyber Pass', price: 1399 },
  corporate: { name: 'Corporate Pass', price: 2499 },
};

// ─── ANSI Color helpers ─────────────────────────────────────────────────────
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  bgCyan: '\x1b[46m',
  bgRed: '\x1b[41m',
};

function cyan(t) { return `${C.cyan}${t}${C.reset}`; }
function green(t) { return `${C.green}${t}${C.reset}`; }
function red(t) { return `${C.red}${t}${C.reset}`; }
function yellow(t) { return `${C.yellow}${t}${C.reset}`; }
function bold(t) { return `${C.bold}${t}${C.reset}`; }
function dim(t) { return `${C.dim}${t}${C.reset}`; }
function magenta(t) { return `${C.magenta}${t}${C.reset}`; }

// ─── Default promo seed ─────────────────────────────────────────────────────
const DEFAULT_PROMO = {
  code: 'EHAQK5KS2B',
  discountType: 'fixed',
  discountValue: 1,
  targetTier: '*',
  enabled: true,
  expiryDate: null,
  maxUses: null,
  currentUses: 0,
  singleUsePerEmail: false,
  minQuantity: 1,
  usedEmails: [],
  note: 'Testing promo',
  createdAt: new Date().toISOString(),
};

const DEFAULT_PROMOS_FILE = {
  promos: [DEFAULT_PROMO],
  settings: { password: 'tc2026admin' },
};

// ─── Readline singleton ─────────────────────────────────────────────────────
let rl;
function getRL() {
  if (!rl) {
    rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  }
  return rl;
}

function ask(prompt) {
  return new Promise((resolve) => {
    getRL().question(prompt, (answer) => resolve(answer.trim()));
  });
}

function askHidden(prompt) {
  return new Promise((resolve) => {
    const r = getRL();
    process.stdout.write(prompt);
    const origWrite = process.stdout.write.bind(process.stdout);
    // Mute output while typing password
    let input = '';
    const onData = (char) => {
      const c = char.toString();
      if (c === '\n' || c === '\r') {
        process.stdin.removeListener('data', onData);
        process.stdin.setRawMode && process.stdin.setRawMode(false);
        origWrite('\n');
        resolve(input.trim());
        return;
      }
      if (c === '\u0003') { // Ctrl+C
        process.exit(0);
      }
      if (c === '\u007F' || c === '\b') { // Backspace
        input = input.slice(0, -1);
        return;
      }
      input += c;
      origWrite('*');
    };
    if (process.stdin.setRawMode) {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.on('data', onData);
    } else {
      // Fallback — raw mode not available (piped input)
      r.question('', (answer) => resolve(answer.trim()));
    }
  });
}

// ─── File I/O ───────────────────────────────────────────────────────────────
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadPromos() {
  if (!fs.existsSync(PROMOS_PATH)) {
    ensureDir(path.dirname(PROMOS_PATH));
    fs.writeFileSync(PROMOS_PATH, JSON.stringify(DEFAULT_PROMOS_FILE, null, 2), 'utf8');
    return JSON.parse(JSON.stringify(DEFAULT_PROMOS_FILE));
  }
  try {
    return JSON.parse(fs.readFileSync(PROMOS_PATH, 'utf8'));
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_PROMOS_FILE));
  }
}

function savePromos(data) {
  ensureDir(path.dirname(PROMOS_PATH));
  fs.writeFileSync(PROMOS_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function getEncryptionKey() {
  return crypto.createHash('sha256').update(DB_SECRET).digest();
}

function decryptText(encryptedText) {
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const ciphertext = parts[2];
  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function loadRegistrations() {
  if (!fs.existsSync(REGISTRATIONS_PATH)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(REGISTRATIONS_PATH, 'utf8').trim();
    if (!raw) return [];
    // If it starts with '[' or '{', it's plain JSON
    if (raw.startsWith('[') || raw.startsWith('{')) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [parsed];
    }
    // Otherwise it's encrypted
    const decrypted = decryptText(raw);
    const parsed = JSON.parse(decrypted);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (err) {
    console.log(red(`  ✗ Error loading registrations: ${err.message}`));
    return [];
  }
}

// ─── Utility helpers ────────────────────────────────────────────────────────
function pad(str, len, alignRight = false) {
  const s = String(str).substring(0, len);
  return alignRight ? s.padStart(len) : s.padEnd(len);
}

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function generateCode(prefix = '', length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return prefix ? `${prefix}-${code}` : code;
}

function isToday(iso) {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
}

function clearScreen() {
  console.clear();
}

function pressEnter() {
  return ask(`\n  ${dim('Press Enter to continue...')}`);
}

// ─── Box / Table drawing ────────────────────────────────────────────────────
function drawBox(lines, width = 48) {
  const top = `  ${C.cyan}╔${'═'.repeat(width)}╗${C.reset}`;
  const bot = `  ${C.cyan}╚${'═'.repeat(width)}╝${C.reset}`;
  console.log(top);
  for (const line of lines) {
    // Strip ANSI for length calculation
    const stripped = line.replace(/\x1b\[[0-9;]*m/g, '');
    const padding = width - stripped.length;
    const rPad = padding > 0 ? ' '.repeat(padding) : '';
    console.log(`  ${C.cyan}║${C.reset}${line}${rPad}${C.cyan}║${C.reset}`);
  }
  console.log(bot);
}

function drawSeparator(width = 48) {
  console.log(`  ${C.cyan}╠${'═'.repeat(width)}╣${C.reset}`);
}

function drawTable(headers, rows, colWidths) {
  const totalWidth = colWidths.reduce((a, b) => a + b, 0) + colWidths.length + 1;
  const sep = `  ${C.dim}${'─'.repeat(totalWidth)}${C.reset}`;

  // Header
  let headerLine = `  ${C.dim}│${C.reset}`;
  headers.forEach((h, i) => {
    headerLine += `${C.bold}${C.cyan} ${pad(h, colWidths[i] - 1)} ${C.reset}${C.dim}│${C.reset}`;
  });
  console.log(sep);
  console.log(headerLine);
  console.log(sep);

  // Rows
  for (const row of rows) {
    let line = `  ${C.dim}│${C.reset}`;
    row.forEach((cell, i) => {
      line += ` ${pad(String(cell), colWidths[i] - 1)} ${C.dim}│${C.reset}`;
    });
    console.log(line);
  }
  console.log(sep);
  console.log(dim(`  ${rows.length} row(s)`));
}

// ─── ASCII Art Banner ───────────────────────────────────────────────────────
function showBanner() {
  console.log(cyan(`
   ╔══════════════════════════════════════════════════════╗
   ║                                                      ║
   ║    ⚡  ████████╗ ██████╗     ██████╗ ██╗      ██╗   ║
   ║       ╚══██╔══╝██╔════╝    ██╔════╝ ██║      ██║    ║
   ║          ██║   ██║         ██║      ██║      ██║     ║
   ║          ██║   ██║         ██║      ██║      ██║     ║
   ║          ██║   ╚██████╗   ╚██████╗ ███████╗ ██║     ║
   ║          ╚═╝    ╚═════╝    ╚═════╝ ╚══════╝ ╚═╝     ║
   ║                                                      ║
   ║         ThunderCipher Conference 2026                ║
   ║              Admin Console  v1.0                     ║
   ║                                                      ║
   ╚══════════════════════════════════════════════════════╝
  `));
}

// ═══════════════════════════════════════════════════════════════════════════
//  PASSWORD GATE
// ═══════════════════════════════════════════════════════════════════════════
async function passwordGate() {
  clearScreen();
  showBanner();
  const data = loadPromos();
  const correctPwd = data.settings?.password || 'tc2026admin';

  for (let attempts = 0; attempts < 3; attempts++) {
    const pwd = await ask(`  ${C.yellow}🔒 Enter admin password: ${C.reset}`);
    if (pwd === correctPwd) {
      console.log(green('\n  ✓ Authentication successful!\n'));
      await new Promise((r) => setTimeout(r, 600));
      return true;
    }
    console.log(red(`  ✗ Incorrect password. ${2 - attempts} attempt(s) remaining.`));
  }
  console.log(red('\n  ✗ Too many failed attempts. Exiting.\n'));
  process.exit(1);
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN MENU
// ═══════════════════════════════════════════════════════════════════════════
async function mainMenu() {
  while (true) {
    clearScreen();
    console.log('');
    drawBox([
      `${C.bold}${C.cyan}   ⚡ ThunderCipher Admin CLI              ${C.reset}`,
      `                                                `,
      `   ${C.white}1.${C.reset} ${C.cyan}Promo Codes${C.reset}                             `,
      `   ${C.white}2.${C.reset} ${C.cyan}Registrations${C.reset}                           `,
      `   ${C.white}3.${C.reset} ${C.cyan}Dashboard${C.reset}                               `,
      `   ${C.white}4.${C.reset} ${C.cyan}System${C.reset}                                  `,
      `   ${C.white}5.${C.reset} ${C.red}Exit${C.reset}                                    `,
      `                                                `,
    ]);
    const choice = await ask(`\n  ${C.cyan}▸${C.reset} Select option ${dim('[1-5]')}: `);

    switch (choice) {
      case '1': await promoMenu(); break;
      case '2': await registrationsMenu(); break;
      case '3': await dashboardMenu(); break;
      case '4': await systemMenu(); break;
      case '5':
        clearScreen();
        console.log(cyan('\n  ⚡ Goodbye! ThunderCipher 2026 ⚡\n'));
        getRL().close();
        process.exit(0);
      default:
        console.log(red('  ✗ Invalid option.'));
        await pressEnter();
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  1. PROMO CODES MENU
// ═══════════════════════════════════════════════════════════════════════════
async function promoMenu() {
  while (true) {
    clearScreen();
    console.log('');
    drawBox([
      `${C.bold}${C.cyan}   🎟  Promo Code Management                ${C.reset}`,
      `                                                `,
      `   ${C.white}1.${C.reset} Create Promo Code                        `,
      `   ${C.white}2.${C.reset} List All Promo Codes                     `,
      `   ${C.white}3.${C.reset} View Promo Details                       `,
      `   ${C.white}4.${C.reset} Edit Promo Code                          `,
      `   ${C.white}5.${C.reset} Delete Promo Code                        `,
      `   ${C.white}6.${C.reset} Enable/Disable Promo                     `,
      `   ${C.white}7.${C.reset} Bulk Generate                            `,
      `   ${C.white}8.${C.reset} Search Promos                            `,
      `   ${C.white}0.${C.reset} ${C.yellow}← Back to Main Menu${C.reset}                     `,
      `                                                `,
    ]);
    const choice = await ask(`\n  ${C.cyan}▸${C.reset} Select option ${dim('[0-8]')}: `);

    switch (choice) {
      case '1': await createPromo(); break;
      case '2': await listPromos(); break;
      case '3': await viewPromoDetails(); break;
      case '4': await editPromo(); break;
      case '5': await deletePromo(); break;
      case '6': await togglePromo(); break;
      case '7': await bulkGenerate(); break;
      case '8': await searchPromos(); break;
      case '0': return;
      default:
        console.log(red('  ✗ Invalid option.'));
        await pressEnter();
    }
  }
}

// ─── Create Promo ───────────────────────────────────────────────────────────
async function createPromo() {
  clearScreen();
  console.log(bold(cyan('\n  ── Create New Promo Code ──\n')));

  const data = loadPromos();

  let code = await ask(`  Code ${dim('(leave blank to auto-generate)')}: `);
  if (!code) {
    code = generateCode('', 10);
    console.log(green(`  ✓ Auto-generated code: ${bold(code)}`));
  }
  code = code.toUpperCase();

  if (data.promos.find((p) => p.code === code)) {
    console.log(red(`  ✗ Code "${code}" already exists.`));
    await pressEnter();
    return;
  }

  console.log(dim(`\n  Discount types: fixed, percentage, flat`));
  let discountType = await ask(`  Discount type ${dim('[fixed/percentage/flat]')}: `);
  discountType = discountType.toLowerCase();
  if (!['fixed', 'percentage', 'flat'].includes(discountType)) {
    console.log(red('  ✗ Invalid discount type.'));
    await pressEnter();
    return;
  }

  const discountValueStr = await ask(`  Discount value: `);
  const discountValue = Number(discountValueStr);
  if (isNaN(discountValue) || discountValue <= 0) {
    console.log(red('  ✗ Invalid discount value.'));
    await pressEnter();
    return;
  }

  console.log(dim(`\n  Tiers: * (all), student, individual, woman_in_cyber, corporate`));
  let targetTier = await ask(`  Target tier ${dim('[* for all]')}: `);
  targetTier = targetTier || '*';
  if (targetTier !== '*' && !TICKET_TIERS[targetTier]) {
    console.log(red('  ✗ Invalid tier.'));
    await pressEnter();
    return;
  }

  const expiryStr = await ask(`  Expiry date ${dim('(YYYY-MM-DD or blank for none)')}: `);
  const expiryDate = expiryStr ? new Date(expiryStr).toISOString() : null;

  const maxUsesStr = await ask(`  Max uses ${dim('(blank for unlimited)')}: `);
  const maxUses = maxUsesStr ? Number(maxUsesStr) : null;

  const singleUseInput = await ask(`  Single use per email? ${dim('[y/N]')}: `);
  const singleUsePerEmail = singleUseInput.toLowerCase() === 'y';

  const minQtyStr = await ask(`  Min quantity ${dim('[default: 1]')}: `);
  const minQuantity = minQtyStr ? Number(minQtyStr) : 1;

  const note = await ask(`  Internal note ${dim('(optional)')}: `);

  const promo = {
    code,
    discountType,
    discountValue,
    targetTier,
    enabled: true,
    expiryDate,
    maxUses,
    currentUses: 0,
    singleUsePerEmail,
    minQuantity: minQuantity || 1,
    usedEmails: [],
    note: note || '',
    createdAt: new Date().toISOString(),
  };

  data.promos.push(promo);
  savePromos(data);

  console.log(green(`\n  ✓ Promo code ${bold(code)} created successfully!`));
  await pressEnter();
}

// ─── List Promos ────────────────────────────────────────────────────────────
async function listPromos() {
  clearScreen();
  console.log(bold(cyan('\n  ── All Promo Codes ──\n')));

  const data = loadPromos();
  if (!data.promos.length) {
    console.log(yellow('  No promo codes found.'));
    await pressEnter();
    return;
  }

  const headers = ['Code', 'Type', 'Value', 'Tier', 'Status', 'Uses', 'Expiry'];
  const widths = [14, 12, 8, 16, 10, 8, 14];
  const rows = data.promos.map((p) => [
    p.code,
    p.discountType,
    p.discountValue,
    p.targetTier === '*' ? 'All' : p.targetTier,
    p.enabled ? green('Active') : red('Disabled'),
    `${p.currentUses}${p.maxUses ? '/' + p.maxUses : ''}`,
    p.expiryDate ? formatDate(p.expiryDate) : '—',
  ]);

  drawTable(headers, rows, widths);
  await pressEnter();
}

// ─── View Promo Details ─────────────────────────────────────────────────────
async function viewPromoDetails() {
  clearScreen();
  console.log(bold(cyan('\n  ── View Promo Details ──\n')));

  const data = loadPromos();
  const code = (await ask('  Enter promo code: ')).toUpperCase();
  const promo = data.promos.find((p) => p.code === code);

  if (!promo) {
    console.log(red(`  ✗ Promo code "${code}" not found.`));
    await pressEnter();
    return;
  }

  const tierLabel = promo.targetTier === '*' ? 'All Tiers' : (TICKET_TIERS[promo.targetTier]?.name || promo.targetTier);

  console.log('');
  drawBox([
    `${C.bold}  Code:${C.reset}              ${promo.code}                  `,
    `${C.bold}  Discount Type:${C.reset}     ${promo.discountType}                  `,
    `${C.bold}  Discount Value:${C.reset}    ${promo.discountValue}                   `,
    `${C.bold}  Target Tier:${C.reset}       ${tierLabel}                 `,
    `${C.bold}  Status:${C.reset}            ${promo.enabled ? green('Enabled') : red('Disabled')}                 `,
    `${C.bold}  Expiry:${C.reset}            ${promo.expiryDate ? formatDate(promo.expiryDate) : 'None'}                  `,
    `${C.bold}  Max Uses:${C.reset}          ${promo.maxUses !== null ? promo.maxUses : 'Unlimited'}                `,
    `${C.bold}  Current Uses:${C.reset}      ${promo.currentUses}                   `,
    `${C.bold}  Single/Email:${C.reset}      ${promo.singleUsePerEmail ? 'Yes' : 'No'}                   `,
    `${C.bold}  Min Quantity:${C.reset}      ${promo.minQuantity}                   `,
    `${C.bold}  Note:${C.reset}              ${promo.note || '—'}               `,
    `${C.bold}  Created:${C.reset}           ${formatDateTime(promo.createdAt)}       `,
    `${C.bold}  Used Emails:${C.reset}       ${promo.usedEmails.length ? promo.usedEmails.join(', ') : '—'}  `,
  ], 52);
  await pressEnter();
}

// ─── Edit Promo ─────────────────────────────────────────────────────────────
async function editPromo() {
  clearScreen();
  console.log(bold(cyan('\n  ── Edit Promo Code ──\n')));

  const data = loadPromos();
  const code = (await ask('  Enter promo code to edit: ')).toUpperCase();
  const idx = data.promos.findIndex((p) => p.code === code);

  if (idx === -1) {
    console.log(red(`  ✗ Promo code "${code}" not found.`));
    await pressEnter();
    return;
  }

  const promo = data.promos[idx];
  console.log(dim(`\n  Editing: ${bold(promo.code)}`));
  console.log(`
  Fields:
   1. Discount Type      (${promo.discountType})
   2. Discount Value     (${promo.discountValue})
   3. Target Tier        (${promo.targetTier})
   4. Expiry Date        (${promo.expiryDate ? formatDate(promo.expiryDate) : 'None'})
   5. Max Uses           (${promo.maxUses !== null ? promo.maxUses : 'Unlimited'})
   6. Single Use/Email   (${promo.singleUsePerEmail ? 'Yes' : 'No'})
   7. Min Quantity       (${promo.minQuantity})
   8. Note               (${promo.note || '—'})
   0. Cancel
  `);

  const field = await ask(`  Select field to edit ${dim('[0-8]')}: `);

  switch (field) {
    case '1': {
      const val = (await ask(`  New discount type ${dim('[fixed/percentage/flat]')}: `)).toLowerCase();
      if (['fixed', 'percentage', 'flat'].includes(val)) { promo.discountType = val; }
      else { console.log(red('  ✗ Invalid type.')); await pressEnter(); return; }
      break;
    }
    case '2': {
      const val = Number(await ask('  New discount value: '));
      if (!isNaN(val) && val > 0) { promo.discountValue = val; }
      else { console.log(red('  ✗ Invalid value.')); await pressEnter(); return; }
      break;
    }
    case '3': {
      const val = await ask(`  New target tier ${dim('[* for all]')}: `);
      if (val === '*' || TICKET_TIERS[val]) { promo.targetTier = val; }
      else { console.log(red('  ✗ Invalid tier.')); await pressEnter(); return; }
      break;
    }
    case '4': {
      const val = await ask(`  New expiry date ${dim('(YYYY-MM-DD or "clear")')}: `);
      if (val.toLowerCase() === 'clear') { promo.expiryDate = null; }
      else { promo.expiryDate = new Date(val).toISOString(); }
      break;
    }
    case '5': {
      const val = await ask(`  New max uses ${dim('("unlimited" or number)')}: `);
      promo.maxUses = val.toLowerCase() === 'unlimited' ? null : Number(val);
      break;
    }
    case '6': {
      const val = (await ask(`  Single use per email? ${dim('[y/N]')}: `)).toLowerCase();
      promo.singleUsePerEmail = val === 'y';
      break;
    }
    case '7': {
      const val = Number(await ask('  New min quantity: '));
      if (!isNaN(val) && val >= 1) { promo.minQuantity = val; }
      else { console.log(red('  ✗ Invalid quantity.')); await pressEnter(); return; }
      break;
    }
    case '8': {
      promo.note = await ask('  New note: ');
      break;
    }
    case '0': return;
    default:
      console.log(red('  ✗ Invalid option.'));
      await pressEnter();
      return;
  }

  data.promos[idx] = promo;
  savePromos(data);
  console.log(green(`\n  ✓ Promo code ${bold(code)} updated successfully!`));
  await pressEnter();
}

// ─── Delete Promo ───────────────────────────────────────────────────────────
async function deletePromo() {
  clearScreen();
  console.log(bold(cyan('\n  ── Delete Promo Code ──\n')));

  const data = loadPromos();
  const code = (await ask('  Enter promo code to delete: ')).toUpperCase();
  const idx = data.promos.findIndex((p) => p.code === code);

  if (idx === -1) {
    console.log(red(`  ✗ Promo code "${code}" not found.`));
    await pressEnter();
    return;
  }

  const confirm = await ask(yellow(`  ⚠ Are you sure you want to delete "${code}"? [y/N]: `));
  if (confirm.toLowerCase() !== 'y') {
    console.log(dim('  Cancelled.'));
    await pressEnter();
    return;
  }

  data.promos.splice(idx, 1);
  savePromos(data);
  console.log(green(`\n  ✓ Promo code "${code}" deleted.`));
  await pressEnter();
}

// ─── Toggle Promo ───────────────────────────────────────────────────────────
async function togglePromo() {
  clearScreen();
  console.log(bold(cyan('\n  ── Enable/Disable Promo Code ──\n')));

  const data = loadPromos();
  const code = (await ask('  Enter promo code: ')).toUpperCase();
  const promo = data.promos.find((p) => p.code === code);

  if (!promo) {
    console.log(red(`  ✗ Promo code "${code}" not found.`));
    await pressEnter();
    return;
  }

  promo.enabled = !promo.enabled;
  savePromos(data);

  const status = promo.enabled ? green('Enabled') : red('Disabled');
  console.log(green(`\n  ✓ Promo "${code}" is now ${status}`));
  await pressEnter();
}

// ─── Bulk Generate ──────────────────────────────────────────────────────────
async function bulkGenerate() {
  clearScreen();
  console.log(bold(cyan('\n  ── Bulk Generate Promo Codes ──\n')));

  const countStr = await ask('  How many codes to generate: ');
  const count = Number(countStr);
  if (isNaN(count) || count < 1 || count > 500) {
    console.log(red('  ✗ Invalid count (1-500).'));
    await pressEnter();
    return;
  }

  const prefix = (await ask(`  Prefix ${dim('(e.g., TC2026)')}: `)).toUpperCase() || 'PROMO';

  console.log(dim(`\n  Discount types: fixed, percentage, flat`));
  let discountType = (await ask(`  Discount type ${dim('[fixed/percentage/flat]')}: `)).toLowerCase();
  if (!['fixed', 'percentage', 'flat'].includes(discountType)) {
    console.log(red('  ✗ Invalid discount type.'));
    await pressEnter();
    return;
  }

  const discountValue = Number(await ask('  Discount value: '));
  if (isNaN(discountValue) || discountValue <= 0) {
    console.log(red('  ✗ Invalid value.'));
    await pressEnter();
    return;
  }

  let targetTier = await ask(`  Target tier ${dim('[* for all]')}: `) || '*';
  if (targetTier !== '*' && !TICKET_TIERS[targetTier]) {
    console.log(red('  ✗ Invalid tier.'));
    await pressEnter();
    return;
  }

  const maxUsesStr = await ask(`  Max uses per code ${dim('(blank for unlimited)')}: `);
  const maxUses = maxUsesStr ? Number(maxUsesStr) : null;

  const singleUse = (await ask(`  Single use per email? ${dim('[y/N]')}: `)).toLowerCase() === 'y';

  const note = await ask(`  Note ${dim('(optional)')}: `) || `Bulk generated batch`;

  const data = loadPromos();
  const existingCodes = new Set(data.promos.map((p) => p.code));
  const generated = [];

  for (let i = 0; i < count; i++) {
    let code;
    do {
      code = generateCode(prefix, 5);
    } while (existingCodes.has(code));
    existingCodes.add(code);

    const promo = {
      code,
      discountType,
      discountValue,
      targetTier,
      enabled: true,
      expiryDate: null,
      maxUses,
      currentUses: 0,
      singleUsePerEmail: singleUse,
      minQuantity: 1,
      usedEmails: [],
      note,
      createdAt: new Date().toISOString(),
    };
    data.promos.push(promo);
    generated.push(code);
  }

  savePromos(data);

  console.log(green(`\n  ✓ Generated ${bold(String(count))} promo codes:`));
  generated.forEach((c, i) => {
    console.log(`    ${dim(String(i + 1).padStart(3))}. ${c}`);
  });
  await pressEnter();
}

// ─── Search Promos ──────────────────────────────────────────────────────────
async function searchPromos() {
  clearScreen();
  console.log(bold(cyan('\n  ── Search Promo Codes ──\n')));

  const query = (await ask('  Search query (code substring): ')).toUpperCase();
  if (!query) {
    console.log(red('  ✗ Please enter a search term.'));
    await pressEnter();
    return;
  }

  const data = loadPromos();
  const results = data.promos.filter((p) => p.code.includes(query));

  if (!results.length) {
    console.log(yellow(`\n  No promos matching "${query}".`));
    await pressEnter();
    return;
  }

  console.log(green(`\n  Found ${results.length} result(s):\n`));

  const headers = ['Code', 'Type', 'Value', 'Tier', 'Status', 'Uses'];
  const widths = [14, 12, 8, 16, 10, 8];
  const rows = results.map((p) => [
    p.code,
    p.discountType,
    p.discountValue,
    p.targetTier === '*' ? 'All' : p.targetTier,
    p.enabled ? green('Active') : red('Disabled'),
    `${p.currentUses}${p.maxUses ? '/' + p.maxUses : ''}`,
  ]);

  drawTable(headers, rows, widths);
  await pressEnter();
}

// ═══════════════════════════════════════════════════════════════════════════
//  2. REGISTRATIONS MENU
// ═══════════════════════════════════════════════════════════════════════════
async function registrationsMenu() {
  while (true) {
    clearScreen();
    console.log('');
    drawBox([
      `${C.bold}${C.cyan}   📋 Registrations                         ${C.reset}`,
      `                                                `,
      `   ${C.white}1.${C.reset} View All Registrations                   `,
      `   ${C.white}2.${C.reset} Search Registrations                     `,
      `   ${C.white}3.${C.reset} Export to CSV                            `,
      `   ${C.white}4.${C.reset} Registration Stats                      `,
      `   ${C.white}0.${C.reset} ${C.yellow}← Back to Main Menu${C.reset}                     `,
      `                                                `,
    ]);
    const choice = await ask(`\n  ${C.cyan}▸${C.reset} Select option ${dim('[0-4]')}: `);

    switch (choice) {
      case '1': await viewAllRegistrations(); break;
      case '2': await searchRegistrations(); break;
      case '3': await exportCSV(); break;
      case '4': await registrationStats(); break;
      case '0': return;
      default:
        console.log(red('  ✗ Invalid option.'));
        await pressEnter();
    }
  }
}

// ─── View All Registrations ─────────────────────────────────────────────────
async function viewAllRegistrations() {
  clearScreen();
  console.log(bold(cyan('\n  ── All Registrations ──\n')));

  const regs = loadRegistrations();
  if (!regs.length) {
    console.log(yellow('  No registrations found.'));
    await pressEnter();
    return;
  }

  const headers = ['#', 'Reg ID', 'Name', 'Email', 'Ticket', 'Amount', 'Date'];
  const widths = [4, 18, 18, 24, 14, 10, 14];
  const rows = regs.map((r, i) => [
    i + 1,
    r.registrationId || '—',
    (r.name || '—').substring(0, 17),
    (r.email || '—').substring(0, 23),
    (r.ticketName || r.ticketType || '—').substring(0, 13),
    r.totalAmount != null ? formatCurrency(r.totalAmount) : '—',
    formatDate(r.createdAt),
  ]);

  drawTable(headers, rows, widths);
  console.log(dim(`\n  Total registrations: ${regs.length}`));
  await pressEnter();
}

// ─── Search Registrations ───────────────────────────────────────────────────
async function searchRegistrations() {
  clearScreen();
  console.log(bold(cyan('\n  ── Search Registrations ──\n')));

  console.log(dim('  Search by name, email, phone, or registration ID'));
  const query = (await ask('\n  Search query: ')).toLowerCase();
  if (!query) {
    console.log(red('  ✗ Please enter a search term.'));
    await pressEnter();
    return;
  }

  const regs = loadRegistrations();
  const results = regs.filter((r) =>
    (r.name || '').toLowerCase().includes(query) ||
    (r.email || '').toLowerCase().includes(query) ||
    (r.phone || '').toLowerCase().includes(query) ||
    (r.registrationId || '').toLowerCase().includes(query)
  );

  if (!results.length) {
    console.log(yellow(`\n  No registrations matching "${query}".`));
    await pressEnter();
    return;
  }

  console.log(green(`\n  Found ${results.length} result(s):\n`));

  for (const r of results) {
    console.log(`  ${C.cyan}┌─────────────────────────────────────────────────────┐${C.reset}`);
    console.log(`  ${C.cyan}│${C.reset} ${bold('Reg ID:')}     ${r.registrationId || '—'}`);
    console.log(`  ${C.cyan}│${C.reset} ${bold('Name:')}       ${r.name || '—'}`);
    console.log(`  ${C.cyan}│${C.reset} ${bold('Email:')}      ${r.email || '—'}`);
    console.log(`  ${C.cyan}│${C.reset} ${bold('Phone:')}      ${r.phone || '—'}`);
    console.log(`  ${C.cyan}│${C.reset} ${bold('Org:')}        ${r.organization || '—'}`);
    console.log(`  ${C.cyan}│${C.reset} ${bold('Ticket:')}     ${r.ticketName || r.ticketType || '—'}`);
    console.log(`  ${C.cyan}│${C.reset} ${bold('Qty:')}        ${r.quantity || 1}`);
    console.log(`  ${C.cyan}│${C.reset} ${bold('Amount:')}     ${r.totalAmount != null ? formatCurrency(r.totalAmount) : '—'}`);
    console.log(`  ${C.cyan}│${C.reset} ${bold('Payment:')}    ${r.paymentStatus || '—'}  (${r.paymentId || '—'})`);
    console.log(`  ${C.cyan}│${C.reset} ${bold('Date:')}       ${formatDateTime(r.createdAt)}`);
    console.log(`  ${C.cyan}└─────────────────────────────────────────────────────┘${C.reset}`);
    console.log('');
  }
  await pressEnter();
}

// ─── Export to CSV ──────────────────────────────────────────────────────────
async function exportCSV() {
  clearScreen();
  console.log(bold(cyan('\n  ── Export Registrations to CSV ──\n')));

  const regs = loadRegistrations();
  if (!regs.length) {
    console.log(yellow('  No registrations to export.'));
    await pressEnter();
    return;
  }

  const csvHeaders = ['Registration ID', 'Name', 'Email', 'Phone', 'Organization', 'Ticket Type', 'Ticket Name', 'Quantity', 'Subtotal', 'Fees', 'Total Amount', 'Payment ID', 'Order ID', 'Payment Status', 'Is Mock', 'Created At'];

  function escapeCSV(val) {
    const s = String(val == null ? '' : val);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  }

  const rows = regs.map((r) => [
    r.registrationId, r.name, r.email, r.phone, r.organization,
    r.ticketType, r.ticketName, r.quantity, r.subtotal, r.fees,
    r.totalAmount, r.paymentId, r.orderId, r.paymentStatus,
    r.isMock, r.createdAt,
  ].map(escapeCSV).join(','));

  const csv = [csvHeaders.join(','), ...rows].join('\n');
  const outPath = path.join(__dirname, 'registrations_export.csv');
  fs.writeFileSync(outPath, csv, 'utf8');

  console.log(green(`  ✓ Exported ${regs.length} registration(s) to:`));
  console.log(cyan(`    ${outPath}`));
  await pressEnter();
}

// ─── Registration Stats ────────────────────────────────────────────────────
async function registrationStats() {
  clearScreen();
  console.log(bold(cyan('\n  ── Registration Statistics ──\n')));

  const regs = loadRegistrations();
  if (!regs.length) {
    console.log(yellow('  No registrations found.'));
    await pressEnter();
    return;
  }

  const totalCount = regs.length;
  const totalRevenue = regs.reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0);

  // By tier
  const tierCounts = {};
  const tierRevenue = {};
  for (const r of regs) {
    const tier = r.ticketType || 'unknown';
    tierCounts[tier] = (tierCounts[tier] || 0) + (r.quantity || 1);
    tierRevenue[tier] = (tierRevenue[tier] || 0) + (Number(r.totalAmount) || 0);
  }

  console.log(`  ${bold('Total Registrations:')}  ${totalCount}`);
  console.log(`  ${bold('Total Revenue:')}       ${formatCurrency(totalRevenue)}`);
  console.log('');

  const headers = ['Ticket Type', 'Count', 'Revenue'];
  const widths = [22, 8, 14];
  const rows = Object.entries(tierCounts).map(([tier, count]) => [
    TICKET_TIERS[tier]?.name || tier,
    count,
    formatCurrency(tierRevenue[tier] || 0),
  ]);

  drawTable(headers, rows, widths);
  await pressEnter();
}

// ═══════════════════════════════════════════════════════════════════════════
//  3. DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
async function dashboardMenu() {
  clearScreen();
  console.log(bold(cyan('\n  ══════════════════════════════════════════')));
  console.log(bold(cyan('   📊  ThunderCipher Dashboard')));
  console.log(bold(cyan('  ══════════════════════════════════════════\n')));

  const regs = loadRegistrations();
  const data = loadPromos();

  // ─── Revenue ────────────────────────────────────────────────────────
  const totalRevenue = regs.reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0);
  console.log(`  ${C.bold}${C.green}💰 Total Revenue:${C.reset}  ${bold(formatCurrency(totalRevenue))}`);
  console.log(`  ${C.bold}${C.cyan}🎫 Total Tickets:${C.reset}  ${bold(String(regs.length))}`);
  console.log('');

  // ─── Tickets by tier ───────────────────────────────────────────────
  console.log(bold(cyan('  ── Tickets Sold by Tier ──\n')));
  const tierCounts = {};
  for (const r of regs) {
    const tier = r.ticketType || 'unknown';
    tierCounts[tier] = (tierCounts[tier] || 0) + (r.quantity || 1);
  }
  const maxTierCount = Math.max(...Object.values(tierCounts), 1);
  for (const [tier, count] of Object.entries(tierCounts)) {
    const label = (TICKET_TIERS[tier]?.name || tier).padEnd(22);
    const barLen = Math.round((count / maxTierCount) * 20);
    const bar = `${C.green}${'█'.repeat(barLen)}${C.dim}${'░'.repeat(20 - barLen)}${C.reset}`;
    console.log(`  ${label} ${bar} ${bold(String(count))}`);
  }
  console.log('');

  // ─── Promo Code Usage ──────────────────────────────────────────────
  console.log(bold(cyan('  ── Promo Code Usage ──\n')));
  const usedPromos = data.promos.filter((p) => p.currentUses > 0).sort((a, b) => b.currentUses - a.currentUses);
  if (usedPromos.length) {
    for (const p of usedPromos.slice(0, 10)) {
      console.log(`    ${p.code.padEnd(14)} ${C.yellow}${p.currentUses} use(s)${C.reset}`);
    }
  } else {
    console.log(dim('    No promo codes have been used yet.'));
  }
  console.log('');

  // ─── Today's Sales ─────────────────────────────────────────────────
  console.log(bold(cyan("  ── Today's Sales ──\n")));
  const todayRegs = regs.filter((r) => isToday(r.createdAt));
  if (todayRegs.length) {
    const todayRevenue = todayRegs.reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0);
    console.log(`    Registrations today:  ${bold(String(todayRegs.length))}`);
    console.log(`    Revenue today:        ${bold(formatCurrency(todayRevenue))}`);
    console.log('');
    for (const r of todayRegs) {
      console.log(`    ${dim('•')} ${r.name || '—'} — ${r.ticketName || r.ticketType || '—'} — ${formatCurrency(r.totalAmount || 0)}`);
    }
  } else {
    console.log(dim('    No registrations today.'));
  }

  console.log('');
  await pressEnter();
}

// ═══════════════════════════════════════════════════════════════════════════
//  4. SYSTEM MENU
// ═══════════════════════════════════════════════════════════════════════════
async function systemMenu() {
  while (true) {
    clearScreen();
    console.log('');
    drawBox([
      `${C.bold}${C.cyan}   ⚙  System Settings                      ${C.reset}`,
      `                                                `,
      `   ${C.white}1.${C.reset} Change Password                          `,
      `   ${C.white}2.${C.reset} Backup Data                              `,
      `   ${C.white}3.${C.reset} Restore Backup                           `,
      `   ${C.white}4.${C.reset} View Settings                            `,
      `   ${C.white}0.${C.reset} ${C.yellow}← Back to Main Menu${C.reset}                     `,
      `                                                `,
    ]);
    const choice = await ask(`\n  ${C.cyan}▸${C.reset} Select option ${dim('[0-4]')}: `);

    switch (choice) {
      case '1': await changePassword(); break;
      case '2': await backupData(); break;
      case '3': await restoreBackup(); break;
      case '4': await viewSettings(); break;
      case '0': return;
      default:
        console.log(red('  ✗ Invalid option.'));
        await pressEnter();
    }
  }
}

// ─── Change Password ────────────────────────────────────────────────────────
async function changePassword() {
  clearScreen();
  console.log(bold(cyan('\n  ── Change Admin Password ──\n')));

  const data = loadPromos();
  const currentPwd = data.settings?.password || 'tc2026admin';

  const oldPwd = await ask('  Enter current password: ');
  if (oldPwd !== currentPwd) {
    console.log(red('  ✗ Incorrect current password.'));
    await pressEnter();
    return;
  }

  const newPwd = await ask('  Enter new password: ');
  if (!newPwd || newPwd.length < 4) {
    console.log(red('  ✗ Password must be at least 4 characters.'));
    await pressEnter();
    return;
  }

  const confirmPwd = await ask('  Confirm new password: ');
  if (newPwd !== confirmPwd) {
    console.log(red('  ✗ Passwords do not match.'));
    await pressEnter();
    return;
  }

  if (!data.settings) data.settings = {};
  data.settings.password = newPwd;
  savePromos(data);
  console.log(green('\n  ✓ Password changed successfully!'));
  await pressEnter();
}

// ─── Backup Data ────────────────────────────────────────────────────────────
async function backupData() {
  clearScreen();
  console.log(bold(cyan('\n  ── Backup Data ──\n')));

  ensureDir(BACKUPS_DIR);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const backupSubDir = path.join(BACKUPS_DIR, `backup_${timestamp}`);
  ensureDir(backupSubDir);

  let count = 0;

  if (fs.existsSync(PROMOS_PATH)) {
    fs.copyFileSync(PROMOS_PATH, path.join(backupSubDir, 'promos.json'));
    count++;
    console.log(green('  ✓ Backed up promos.json'));
  } else {
    console.log(yellow('  ⚠ promos.json not found, skipping.'));
  }

  if (fs.existsSync(REGISTRATIONS_PATH)) {
    fs.copyFileSync(REGISTRATIONS_PATH, path.join(backupSubDir, 'registrations.json'));
    count++;
    console.log(green('  ✓ Backed up registrations.json'));
  } else {
    console.log(yellow('  ⚠ registrations.json not found, skipping.'));
  }

  if (count > 0) {
    console.log(green(`\n  ✓ Backup saved to: ${cyan(backupSubDir)}`));
  } else {
    console.log(yellow('\n  ⚠ No files to backup.'));
    // Clean up empty dir
    try { fs.rmdirSync(backupSubDir); } catch { /* ignore */ }
  }
  await pressEnter();
}

// ─── Restore Backup ─────────────────────────────────────────────────────────
async function restoreBackup() {
  clearScreen();
  console.log(bold(cyan('\n  ── Restore Backup ──\n')));

  if (!fs.existsSync(BACKUPS_DIR)) {
    console.log(yellow('  No backups directory found.'));
    await pressEnter();
    return;
  }

  const backups = fs.readdirSync(BACKUPS_DIR)
    .filter((name) => {
      const fullPath = path.join(BACKUPS_DIR, name);
      return fs.statSync(fullPath).isDirectory() && name.startsWith('backup_');
    })
    .sort()
    .reverse();

  if (!backups.length) {
    console.log(yellow('  No backups found.'));
    await pressEnter();
    return;
  }

  console.log('  Available backups:\n');
  backups.forEach((b, i) => {
    const ts = b.replace('backup_', '').replace(/-/g, (m, offset) => {
      // Convert back: backup_2026-06-14T17-00-00 -> readable
      return offset <= 18 ? '-' : ':';
    });
    console.log(`    ${C.white}${i + 1}.${C.reset} ${b}`);
  });

  const choice = await ask(`\n  Select backup to restore ${dim(`[1-${backups.length}]`)}: `);
  const idx = Number(choice) - 1;
  if (isNaN(idx) || idx < 0 || idx >= backups.length) {
    console.log(red('  ✗ Invalid selection.'));
    await pressEnter();
    return;
  }

  const selectedDir = path.join(BACKUPS_DIR, backups[idx]);
  const confirm = await ask(yellow(`\n  ⚠ This will overwrite current data files. Continue? [y/N]: `));
  if (confirm.toLowerCase() !== 'y') {
    console.log(dim('  Cancelled.'));
    await pressEnter();
    return;
  }

  const promosBackup = path.join(selectedDir, 'promos.json');
  const regsBackup = path.join(selectedDir, 'registrations.json');

  if (fs.existsSync(promosBackup)) {
    ensureDir(path.dirname(PROMOS_PATH));
    fs.copyFileSync(promosBackup, PROMOS_PATH);
    console.log(green('  ✓ Restored promos.json'));
  }

  if (fs.existsSync(regsBackup)) {
    ensureDir(path.dirname(REGISTRATIONS_PATH));
    fs.copyFileSync(regsBackup, REGISTRATIONS_PATH);
    console.log(green('  ✓ Restored registrations.json'));
  }

  console.log(green('\n  ✓ Backup restored successfully!'));
  await pressEnter();
}

// ─── View Settings ──────────────────────────────────────────────────────────
async function viewSettings() {
  clearScreen();
  console.log(bold(cyan('\n  ── Current Settings ──\n')));

  const data = loadPromos();

  console.log(`  ${bold('Promos File:')}          ${fs.existsSync(PROMOS_PATH) ? green('Found') : red('Missing')}`);
  console.log(`  ${dim('Path:')}                 ${PROMOS_PATH}`);
  console.log(`  ${bold('Promo Count:')}          ${data.promos ? data.promos.length : 0}`);
  console.log('');
  console.log(`  ${bold('Registrations File:')}   ${fs.existsSync(REGISTRATIONS_PATH) ? green('Found') : red('Missing')}`);
  console.log(`  ${dim('Path:')}                 ${REGISTRATIONS_PATH}`);

  try {
    const regs = loadRegistrations();
    console.log(`  ${bold('Registration Count:')}   ${regs.length}`);
  } catch {
    console.log(`  ${bold('Registration Count:')}   ${red('Error reading')}`);
  }

  console.log('');
  console.log(`  ${bold('Backups Dir:')}          ${BACKUPS_DIR}`);
  if (fs.existsSync(BACKUPS_DIR)) {
    const backups = fs.readdirSync(BACKUPS_DIR).filter((n) => n.startsWith('backup_'));
    console.log(`  ${bold('Backup Count:')}         ${backups.length}`);
  } else {
    console.log(`  ${bold('Backup Count:')}         0 ${dim('(directory not created yet)')}`);
  }

  console.log('');
  console.log(`  ${bold('Password:')}             ${dim('••••••••')} ${dim(`(${(data.settings?.password || '').length} chars)`)}`);
  console.log(`  ${bold('Node.js:')}              ${process.version}`);
  console.log(`  ${bold('Platform:')}             ${process.platform} ${process.arch}`);

  await pressEnter();
}

// ═══════════════════════════════════════════════════════════════════════════
//  ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════
async function main() {
  try {
    await passwordGate();
    await mainMenu();
  } catch (err) {
    if (err.message === 'readline was closed') {
      // User pressed Ctrl+C, graceful exit
      console.log(cyan('\n  ⚡ Goodbye!\n'));
    } else {
      console.error(red(`\n  Fatal error: ${err.message}`));
      console.error(err.stack);
    }
    process.exit(0);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log(cyan('\n\n  ⚡ Goodbye! ThunderCipher 2026 ⚡\n'));
  process.exit(0);
});

main();
