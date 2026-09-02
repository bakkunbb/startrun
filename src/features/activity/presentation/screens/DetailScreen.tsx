import { ActivityIndicator, Alert, Share, StyleSheet, Text, View } from "react-native";
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
import { useCallback, useLayoutEffect, useRef, } from "react";
import { HeaderDeleteButton } from "../components/HeaderDeleteButton";
import { EmptyState } from "@/core/ui/EmptyState";
import { DetailHeader } from "../components/DetailHeader";
import { MetricsGrid } from "../components/MetricsGrid";
import { PaceBarChart } from "../components/PaceBarChart";
import { colors, spacing } from "@/app/theme";
import ViewShot, { ViewShotRef } from "react-native-view-shot";
import ContextMenu from "react-native-context-menu-view";

export function DetailScreen({ route }: { route: any }) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const summaryRef = useRef<ViewShotRef>(null);
    const segmentRef = useRef<ViewShotRef>(null);

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

    const fileName = `startrun_${new Date().toISOString()}`;

    return (
        <KeyboardAwareScrollView contentContainerStyle={styles.content} bottomOffset={24}>
            <View>
                <ContextMenu
                    actions={[
                        { title: '요약 저장하기', systemIcon: "square.and.arrow.up" },
                    ]}
                    onPress={(e) => {
                        if (e.nativeEvent.index === 0) {
                            summaryRef.current?.capture().then((uri: string) => {
                                Share.share({ url: uri });
                            })
                        }
                    }}>
                    <ViewShot
                        ref={summaryRef}
                        options={{ fileName: fileName, format: "png", quality: 1 }}
                        style={styles.summaryCapture}
                    >
                        <DetailHeader activity={activity} />
                        <MetricsGrid activity={activity} view={view} summary={summary} />
                    </ViewShot>

                </ContextMenu>
            </View>
            {view ? (
                <View style={styles.segmentSection}>
                    <Text style={styles.segmentSectionLabel}>구간 기록</Text>
                    <PaceBarChart view={view} summary={summary} />
                    <ContextMenu
                        actions={[
                            { title: '구간기록 저정하기', systemIcon: "square.and.arrow.up" },
                        ]}
                        onPress={(e) => {
                            if (e.nativeEvent.index === 0) {
                                segmentRef.current?.capture().then((uri: string) => {
                                    Share.share({ url: uri });
                                })
                            }
                        }}
                    >
                        <ViewShot ref={segmentRef} style={styles.tableSection} options={{ fileName: fileName, format: "png", quality: 1.0 }}>
                            <SegmentTable view={view} />
                        </ViewShot>
                    </ContextMenu>
                </View>
            ) : null}
            <NoteEditor id={id} activityNote={activity.note} />
        </KeyboardAwareScrollView >
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
    content: {
        paddingBottom: spacing.lg,
        gap: spacing.md
    },
    summaryCapture: {
        padding: spacing.lg,
        borderRadius: 12,
    },
    segmentSection: {
        marginTop: spacing.sm,
    },
    tableSection: {
        margin: spacing.lg,
        borderRadius: 12,
    },
    segmentSectionLabel: {
        fontSize: 14,
        color: colors.textMuted,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.xs,
    },
});
