import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, PressableStateCallbackType, ScrollView, StyleSheet, Text, View } from "react-native";
import { describeSegmentBasis, ExtractionWarning } from "../../domain/entities/ExtractedActivity";
import { useReviewDraft } from "../hooks/useReviewDraft";
import { useMemo, useState } from "react";
import { toExtractedActivity } from "../../domain/toExtractedActivity";
import { Banner } from "@/core/ui/Banner";
import { primarySegments } from "@/features/activity/domain/entities/Activity";
import { SegmentTable } from "@/features/activity/presentation/components/SegmentTable";
import { SegmentView } from "@/features/activity/domain/entities/Segment";
import { SumamryCard } from "./SummaryCard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSaveImported } from "../hooks/useSaveImported";
import { useDuplicateCheck } from "../hooks/useDuplicateCheck";
import { formatDistanceKm, formatMonthDay } from "@/core/utils/format";
import { colors, spacing } from "@/app/theme";
import { ExtractionDto } from "../../data/models/ExtractionDto";

const WARNING_MESSAGES: Record<ExtractionWarning, string> = {
    missing_started_at: '날짜를 읽지 못했습니다. 직접 입력해주세요.',
    invalid_started_at: '날짜 형식을 확인해주세요.',
    missing_distance: '거리를 읽지 못했습니다. 직접 입력해주세요.',
    missing_duration: '시간을 읽지 못했습니다. 직접 입력해주세요.',
    segments_unverified: '구간 기록이 총 거리와 맞지 않습니다.',
    unknown_segment_kind: '구간 종류를 판단하지 못해 랩으로 표시했습니다.',
};

export function ReviewForm({ dto, onLeave }: { dto: ExtractionDto; onLeave: () => void }) {
    const insets = useSafeAreaInsets();

    const extracted = useMemo(() => toExtractedActivity(dto), [dto]);
    const review = useReviewDraft(extracted);
    const draft = review.draft;

    const [selectedKind, setSelectedKind] = useState<'split' | 'lap'>('lap');

    const hasSplits = !!draft.splits?.length && !!draft.splitUnitMeters;
    const hasLaps = !!draft.laps?.length;
    const showToggle = hasSplits && hasLaps;

    const view: SegmentView | null = showToggle
        ? (selectedKind === 'split'
            ? { kind: 'split', segments: draft.splits!, unitMeters: draft.splitUnitMeters! }
            : { kind: 'lap', segments: draft.laps! })
        : primarySegments(draft);

    const basis = view?.kind === 'split' ? extracted.splitsBasis : extracted.lapsBasis;
    const basisText = view && basis ? describeSegmentBasis(basis, view.kind) : null;

    const saveImported = useSaveImported();
    const { data: duplicates = [] } = useDuplicateCheck(review.draft.startedAt);

    const disabled = !review.canSave || saveImported.isPending;

    const doSave = (id?: string) => {
        saveImported.mutate(
            { draft, id },
            {
                onSuccess: () => {
                    onLeave();
                },
                onError: (_) => {
                    Alert.alert('저장하지 못했습니다', '잠시 후 다시 시도해주세요.');
                }
            }
        )
    };

    const onSave = async () => {
        if (!review.canSave || saveImported.isPending) return;

        if (duplicates.length === 0) {
            doSave();
            return;
        }

        const exsisting = duplicates[0];
        Alert.alert(
            '비슷한 시각의 기록이 있습니다.',
            `${formatMonthDay(exsisting.startedAt)} · ${formatDistanceKm(exsisting.distanceMeters)} km`,
            [
                { text: '취소', style: 'cancel' },
                { text: '새로 저장', onPress: () => doSave() },
                { text: '덮어쓰기', style: 'destructive', onPress: () => doSave(exsisting.id) }
            ]
        )
    }

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView
                style={styles.flex}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag">
                <View>
                    {extracted.warnings?.length > 0 ? (
                        <Banner
                            tone="warning"
                            title="확인이 필요합니다"
                            lines={extracted.warnings.map((w) => WARNING_MESSAGES[w])}
                        />
                    ) : null}
                    <SumamryCard activity={extracted} review={review} />
                    {showToggle ? (
                        <View style={styles.segmentHeader}>
                            <Text style={styles.segmentHeaderLabel}>구간 기록</Text>
                            <View style={styles.segmentedControl}>
                                <Pressable
                                    style={[styles.segmentButton, selectedKind === 'lap' && styles.segmentButtonOn]}
                                    onPress={() => setSelectedKind('lap')}
                                >
                                    <Text style={[styles.segmentButtonText, selectedKind === 'lap' && styles.segmentButtonTextOn]}>수동 랩</Text>
                                </Pressable>
                                <Pressable
                                    style={[styles.segmentButton, selectedKind === 'split' && styles.segmentButtonOn]}
                                    onPress={() => setSelectedKind('split')}
                                >
                                    <Text style={[styles.segmentButtonText, selectedKind === 'split' && styles.segmentButtonTextOn]}>자동 분할</Text>
                                </Pressable>
                            </View>
                        </View>
                    ) : null}
                    {basisText ? <Text style={styles.basisHint}>{basisText}</Text> : null}
                    {view ?
                        <View style={[{ padding: spacing.lg }]}>
                            <SegmentTable view={view} />
                        </View>
                        : null
                    }
                </View >
            </ScrollView>
            <View style={[styles.bar, { paddingBottom: insets.bottom + 12 }]}>
                <Pressable
                    style={({ pressed }: PressableStateCallbackType) => [
                        styles.saveButton,
                        pressed && styles.pressed,
                        disabled && styles.saveButtonOff,
                    ]}
                    disabled={disabled}
                    onPress={onSave}
                >
                    {saveImported.isPending
                        ? (
                            <ActivityIndicator color={colors.card} />
                        )
                        : (
                            <Text style={styles.saveText}>저장</Text>
                        )
                    }
                </Pressable>
            </View>
        </KeyboardAvoidingView >
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    content: { paddingTop: 16, paddingBottom: 32, gap: 12 },
    basisHint: {
        fontSize: 13,
        color: colors.textMuted,
        marginHorizontal: 16,
        marginTop: 4,
    },
    segmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 8,
    },
    segmentHeaderLabel: {
        fontSize: 14,
        color: colors.textMuted,
    },
    segmentedControl: {
        flexDirection: 'row',
        gap: 4,
    },
    segmentButton: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
    },
    segmentButtonOn: {
        borderColor: colors.text,
        backgroundColor: colors.bgSubtle,
    },
    segmentButtonText: {
        fontSize: 13,
        color: colors.textMuted,
    },
    segmentButtonTextOn: {
        color: colors.text,
    },
    bar: {
        paddingHorizontal: 16,
        paddingTop: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
        backgroundColor: colors.card,
    },
    saveButton: {
        height: 52,
        borderRadius: 12,
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pressed: {
        backgroundColor: colors.accentPressed,
    },
    saveButtonOff: {
        backgroundColor: colors.accentDisabled,
    },
    saveText: {
        color: colors.textInverse,
        fontSize: 18,
        fontWeight: '600',
    },
});
