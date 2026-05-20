import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'zax_dev_key_32chars_placeholder!';

if (process.env.NODE_ENV === 'production' && !process.env.ENCRYPTION_KEY) {
    // 本番でキー未設定はセキュリティリスク。エラーログを出す。
    console.error("CRITICAL: ENCRYPTION_KEY is not set in production environment.");
}
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypts a text string using AES-256-CBC
 */
export function encrypt(text: string): string {
    // SHA-256のhex出力は64文字 = 32バイト。AES-256-CBCに必要な正確なキー長。
    const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('hex').substring(0, 32);
    
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Return properly formatted string: IV:EncryptedText
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypts a text string using AES-256-CBC
 */
export function decrypt(text: string): string {
    const textParts = text.split(':');
    const ivPart = textParts.shift();
    if (!ivPart) throw new Error("Invalid encrypted text format");
    
    const iv = Buffer.from(ivPart, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('hex').substring(0, 32);

    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
}

/**
 * セッションIDをHMAC-SHA256で署名し、改ざん防止する
 * フォーマット: "userId.signature"
 */
export function signSession(userId: string): string {
    const hmac = crypto.createHmac('sha256', ENCRYPTION_KEY);
    hmac.update(userId);
    return `${userId}.${hmac.digest('hex')}`;
}

/**
 * 署名付きセッションIDを検証し、元のuserIdを返す
 * 署名が無効な場合はnullを返す
 */
export function verifySession(signedSession: string | undefined | null): string | null {
    if (!signedSession) return null;
    const parts = signedSession.split('.');

    if (parts.length !== 2) return null;

    const [userId, signature] = parts;
    const hmac = crypto.createHmac('sha256', ENCRYPTION_KEY);
    hmac.update(userId);

    const expectedSignature = hmac.digest('hex');
    if (expectedSignature.length === signature.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        return userId;
    }
    return null;
}
/**
 * メールアドレスをSHA-256でハッシュ化し、匿名化する
 * プライバシーポリシーに則り、生データをDBに保存しないために使用
 */
export function hashEmail(email: string): string {
    const normalizedEmail = email.toLowerCase().trim();
    return crypto.createHash('sha256').update(normalizedEmail).digest('hex');
}
