import { Button, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
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

    const view = primarySegments(review.draft);

    const saveImported = useSaveImported();

    const onSave = async () => {
        saveImported.mutate(
            review,
            {
                onSuccess: () => navigation.popToTop(),
            }
        );
    }
    // const onSave = useSaveImported();

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
                    <SumamryCard activity={extracted} />
                    {view ? <SegmentTable view={view} /> : null}
                </View >
            </ScrollView>
            <View style={[styles.bar, { paddingBottom: insets.bottom + 12 }]}>
                <Button title="저장" disabled={!review.canSave} onPress={onSave} />
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
});