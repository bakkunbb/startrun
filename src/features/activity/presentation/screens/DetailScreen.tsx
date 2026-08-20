import { ActivityIndicator, Button, Pressable, StyleSheet, Text, View } from "react-native";
import { useActivity } from "../hooks/useActivity";
import { Banner } from "@/core/ui/Banner";
import { paceSecPerKm, primarySegments } from "../../domain/entities/Activity";
import { segmentSummary } from "../../domain/entities/Segment";
import { formatDatetime, formatDistanceKm, formatDuration, formatPace } from "@/core/utils/format";
import { SourceBadge } from "../components/SourceBadge";
import { SegmentTable } from "../components/SegmentTable";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { NoteEditor } from "../components/NoteEditor";

export function DetailScreen({ route }: { route: any }) {
    const { id } = route.params;
    const { data: activity, isPending, isError, refetch } = useActivity(id);

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
                    <View>
                        <Text>{formatDistanceKm(activity.distanceMeters)}</Text>
                        <Text>km</Text>
                    </View>
                    <View>
                        <Text>{formatDuration(activity.durationSeconds)}</Text>
                        <Text>시간</Text>
                    </View>
                    <View>
                        <Text>{formatPace(paceSecPerKm(activity))}</Text>
                        <Text>/km</Text>
                    </View>
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
                <Button title="삭제" />
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