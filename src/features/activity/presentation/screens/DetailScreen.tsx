import { ActivityIndicator, Alert, Button, Pressable, StyleSheet, Text, View } from "react-native";
import { useActivity } from "../hooks/useActivity";
import { Banner } from "@/core/ui/Banner";
import { paceSecPerKm, primarySegments } from "../../domain/entities/Activity";
import { segmentSummary } from "../../domain/entities/Segment";
import { formatDatetime, formatDistanceKm, formatDuration, formatPace } from "@/core/utils/format";
import { SourceBadge } from "../components/SourceBadge";
import { SegmentTable } from "../components/SegmentTable";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { NoteEditor } from "../components/NoteEditor";
import { useDeleteActivity } from "../hooks/useDeleteActivity";
import { RootStackParamList } from "@/app/navigation/RootNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useLayoutEffect, } from "react";
import { HeaderDeleteButton } from "../components/HeaderDeleteButton";


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
            <View style={styles.center}>
                <Banner
                    tone="danger"
                    title="기록을 불러오지 못했습니다"
                />
                <Pressable
                    style={styles.retry}
                    onPress={() => refetch()}
                >
                    <Text style={styles.retryText}>다시 시도</Text>
                </Pressable>
            </View>
        )
    }

    if (activity === null) {
        return (
            <View style={styles.center}>
                <Text style={styles.empty}>기록을 찾을 수 없습니다</Text>
            </View>
        )
    }

    const view = primarySegments(activity);
    const summary = segmentSummary(view);

    return (
        <KeyboardAwareScrollView contentContainerStyle={styles.content} bottomOffset={24}>
            <View>
                <Text>{formatDatetime(activity.startedAt)}</Text>
                <SourceBadge source={activity.source} />
                <View>
                    <Text>거리</Text>
                    <Text>{formatDistanceKm(activity.distanceMeters)} km</Text>
                    <Text>시간</Text>
                    <Text>{formatDuration(activity.durationSeconds)}</Text>
                    <Text>페이스</Text>
                    <Text>{formatPace(paceSecPerKm(activity))} /km</Text>
                    <Text>심박수</Text>
                    <Text>{activity.heartRate} bpm</Text>
                </View>
                <View>
                    <View>
                        <Text>구간</Text>
                        <Text>{summary?.count}개 ({summary?.measuredCount} 기준)</Text>
                    </View>
                    <Text>최고 페이스 {formatPace(summary?.fastestPace)}</Text>
                    <Text>평균 페이스 {formatPace(summary?.averagePace)}</Text>
                    <Text>편차 {formatPace(summary?.spread)}</Text>
                </View>
                {view ? <SegmentTable view={view} /> : null}
            </View>
            <NoteEditor id={id} activityNote={activity.note} />
            <View>
                <Button title="삭제" onPress={onDelete} />
            </View>
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
    content: { paddingVertical: 16, gap: 12 },
    empty: { fontSize: 15, color: '#6B7280' },
    retry: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    retryText: { fontSize: 15, color: '#374151' },
});