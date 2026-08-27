import { StyleSheet, Text, View } from "react-native";
import { PeriodSummary } from "../../domain/periodSummary";
import { formatDistanceKm, formatPace } from "@/core/utils/format";
import { colors, radius, spacing, typography } from "@/app/theme";

function SummaryCard({ label, value }: { label: string, value: string }) {
    return (
        <View style={styles.summaryCard}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
        </View>
    )
}

export function WeeklySummaryStrip({ summary }: { summary: PeriodSummary }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>This week</Text>
            <View style={styles.summaryRow}>
                <SummaryCard label='러닝' value={`${summary.count}회`} />
                <SummaryCard label='거리' value={`${formatDistanceKm(summary.totalDistanceMeters)}km`} />
                <SummaryCard label='평균' value={`${formatPace(summary.avgPaceSecPerKm)}/km`} />
            </View>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: spacing.md,
        marginTop: spacing.sm,
        marginBottom: spacing.xs,
        padding: spacing.md,
        borderColor: colors.textMuted,
        borderWidth: 1,
        borderRadius: radius.md,
        gap: 2,
    },
    title: {
        ...typography.title,
        color: colors.text
    },
    label: {
        ...typography.label,
        color: colors.textMuted,
    },
    value: {
        ...typography.title,
        color: colors.text,
    },
    summaryRow: {
        flexDirection: 'row'
    },
    summaryCard: {
        flex: 1,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: radius.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        marginHorizontal: spacing.xs,
        marginTop: spacing.sm,
        marginBottom: spacing.xs,
        gap: 4,
    },
});
