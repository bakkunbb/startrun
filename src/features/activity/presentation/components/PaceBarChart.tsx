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
                // 실제 비율(fastestPace/pace)을 세제곱해서 차이를 눈에 띄게 키운다.
                // min-max로 강제로 늘리면 편차가 실제보다 훨씬 커 보이므로 쓰지 않는다.
                const heightPct = pace && summary
                    ? Math.pow(summary.fastestPace / pace, 3) * 100
                    : 0;
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
        backgroundColor: colors.card,
        minHeight: 3,
    },
    barFastest: {
        backgroundColor: colors.accent,
    },
    barRemainder: {
        opacity: 0.4,
    },
});
