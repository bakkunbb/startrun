import { withSupabase } from 'npm:@supabase/server'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_APIKEY')!;
const MODEL = 'claude-sonnet-5';

const SCHEMA = {
    type: 'object',
    properties: {
        startedAtIso: {
            type: ['string', 'null']
        },
        distanceMeters: {
            type: ['number', 'null']
        },
        durationSeconds: {
            type: ['number', 'null']
        },
        heartRate: {
            type: ['number', 'null']
        },
        calories: {
            type: ['number', 'null']
        },
        segmentSets: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    kind: {
                        type: 'string',
                        enum: ['split', 'lap', 'unknown']
                    },
                    labelText: {
                        type: ['string', 'null']
                    },
                    unitMeters: {
                        type: ['number', 'null']
                    },
                    rows: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                index: {
                                    type: 'integer'
                                },
                                distanceMeters: {
                                    type: 'number'
                                },
                                durationSeconds: {
                                    type: 'number'
                                },
                                heartRate: {
                                    type: 'number'
                                }
                            },
                            required: ['index', 'distanceMeters', 'durationSeconds'],
                            additionalProperties: false
                        },
                    },
                },
                required: ['kind', 'labelText', 'unitMeters', 'rows'],
                additionalProperties: false
            }
        },
        lowConfidenceFields: {
            type: 'array',
            items: {
                type: 'string'
            }
        },
    },
    required: ['startedAtIso', 'distanceMeters', 'calories', 'segmentSets', 'lowConfidenceFields'],
    additionalProperties: false
};

const SYSTEM = `러닝 앱 스크린샷에서 운동 기록을 읽어 JSON으로 옮기는 작업을 한다.

규칙:
- 거리는 미터, 시간은 초 단위 정수로 변환한다. "10.24 km" → 10240, "52:31" → 3151
- 화면에 없는 값은 추측하지 말고 null을 넣는다
- 평균 페이스는 추출하지 않는다. 거리와 시간에서 계산되는 값이다
- 심박수는 평균 심박수를 기본으로 추출한다. 최고 혹은 최저는 구간표에서 추출 가능하다
- 날짜에 연도가 없으면 올해로 본다. 시간대는 기기 기준이므로 오프셋 없이 ISO 문자열로 쓴다

구간표(splits/laps)가 보이면 segmentSets에 담는다:
- 표 제목을 그대로 labelText에 옮긴다 ("Splits", "Laps", "구간" 등)
- 제목이 자동 분할을 뜻하면 kind는 "split", 사용자가 끊은 랩이면 "lap", 판단이 안 되면 "unknown"
- kind가 "split"이면 unitMeters에 단위를 넣는다 (1km 단위면 1000, 1마일이면 1609.34)
- 표가 없으면 segmentSets는 빈 배열

구간표의 각 행은 그 구간만의 값을 담는다. 누적값이 아니다:
- 행 라벨이 "1km, 2km, 3km"처럼 누적 지점을 가리켜도, distanceMeters에는
  직전 행과의 차이를 넣는다. 1km 단위 자동 분할이면 모든 행이 1000이고,
  마지막 행만 남은 거리가 된다
- 시간 열이 누적(0:05:12 → 0:10:10 → 0:15:15)으로 보이면 마찬가지로
  차이를 넣는다. 총시간과 마지막 행이 같으면 누적 표기다
- 판단이 어려우면 화면에 적힌 값을 그대로 넣고 lowConfidenceFields에
  "segments"를 추가한다

숫자가 흐리거나 잘려서 확신이 없는 필드는 lowConfidenceFields에 이름을 넣는다.`;

export default {
    fetch: withSupabase({ auth: ['publishable', 'secret'] }, async (req) => {
        if (req.method !== 'POST') {
            return Response.json({ error: 'POST만 허용' }, { status: 405 });
        }
        const { images } = await req.json() as { images: string[] };

        if (!Array.isArray(images) || images.length === 0) {
            return Response.json({ error: 'images 배열이 필요합니다' }, { status: 400 });
        }

        const ALLOWED_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

        type ImageInput = string | { data: string, mediaType?: string};

        const normalized = (images as ImageInput[]).map((img) =>
            typeof img === 'string' ? { data: img, mediaType: 'image/jpeg'} : img,
        );

        const bad = normalized.find((i) => !ALLOWED_MEDIA_TYPES.includes(i.mediaType ?? ''));
        if(bad) {
            return Response.json({error: `지원하지 않는 이미지 형식: ${bad.mediaType}` }, { status: 400 });
        }

        const content = [
            ...normalized.map((img) => ({
                type: 'image',
                source: {
                    type: 'base64',
                    media_type: img.mediaType,
                    data: img.data
                }
            })),
            {
                type: 'text',
                text: '이 스크린샷들에서 러닝 기록을 추출해줘.'
            },
        ];

        console.log('media types', normalized.map((i) => i.mediaType));

        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: MODEL,
                max_tokens: 8192,
                system: SYSTEM,
                messages: [{ role: 'user', content }],
                output_config: {
                    format: {
                        type: 'json_schema',
                        schema: SCHEMA
                    }
                }
            }),
        });

        if (!res.ok) {
            const detail = await res.text();
            console.error('anthropic error', res.status, detail);
            return Response.json({ error: '추출실패', detail }, { status: 502 });
        }

        const body = await res.json();

        // 안전장치: 거부되거나 토큰 한도에 걸리면 스키마가 안 지켜질 수 있다
        if (body.stop_reason === 'refusal' || body.stop_reason === 'max_tokens') {
            return Response.json({ error: '추출 중단', stop_reason: body.stop_reason, usage: body.usage }, { status: 502 });
        }

        const text = body.content.find((b: { type: string }) => b.type === 'text')?.text;
        return Response.json(JSON.parse(text));
    }),
};