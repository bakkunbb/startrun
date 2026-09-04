import { Appearance } from 'react-native';
import type { TextStyle } from 'react-native';

/**
 * src/app/theme/index.ts
 *
 * 기존 색감(따뜻한 회색 + 채도 낮은 강조색)을 유지하면서
 * 컴포넌트에서 실제로 필요한 항목만 더했다.
 *
 * 다크모드는 앱이 켜질 때 시스템 설정을 한 번만 읽어서 고른다.
 * 실시간 전환은 지원하지 않는다 — StyleSheet.create가 화면 파일마다
 * 모듈 최상단에서 한 번만 호출되기 때문에, 값이 바뀌어도 이미 만들어진
 * 스타일은 갱신되지 않는다. 설정을 바꾸면 앱을 재시작해야 반영된다.
 */

const lightColors = {
  // 배경
  bg: '#f7f7f5',
  /** 눌림·비활성 배경 */
  bgSubtle: '#f1efe8',
  card: '#ffffff',

  // 글자
  text: '#1f1f1d',
  textMuted: '#5f5e5a',
  /** 자투리 구간, 비활성 버튼 글자 */
  textDisabled: '#888780',
  /** 색 배경 위 */
  textInverse: '#ffffff',

  // 선
  border: 'rgba(0,0,0,0.1)',
  /** 표의 행 구분선 — hairlineWidth와 함께 */
  divider: 'rgba(0,0,0,0.06)',

  // 강조
  accent: '#185fa5',
  accentPressed: '#134d86',
  accentDisabled: '#b7cde3',
  /** 정보 배너 배경 */
  accentSubtle: '#e6f1fb',

  // 상태
  warning: '#854f0b',
  warningSubtle: '#faeeda',
  danger: '#a32d2d',
  dangerSubtle: '#fbeceb',
  success: '#3b6d11',
  successSubtle: '#eaf3de',

  // 그 외
  /** SourceBadge의 건강 앱 배지 */
  health: '#993556',
  healthSubtle: '#fbeaf0',
  /** 카드 그림자 */
  shadow: '#000000',
};

const darkColors: typeof lightColors = {
  // 배경
  bg: '#1a1a19',
  bgSubtle: '#252523',
  card: '#2f2f2c',

  // 글자
  text: '#f0efeb',
  textMuted: '#b4b2a9',
  textDisabled: '#888780',
  textInverse: '#ffffff',

  // 선
  border: 'rgba(255,255,255,0.12)',
  divider: 'rgba(255,255,255,0.07)',

  // 강조 — iOS 다크모드 시스템 컬러 기준. 와이어프레임 파스텔 톤보다 채도를 올렸다
  accent: '#0a84ff',
  accentPressed: '#086cd1',
  accentDisabled: '#153b60',
  accentSubtle: '#153d65',

  // 상태
  warning: '#ff9f0a',
  warningSubtle: '#664614',
  danger: '#ff453a',
  dangerSubtle: '#662824',
  success: '#30d158',
  successSubtle: '#21562e',

  // 그 외
  health: '#e08bab',
  healthSubtle: '#573f49',
  shadow: '#000000',
};

export const colors = Appearance.getColorScheme() === 'dark' ? darkColors : lightColors;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { sm: 6, md: 8, lg: 12, pill: 999 };

/**
 * 레이아웃 상수.
 * 폼의 줄마다 세로선을 맞추려면 라벨·단위 열의 너비가 고정되어야 한다.
 */
export const layout = {
  /** 터치 목표 최소 높이 — iOS 44pt / Android 48dp 중 넉넉한 쪽 */
  minTouchSize: 48,
  /** 화면 좌우 여백 */
  screenPadding: spacing.lg,
  formLabelWidth: 72,
  formUnitWidth: 32,
  toastHeight: 48,
};

/** 작은 아이콘 버튼의 반응 영역 확장 */
export const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 };

/**
 * `satisfies`를 쓴 이유:
 * 아무것도 안 붙이면 fontWeight가 string으로 넓어져 오타를 놓치고,
 * `as const`만 붙이면 리터럴로 굳어 TextStyle 대입에서 어긋난다.
 * satisfies는 적합성 검사와 리터럴 유지를 동시에 한다.
 */
export const typography = {
  /** 상세 화면의 큰 숫자 — 10.24, 52:31 */
  display: { fontSize: 34, fontWeight: '700', letterSpacing: -0.5 },
  title: { fontSize: 22, fontWeight: '600' },
  subtitle: { fontSize: 17, fontWeight: '600' },
  /** 본문, 입력값 */
  body: { fontSize: 18, fontWeight: '400' },
  /** 라벨, 보조 설명 */
  label: { fontSize: 15, fontWeight: '400' },
  /** 단위, 안내 문구, 표 머리 */
  caption: { fontSize: 13, fontWeight: '400' },
  button: { fontSize: 18, fontWeight: '600' },
} satisfies Record<string, TextStyle>;

/** 표의 숫자 폭 고정 — 없으면 1과 8의 너비가 달라 세로줄이 어긋난다 */
export const tabularNums = { fontVariant: ['tabular-nums'] } satisfies TextStyle;