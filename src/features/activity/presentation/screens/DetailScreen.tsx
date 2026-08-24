import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { useActivity } from "../hooks/useActivity";
import { primarySegments } from "../../domain/entities/Activity";
import { segmentSummary } from "../../domain/entities/Segment";
import { SegmentTable } from "../components/SegmentTable";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { NoteEditor } from "../components/NoteEditor";
import { useDeleteActivity } from "../hooks/useDeleteActivity";
import { RootStackParamList } from "@/app/navigation/RootNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useLayoutEffect, } from "react";
import { HeaderDeleteButton } from "../components/HeaderDeleteButton";
import { EmptyState } from "@/core/ui/EmptyState";
import { DetailHeader } from "../components/DetailHeader";
import { MetricsGrid } from "../components/MetricsGrid";
import { PaceBarChart } from "../components/PaceBarChart";
import { colors, spacing } from "@/app/theme";

export function DetailScreen({ route }: { route: any }) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const { id } = route.params;
    const { data: activity, isPending, isError, refetch } = useActivity(id);
    const deleteActivity = useDeleteActivity();

    const onDelete = useCallback(() => {
        Alert.alert('기록을 삭제할까요?', '삭제된 기록은 복구할 수 없습니다', [
            { text: '취소', style: 'cancel' },
            {
                text: '삭제',
                style: 'destructive',
                onPress: () => {
                    deleteActivity.mutate(
                        id,
                        {
                            onSuccess: () => navigation.goBack()
                        }
                    )
                }
            }
        ])
    }, [id, navigation, deleteActivity]);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => <HeaderDeleteButton onPress={onDelete} />
        })
    }, [navigation, onDelete]);

    if (isPending) {
        return (
            <View style={styles.center}>
                <ActivityIndicator />
            </View>
        )
    }

    if (isError) {
        return (
            <EmptyState
                title="불러오지 못했어요"
                actionLabel="다시 시도"
                onAction={() => refetch()}
            />
        )
    }

    if (activity === null) {
        return (
            <EmptyState
                title="기록을 찾을 수 없어요"
                description="삭제되었거나 잘못된 접근입니다"
                actionLabel="목록으로"
                onAction={() => navigation.popToTop()}
            />
        )
    }

    const view = primarySegments(activity);
    const summary = segmentSummary(view);

    return (
        <KeyboardAwareScrollView contentContainerStyle={styles.content} bottomOffset={24}>
            <DetailHeader activity={activity} />
            <MetricsGrid activity={activity} view={view} summary={summary} />

            {view ? (
                <View style={styles.segmentSection}>
                    <Text style={styles.segmentSectionLabel}>구간 기록</Text>
                    <PaceBarChart view={view} summary={summary} />
                    <SegmentTable view={view} />
                </View>
            ) : null}

            <NoteEditor id={id} activityNote={activity.note} />
        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 12,
    },
    content: { paddingVertical: spacing.lg, gap: spacing.md },
    segmentSection: {
        marginTop: spacing.sm,
    },
    segmentSectionLabel: {
        fontSize: 14,
        color: colors.textMuted,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.xs,
    },
});
