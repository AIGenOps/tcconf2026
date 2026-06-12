import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface RegistrationRecord {
  registrationId: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  ticketType: string;
  ticketName: string;
  quantity: number;
  subtotal: number;
  fees: number;
  totalAmount: number;
  paymentId: string;
  orderId: string;
  paymentStatus: "captured" | "failed" | "pending";
  isMock: boolean;
  createdAt: string;
}

const DB_DIR = path.join(process.cwd(), "src", "data");
const DB_FILE = path.join(DB_DIR, "registrations.json");

const ALGORITHM = "aes-256-gcm";
const DB_SECRET = process.env.REGISTRATION_DB_KEY || "dev_default_secret_thunder_cipher_2026_key_32_bytes";

// Derives a 32-byte cryptographic key from the DB_SECRET
function getEncryptionKey(): Buffer {
  return crypto.createHash("sha256").update(DB_SECRET).digest();
}

// Encrypts text using authenticated AES-256-GCM
function encrypt(text: string): string {
  const iv = crypto.randomBytes(12);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  // Format: iv_hex:auth_tag_hex:ciphertext_hex
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

// Decrypts text using AES-256-GCM and verifies integrity via authTag
function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(":");
  if (parts.length !== 3) {
    throw new Error("Encrypted database payload is corrupted or uses an invalid format.");
  }

  const iv = Buffer.from(parts[0], "hex");
  const authTag = Buffer.from(parts[1], "hex");
  const ciphertext = parts[2];

  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

// Helper to ensure the directory and file exist
function ensureDbExists(): void {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const emptyJson = JSON.stringify([]);
    const encrypted = encrypt(emptyJson);
    fs.writeFileSync(DB_FILE, encrypted, "utf8");
  }
}

// Read and decrypt all registrations
export async function getAllRegistrations(): Promise<RegistrationRecord[]> {
  try {
    ensureDbExists();
    const data = fs.readFileSync(DB_FILE, "utf8").trim();
    if (!data) return [];

    // Support seamless legacy migration if database is currently in plain text
    if (data.startsWith("[")) {
      console.warn("[SECURITY] Database is currently unencrypted. Migrating to AES-256-GCM...");
      const registrations = JSON.parse(data) as RegistrationRecord[];
      const encrypted = encrypt(data);
      fs.writeFileSync(DB_FILE, encrypted, "utf8");
      return registrations;
    }

    const decrypted = decrypt(data);
    return JSON.parse(decrypted) as RegistrationRecord[];
  } catch (error) {
    console.error("Failed to read registrations db:", error);
    return [];
  }
}

// Encrypt and save a new registration record
export async function saveRegistration(record: RegistrationRecord): Promise<boolean> {
  try {
    ensureDbExists();
    const registrations = await getAllRegistrations();
    registrations.push(record);
    
    const serialized = JSON.stringify(registrations);
    const encrypted = encrypt(serialized);
    
    fs.writeFileSync(DB_FILE, encrypted, "utf8");
    return true;
  } catch (error) {
    console.error("Failed to write to registrations db:", error);
    return false;
  }
}

// Find a registration by ID
export async function findRegistrationById(registrationId: string): Promise<RegistrationRecord | null> {
  const registrations = await getAllRegistrations();
  return registrations.find((r) => r.registrationId === registrationId) || null;
}
