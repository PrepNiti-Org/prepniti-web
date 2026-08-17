/**
 * PrepNiti E2EE (End-to-End Encryption) Engine
 * Implements Multi-Recipient Hybrid Public-Key Encryption with Admin Escrow
 * Uses native Web Crypto API (RSA-OAEP 2048-bit + AES-256-GCM)
 */

// In-memory cache for decrypted messages to optimize React re-renders
const decryptedCache = new Map<string, string>();

// Helpers for Base64 and ArrayBuffer conversion
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = window.atob(base64.trim());
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

function pemToBinary(pem: string): ArrayBuffer {
    const cleanPem = pem
        .replace(/-----BEGIN [^-]+-----/g, "")
        .replace(/-----END [^-]+-----/g, "")
        .replace(/\s+/g, "");
    return base64ToArrayBuffer(cleanPem);
}

function binaryToPublicKeyPem(buffer: ArrayBuffer): string {
    const base64 = arrayBufferToBase64(buffer);
    const formatted = base64.match(/.{1,64}/g)?.join("\n") || base64;
    return `-----BEGIN PUBLIC KEY-----\n${formatted}\n-----END PUBLIC KEY-----`;
}

function binaryToPrivateKeyPem(buffer: ArrayBuffer): string {
    const base64 = arrayBufferToBase64(buffer);
    const formatted = base64.match(/.{1,64}/g)?.join("\n") || base64;
    return `-----BEGIN PRIVATE KEY-----\n${formatted}\n-----END PRIVATE KEY-----`;
}

/**
 * Generates an RSA-OAEP 2048-bit key pair
 */
export async function generateKeyPair(): Promise<CryptoKeyPair> {
    if (typeof window === "undefined" || !window.crypto?.subtle) {
        throw new Error("Web Crypto API is not supported in this environment");
    }

    return await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    );
}

/**
 * Exports Public Key to SPKI PEM
 */
export async function exportPublicKeyPEM(publicKey: CryptoKey): Promise<string> {
    const spki = await window.crypto.subtle.exportKey("spki", publicKey);
    return binaryToPublicKeyPem(spki);
}

/**
 * Exports Private Key to PKCS#8 PEM
 */
export async function exportPrivateKeyPEM(privateKey: CryptoKey): Promise<string> {
    const pkcs8 = await window.crypto.subtle.exportKey("pkcs8", privateKey);
    return binaryToPrivateKeyPem(pkcs8);
}

/**
 * Imports Public Key from SPKI PEM
 */
export async function importPublicKeyPEM(pem: string): Promise<CryptoKey> {
    const binary = pemToBinary(pem);
    return await window.crypto.subtle.importKey(
        "spki",
        binary,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["encrypt"]
    );
}

/**
 * Imports Private Key from PKCS#8 PEM
 */
export async function importPrivateKeyPEM(pem: string): Promise<CryptoKey> {
    const binary = pemToBinary(pem);
    return await window.crypto.subtle.importKey(
        "pkcs8",
        binary,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["decrypt"]
    );
}

/**
 * Gets or initializes the user's persistent RSA Key Pair in localStorage
 */
export async function getOrCreateUserKeyPair(userId: string): Promise<{
    publicKeyPEM: string;
    privateKey: CryptoKey;
    isNew: boolean;
}> {
    if (typeof window === "undefined") {
        throw new Error("Cannot access localStorage on server");
    }

    const storageKey = `prepniti_e2ee_${userId}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
        try {
            const { publicKeyPEM, privateKeyPEM } = JSON.parse(stored);
            const privateKey = await importPrivateKeyPEM(privateKeyPEM);
            return { publicKeyPEM, privateKey, isNew: false };
        } catch (err) {
            console.warn("[E2EE] Failed to parse stored keys, generating fresh keypair:", err);
        }
    }

    // Generate fresh keypair
    const keyPair = await generateKeyPair();
    const publicKeyPEM = await exportPublicKeyPEM(keyPair.publicKey);
    const privateKeyPEM = await exportPrivateKeyPEM(keyPair.privateKey);

    localStorage.setItem(
        storageKey,
        JSON.stringify({ publicKeyPEM, privateKeyPEM })
    );

    return {
        publicKeyPEM,
        privateKey: keyPair.privateKey,
        isNew: true,
    };
}

export interface EncryptedMessagePayload {
    ciphertext: string;
    iv: string;
    envelopes: Record<string, string>;
    is_encrypted: boolean;
}

/**
 * Encrypts a message payload for multiple recipients and the admin escrow key
 */
export async function encryptChatMessage(
    content: string,
    recipientPublicKeys: Record<string, string>,
    adminPublicKeyPEM?: string
): Promise<EncryptedMessagePayload> {
    if (!content.trim()) {
        throw new Error("Cannot encrypt empty message");
    }

    // 1. Generate ephemeral AES-256-GCM Data Encryption Key (DEK)
    const dek = await window.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );

    // 2. Generate random 12-byte IV
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // 3. Encrypt the plaintext message using AES-GCM
    const encodedContent = new TextEncoder().encode(content);
    const encryptedContentBuffer = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        dek,
        encodedContent
    );

    const ciphertext = arrayBufferToBase64(encryptedContentBuffer);
    const ivBase64 = arrayBufferToBase64(iv);

    // 4. Export the raw DEK bytes to wrap for each recipient
    const rawDek = await window.crypto.subtle.exportKey("raw", dek);

    // 5. Wrap DEK for all participants (sender + buddies) and Admin
    const envelopes: Record<string, string> = {};

    // Wrap for all room members who have a registered public key
    for (const [memberId, pubKeyPem] of Object.entries(recipientPublicKeys)) {
        if (!pubKeyPem) continue;
        try {
            const pubKey = await importPublicKeyPEM(pubKeyPem);
            const wrappedDekBuffer = await window.crypto.subtle.encrypt(
                { name: "RSA-OAEP" },
                pubKey,
                rawDek
            );
            envelopes[memberId] = arrayBufferToBase64(wrappedDekBuffer);
        } catch (err) {
            console.error(`[E2EE] Failed to wrap key for recipient ${memberId}:`, err);
        }
    }

    // Wrap for Admin Master Escrow Key
    if (adminPublicKeyPEM) {
        try {
            const adminPubKey = await importPublicKeyPEM(adminPublicKeyPEM);
            const adminWrappedDekBuffer = await window.crypto.subtle.encrypt(
                { name: "RSA-OAEP" },
                adminPubKey,
                rawDek
            );
            envelopes["admin"] = arrayBufferToBase64(adminWrappedDekBuffer);
        } catch (err) {
            console.error("[E2EE] Failed to wrap key for admin escrow:", err);
        }
    }

    return {
        ciphertext,
        iv: ivBase64,
        envelopes,
        is_encrypted: true,
    };
}

/**
 * Decrypts an encrypted message payload using the user's private key (or admin private key)
 */
export async function decryptChatMessage(
    msg: {
        id?: number;
        content?: string;
        ciphertext?: string;
        iv?: string;
        envelopes?: string | Record<string, string>;
        is_encrypted?: boolean;
    },
    targetUserId: string,
    privateKey: CryptoKey | null
): Promise<string> {
    // If not encrypted or missing ciphertext, return plain content
    if (!msg.is_encrypted || !msg.ciphertext || !msg.iv || !msg.envelopes) {
        return msg.content || "";
    }

    const cacheKey = `${msg.id || "temp"}_${msg.ciphertext}`;
    if (decryptedCache.has(cacheKey)) {
        return decryptedCache.get(cacheKey)!;
    }

    if (!privateKey) {
        return "[🔒 Encrypted message: private key required to decrypt]";
    }

    try {
        let envelopesObj: Record<string, string>;
        if (typeof msg.envelopes === "string") {
            try {
                envelopesObj = JSON.parse(msg.envelopes);
            } catch {
                return msg.content || "[Encrypted Message]";
            }
        } else {
            envelopesObj = msg.envelopes;
        }

        // Check if envelope exists for target user or admin
        const wrappedDekBase64 = envelopesObj[targetUserId] || (targetUserId === "admin" ? envelopesObj["admin"] : undefined);
        if (!wrappedDekBase64) {
            return "[🔒 Encrypted for another session / key missing]";
        }

        // 1. Unwrap DEK using RSA private key
        const wrappedDekBuffer = base64ToArrayBuffer(wrappedDekBase64);
        const rawDek = await window.crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            privateKey,
            wrappedDekBuffer
        );

        // 2. Import raw DEK as AES-GCM CryptoKey
        const dek = await window.crypto.subtle.importKey(
            "raw",
            rawDek,
            { name: "AES-GCM" },
            false,
            ["decrypt"]
        );

        // 3. Decrypt ciphertext using DEK + IV
        const ivBuffer = base64ToArrayBuffer(msg.iv);
        const ciphertextBuffer = base64ToArrayBuffer(msg.ciphertext);

        const decryptedBuffer = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: new Uint8Array(ivBuffer) },
            dek,
            ciphertextBuffer
        );

        const plaintext = new TextDecoder().decode(decryptedBuffer);
        decryptedCache.set(cacheKey, plaintext);
        return plaintext;
    } catch (err) {
        console.error("[E2EE] Decryption failed:", err);
        return "[🔒 Decryption failed: key mismatch or corrupted payload]";
    }
}
