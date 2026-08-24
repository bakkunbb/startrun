import { StyleSheet, View } from "react-native";
import { fastestSegment, isRemainder, segmentPaceSecPerKm, SegmentSummary, SegmentView } from "../../domain/entities/Segment";
import { colors, spacing } from "@/app/theme";

export function PaceBarChart({ view, summary }: { view: SegmentView; summary: SegmentSummary | null }) {
    if (view.segments.length <= 1) return null;

    const fastest = fastestSegment(view);

    return (
        <View style={styles.barRow}>
            {view.segments.map((s) => {
                const pace = segmentPaceSecPerKm(s);
                const heightPct = pace && summary ? (summary.fastestPace / pace) * 100 : 0;
                const isFastest = fastest?.index === s.index;
                const remainder = isRemainder(view, s.index);

                return (
                    <View
                        key={s.index}
                        style={[
                            styles.bar,
                            { height: `${heightPct}%` },
                            isFastest && styles.barFastest,
                            remainder && styles.barRemainder,
                        ]}
                    />
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    barRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 56,
        gap: 3,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.sm,
    },
    bar: {
        flex: 1,
        borderRadius: 3,
        backgroundColor: colors.bgSubtle,
        minHeight: 3,
    },
    barFastest: {
        backgroundColor: colors.accent,
    },
    barRemainder: {
        opacity: 0.4,
    },
});
