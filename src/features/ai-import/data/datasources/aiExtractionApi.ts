import { EXTRACT_FUNCTION_URL, SUPABASE_PUBLISHABLE_KEY } from "@/core/config/supabase";
import { ExtractionDto } from "../models/ExtractionDto";
import { PickedImage } from "@/core/media/imagePicker";

const TIMEOUT_MS = 60_000;

export type ExtractionErrorCode = 'network' | 'timeout' | 'server' | 'parse';

export class ExtractionError extends Error {
    constructor(readonly code: ExtractionErrorCode, message: string) {
        super(message);
        this.name = 'ExtractionError';
    }
}

export async function requestExtraction(images: PickedImage[]): Promise<ExtractionDto> {
    
    if (__DEV__) {
        console.log('[extraction] URL', EXTRACT_FUNCTION_URL);
        console.log('[extraction] 이미지', images.map((i) => `${i.width}x${i.height} ${i.mimeType}`));
        console.log('[extraction] 크기 MB', (JSON.stringify({ images }).length / 1048576).toFixed(2));
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    try {
        const response = await fetch(
            EXTRACT_FUNCTION_URL,
            {
                method: 'POST',
                headers: {
                    apiKey: SUPABASE_PUBLISHABLE_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    images: images.map((i) => ({ data: i.data, mediaType: i.mimeType})),
                }),
            }
        );

        if(!response.ok) {
            throw new ExtractionError('server', await readServerMessage(response));
        }

        let body: unknown;
        try {
            body = await response.json();
        } catch {
            throw new ExtractionError('parse', '응답을 읽을 수 없습니다');
        }

        if (__DEV__) console.log('[extraction] 응답', JSON.stringify(body).slice(0, 600));

        const problem = describeDtoProblem(body);

        if (problem) {
            if (__DEV__) console.warn('[extraction] 형식 불일치', problem, body);
            throw new ExtractionError('parse', `응답 형식이 올바르지 않습니다 (${problem})`);
        }
        
        return body as ExtractionDto;

    } catch(error) {
        if(error instanceof ExtractionError) throw error;
        if (error instanceof Error && error.name === 'AbortError') {
            throw new ExtractionError('timeout', '응답이 너무 오래 걸립니다');
        }
        throw new ExtractionError('network', '연결을 확인해주세요');
    } finally {
        clearTimeout(timer);
    }

}

/** Edge Function은 { error: '...' } 형태로 실패를 알려줌 */
async function readServerMessage(response: Response): Promise<string> {
    try {
        const body = (await response.json()) as { stop_reason: any; error?: unknown };
        if(typeof body.error === 'string') {
            return body.stop_reason ? `${body.error} (${body.stop_reason})` : body.error;
        }
    } catch {

    }

    return `서버 오류가 발생했습니다 (${response.status})`;
}

/** 문제가 있으면 사유를, 없으면 null을 돌려준다 */
function describeDtoProblem(v: unknown): string | null {
  if (typeof v !== 'object' || v === null) return `객체가 아님: ${typeof v}`;
  const d = v as Record<string, unknown>;

  const bad: string[] = [];
  const nullableString = (x: unknown) => x === null || typeof x === 'string';
  const nullableNumber = (x: unknown) => x === null || typeof x === 'number';

  if (!nullableString(d.startedAtIso)) bad.push(`startedAtIso=${JSON.stringify(d.startedAtIso)}`);
  if (!nullableNumber(d.distanceMeters)) bad.push(`distanceMeters=${JSON.stringify(d.distanceMeters)}`);
  if (!nullableNumber(d.durationSeconds)) bad.push(`durationSeconds=${JSON.stringify(d.durationSeconds)}`);
  if (!nullableNumber(d.calories)) bad.push(`calories=${JSON.stringify(d.calories)}`);
  if (!Array.isArray(d.segmentSets)) bad.push(`segmentSets=${JSON.stringify(d.segmentSets)}`);
  if (!Array.isArray(d.lowConfidenceFields)) bad.push(`lowConfidenceFields=${JSON.stringify(d.lowConfidenceFields)}`);

  return bad.length > 0 ? bad.join(', ') : null;
}