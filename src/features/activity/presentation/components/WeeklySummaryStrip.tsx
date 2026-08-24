import { StyleSheet, Text, View } from "react-native";
import { PeriodSummary } from "../../domain/periodSummary";
import { formatDistanceKm, formatPace } from "@/core/utils/format";
import { colors, radius, spacing, typography } from "@/app/theme";

export function WeeklySummaryStrip({ summary }: { summary: PeriodSummary }) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>이번 주</Text>
            <Text style={styles.value}>
                {formatDistanceKm(summary.totalDistanceMeters)}km · {summary.count}회 · {formatPace(summary.avgPaceSecPerKm)}/km
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        marginHorizontal: spacing.md,
        marginTop: spacing.sm,
        marginBottom: spacing.xs,
        backgroundColor: colors.bgSubtle,
        borderRadius: radius.lg,
        gap: 2,
    },
    label: {
        ...typography.caption,
        color: colors.textMuted,
    },
    value: {
        ...typography.subtitle,
        color: colors.text,
    },
});
