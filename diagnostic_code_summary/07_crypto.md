# 暗号化・セッション管理 - crypto.ts
パス: `src/lib/crypto.ts`

## 役割
- AES-256-CBCによる暗号化/復号
- HMAC-SHA256によるセッションIDの署名・検証（セッションハイジャック防止）

## ⚠️ 注意
ENCRYPTION_KEY 環境変数が必須。Vercelの環境変数設定にない場合、サーバー起動時にエラーになる。

## コード
```typescript
import crypto from 'crypto';

// 繧ｻ繧ｭ繝･繝ｪ繝・ぅ: 迺ｰ蠅・､画焚縺後↑縺代ｌ縺ｰ襍ｷ蜍輔ｒ諡貞凄・医ョ繝輔か繝ｫ繝医く繝ｼ縺ｯ蜷ｫ繧√↑縺・ｼ・// 繝薙Ν繝峨ヵ繧ｧ繝ｼ繧ｺ・・ext build・峨〒縺ｯ譛ｪ菴ｿ逕ｨ縺ｮ繝励Ξ繝ｼ繧ｹ繝帙Ν繝繝ｼ縺ｧ騾夐℃繧定ｨｱ蜿ｯ
const rawKey = process.env.ENCRYPTION_KEY;
const isBuildPhase =
    process.env.npm_lifecycle_event === 'build' ||
    process.env.NEXT_PHASE === 'phase-production-build';

if ((!rawKey || rawKey.trim() === '') && !isBuildPhase) {
    throw new Error(
        "[ZAX] ENCRYPTION_KEY environment variable is required. " +
        "Set a secure 32-character key (e.g. openssl rand -base64 24)."
    );
}

const ENCRYPTION_KEY = (rawKey && rawKey.trim() !== '') ? rawKey : 'build-placeholder-never-used-at-runtime';
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypts a text string using AES-256-CBC
 */
export function encrypt(text: string): string {
    // Ensure the key is 32 bytes (256 bits)
    // If the provided key is short, we pad it or hash it. Here we assume it's roughly correct or just hash it to be safe.
    const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').slice(0, 32);
    
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
    const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').slice(0, 32);
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
}

/**
 * Signs a session ID using HMAC-SHA256 to prevent tampering (Session Hijacking protection).
 * Format: "userId.signature"
 */
export function signSession(userId: string): string {
    const hmac = crypto.createHmac('sha256', ENCRYPTION_KEY);
    hmac.update(userId);
    return `${userId}.${hmac.digest('hex')}`;
}

/**
 * Verifies a signed session ID and returns the raw userId as string.
 * Returns null if the signature is invalid or tampered with.
 */
export function verifySession(signedSession: string | undefined | null): string | null {
    if (!signedSession) return null;
    const parts = signedSession.split('.');
    
    // If no signature is present (old cookie), return null for security to force re-auth
    if (parts.length !== 2) return null; 
    
    const [userId, signature] = parts;
    const hmac = crypto.createHmac('sha256', ENCRYPTION_KEY);
    hmac.update(userId);
    
    // Use timingSafeEqual to prevent timing attacks
    const expectedSignature = hmac.digest('hex');
    if (expectedSignature.length === signature.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        return userId;
    }
    return null;
}

```
