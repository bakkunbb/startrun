import { StyleSheet, Text, View } from "react-native";
import { Activity, paceSecPerKm } from "../../domain/entities/Activity";
import { SegmentSummary, SegmentView } from "../../domain/entities/Segment";
import { formatDuration, formatPace } from "@/core/utils/format";
import { colors, radius, spacing } from "@/app/theme";

function MetricCard({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>{label}</Text>
            <Text style={styles.metricValue}>{value}</Text>
        </View>
    );
}

export function MetricsGrid({ activity, view, summary, }: { activity: Activity; view: SegmentView | null; summary: SegmentSummary | null; }) {
    const fastestLabel = view?.kind === 'split'
        ? `가장 빠른 ${view.unitMeters >= 1600 ? '1마일' : '1km'}`
        : '가장 빠른 랩';

    const cards: { label: string; value: string }[] = [
        { label: '시간', value: formatDuration(activity.durationSeconds) },
        { label: '평균 페이스', value: `${formatPace(paceSecPerKm(activity))} /km` },
    ];

    if (summary) cards.push({ label: fastestLabel, value: formatPace(summary.fastestPace) });
    if (activity.heartRate !== undefined) cards.push({ label: '심박수', value: `${activity.heartRate} bpm` });
    if (activity.calories !== undefined) cards.push({ label: '칼로리', value: `${activity.calories} kcal` });

    return (
        <View style={styles.metricsGrid}>
            {cards.map((c) => <MetricCard key={c.label} label={c.label} value={c.value} />)}
            {cards.length % 2 !== 0 ? <View style={styles.metricCardPlaceholder} /> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    metricsGrid: {
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
});
