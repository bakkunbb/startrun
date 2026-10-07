import { FlatList, StyleSheet, Text, View } from "react-native";
import { useActivities } from "../hooks/useActivities";
import { activitiesIn, changeUnit, periodOf, subBuckets, summarize } from "../../domain/period";
import { useState } from "react";
import { formatDistanceKm, formatDuration, formatPace } from "@/core/utils/format";
import { radius, spacing, ThemeColors, useStyles } from "@/app/theme";
import { WeeklyBarChart } from "../components/WeeklyBarChart";
import { BucketCard } from "../components/BucketCard";
import { PeriodIndicator } from "../components/PeriodIndicator";
import { SegmentedControl } from "@/core/ui/SegmentControl";
import { EmptyState } from "@/core/ui/EmptyState";

function MetricCard({ label, value }: { label: string; value: string }) {
    const styles = useStyles(createStyles);

    return (
        <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>{label}</Text>
            <Text style={styles.metricValue}>{value}</Text>
        </View>
    );
}

export function StatsScreen() {
    const { data: activities = [], isPending } = useActivities();
    const [period, setPeriod] = useState(() => periodOf(new Date(), 'week'));

    const inPeriod = activitiesIn(activities, period);
    const summary = summarize(inPeriod);
    const graph = subBuckets(activities, period);

    const styles = useStyles(createStyles);

    const cards: { label: string; value: string }[] = [
        { label: '총 거리', value: formatDistanceKm(summary.totalDistanceMeters) },
        { label: '총 시간', value: formatDuration(summary.totalDurationSeconds) },
        { label: '평균 페이스', value: `${formatPace(summary.avgPaceSecPerKm)} /km` },
        { label: 'Count', value: `${summary.count}회` },
    ];

    if (isPending) {
        return (
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.skeletonBarWide} />
                </View>
                <View style={styles.metricsGrid}>
                    {[0, 1, 2, 3].map((i) => (
                        <View key={i} style={styles.metricCard}>
                            <View style={styles.skeletonBarNarrow} />
                            <View style={styles.skeletonBarWide} />
                        </View>
                    ))}
                </View>
                <View style={styles.chartSkeleton} />
                <View style={styles.bucketList}>
                    {[0, 1, 2].map((i) => (
                        <View key={i} style={styles.rowSkeleton}>
                            <View style={styles.skeletonBarNarrow} />
                            <View style={styles.skeletonBarWide} />
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    return (
        <View style={styles.content}>
            <View style={styles.header}>
                <SegmentedControl
                    options={[
                        { value: 'week', label: '주간' },
                        { value: 'month', label: '월간' },
                    ]}
                    value={period.unit}
                    onChange={(unit) => setPeriod(changeUnit(period, unit))}
                />
                <PeriodIndicator period={period} onChange={setPeriod} />
            </View>
            <View style={styles.metricsGrid}>
                {cards.map((c) => <MetricCard key={c.label} label={c.label} value={c.value} />)}
            </View>
            <WeeklyBarChart buckets={graph} unit={period.unit} />
            <View style={styles.bucketList}>
                <FlatList
                    data={inPeriod}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <BucketCard activity={item} />}
                    ListEmptyComponent={(
                        <EmptyState title="기록이 존재하지 않습니다" />
                    )}
                />
            </View>
        </View >
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    content: {
        gap: spacing.md,
        flex: 1
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
    },
    metricsGrid: {
        paddingHorizontal: spacing.lg,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    metricCard: {
        flexBasis: '48%',
        flexGrow: 1,
        backgroundColor: colors.card,
        borderRadius: radius.md,
        padding: spacing.md,
        gap: 4,
    },
    metricCardPlaceholder: {
        flexBasis: '48%',
        flexGrow: 1,
    },
    metricLabel: {
        fontSize: 13,
        color: colors.textMuted,
    },
    metricValue: {
        fontSize: 21,
        fontWeight: '500',
        color: colors.text,
    },
    bucketList: {
        flex: 1
    },
    skeletonBarWide: {
        height: 20,
        width: '60%',
        borderRadius: radius.sm,
        backgroundColor: colors.bgSubtle,
    },
    skeletonBarNarrow: {
        height: 13,
        width: '40%',
        borderRadius: radius.sm,
        backgroundColor: colors.bgSubtle,
        marginBottom: 6,
    },
    chartSkeleton: {
        height: 130,
        marginHorizontal: spacing.lg,
        borderRadius: radius.md,
        backgroundColor: colors.card,
    },
    rowSkeleton: {
        backgroundColor: colors.card,
        padding: spacing.md,
        marginHorizontal: spacing.lg,
        marginVertical: spacing.sm,
        borderRadius: radius.md,
        gap: 4,
    },
});