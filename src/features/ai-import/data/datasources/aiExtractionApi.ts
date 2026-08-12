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
                    images: images.map((i) => ({ data: i.data, mediaType: i.mediaType})),
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

        if(!isExtractionDto(body)) {
            throw new ExtractionError('parse', '응답 형식이 올바르지 않습니다');
        }

        return body;

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
        const body = (await response.json()) as { error?: unknown };
        if(typeof body.error === 'string') return body.error;
    } catch {

    }

    return `서버 오류가 발생했습니다 (${response.status})`;
}

/** 신뢰 경계 - 통과한 값만 도메은으로 */
function isExtractionDto(v: unknown): v is ExtractionDto {
    if(typeof v !== 'object' || v === null) return false;
    const d = v as Record<string, unknown>;

    const nullableString = (x: unknown) => x === null || typeof x === 'string';
    const nullableNumber = (x: unknown) => x === null || typeof x === 'number';

    return(
        nullableString(d.startedAtIso) &&
        nullableNumber(d.distanceMeters) &&
        nullableNumber(d.durationSeconds) &&
        nullableNumber(d.calories) &&
        Array.isArray(d.segmentsSet) &&
        Array.isArray(d.lowConfidenceFields)
    );
}