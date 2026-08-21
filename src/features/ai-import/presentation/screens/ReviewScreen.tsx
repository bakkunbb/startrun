import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, PressableStateCallbackType, ScrollView, StyleSheet, Text, View } from "react-native";
import { ExtractionWarning } from "../../domain/entities/ExtractedActivity";
import { useReviewDraft } from "../hooks/useReviewDraft";
import { useMemo } from "react";
import { toExtractedActivity } from "../../domain/toExtractedActivity";
import { Banner } from "@/core/ui/Banner";
import { primarySegments } from "@/features/activity/domain/entities/Activity";
import { SegmentTable } from "@/features/activity/presentation/components/SegmentTable";
import { SumamryCard } from "../components/SummaryCard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSaveImported } from "../hooks/useSaveImported";
import { RootStackParamList } from "@/app/navigation/RootNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useDuplicateCheck } from "../hooks/useDuplicateCheck";
import { formatDistanceKm, formatMonthDay } from "@/core/utils/format";

const WARNING_MESSAGES: Record<ExtractionWarning, string> = {
    missing_started_at: '날짜를 읽지 못했습니다. 직접 입력해주세요.',
    invalid_started_at: '날짜 형식을 확인해주세요.',
    missing_distance: '거리를 읽지 못했습니다. 직접 입력해주세요.',
    missing_duration: '시간을 읽지 못했습니다. 직접 입력해주세요.',
    segments_unverified: '구간 기록이 총 거리와 맞지 않습니다.',
    unknown_segment_kind: '구간 종류를 판단하지 못해 랩으로 표시했습니다.',
};

export default function ReviewScreen({ route }: { route: any }) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const insets = useSafeAreaInsets();

    const { dto } = route.params;
    const extracted = useMemo(() => toExtractedActivity(dto), [dto]);
    const review = useReviewDraft(extracted);
    const draft = review.draft;

    const view = primarySegments(review.draft);

    const saveImported = useSaveImported();
    const { data: duplicates = [] } = useDuplicateCheck(review.draft.startedAt);

    const disabled = !review.canSave || saveImported.isPending;

    const doSave = (id?: string) => {
        saveImported.mutate(
            { draft, id },
            {
                onSuccess: () => navigation.popToTop(),
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
                    {view ? <SegmentTable view={view} /> : null}
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
                            <ActivityIndicator color="#FFFFFF" />
                        )
                        : (
                            <Text style={styles.saveText}>저장</Text>
                        )
                    }
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    content: { paddingTop: 16, paddingBottom: 32, gap: 12 },
    bar: {
        paddingHorizontal: 16,
        paddingTop: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    saveButton: {
        height: 52,
        borderRadius: 12,
        backgroundColor: '#1D4ED8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pressed: {
        backgroundColor: '#1A43B8',
    },
    saveButtonOff: {
        backgroundColor: '#C7D2E4',
    },
    saveText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '600',
    },
});