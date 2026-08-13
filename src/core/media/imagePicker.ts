import { ImageLibraryOptions, launchImageLibrary } from "react-native-image-picker";

export type PickedImage = {
    /** base64 문자열 (data: 접두사 없음) */
    data: string,
    mimeType: string,
    width: number,
    height: number,
};

export async function pickScreenShots(limit?: number): Promise<PickedImage[]> {
    const options: ImageLibraryOptions = {
        mediaType: 'photo',
        selectionLimit: limit ?? 3,
        maxWidth: 1568,
        maxHeight: 1568,
        quality: 0.8,
        includeBase64: true,
    };

    const picked = await launchImageLibrary(options);

    if(picked.didCancel) return [];
    if(picked.errorCode) throw new Error(picked.errorMessage);
    if (!picked.assets) return [];

    return picked.assets.map(a => {
        const data = a.base64!;
        const mimeType = sniffMimeType(data) ?? normalizeMimeType(a.type);
        if (!mimeType) {
            throw new Error(`지원하지 않는 이미지 형식입니다 (${a.type})`);
        }
        return {
            data,
            mimeType,
            width: a.width ?? 0,
            height: a.height ?? 0,
        };
    });
    
}

const SUPPORTED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;

/** base64 앞머리로 실제 형식을 판별한다. asset.type보다 믿을 만하다 */
function sniffMimeType(base64: string): string | null {
  if (base64.startsWith('iVBORw0KGgo')) return 'image/png';
  if (base64.startsWith('/9j/')) return 'image/jpeg';
  if (base64.startsWith('R0lGOD')) return 'image/gif';
  if (base64.startsWith('UklGR')) return 'image/webp';
  return null;
}

/** asset.type 정규화 — image/jpg 같은 비표준 표기를 바로잡는다 */
function normalizeMimeType(raw: string | undefined): string | null {
  const base = (raw ?? '').split(';')[0].trim().toLowerCase();
  const aliases: Record<string, string> = {
    'image/jpg': 'image/jpeg',
    'image/pjpeg': 'image/jpeg',
    'image/x-png': 'image/png',
  };
  const mapped = aliases[base] ?? base;
  return (SUPPORTED as readonly string[]).includes(mapped) ? mapped : null;
}