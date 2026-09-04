import { formatDistanceKm, formatDuration, formatPace } from "@/core/utils/format";
import { fastestSegment, isRemainder, segmentPaceSecPerKm, SegmentView } from "../../domain/entities/Segment";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, tabularNums } from "@/app/theme";

export function SegmentTable({ view }: { view: SegmentView }) {
    const fastest = fastestSegment(view);

    const title = view.kind === 'split'
        ? `자동분할 · ${formatDistanceKm(view.unitMeters)}`
        : '수동 랩';

    return (
        <View style={styles.wrap}>
            <Text style={styles.title}>{title}</Text>
            <View style={[styles.row, styles.head]}>
                <Text style={[styles.cell, styles.num, styles.headText]}>#</Text>
                <Text style={[styles.cell, styles.value, styles.headText]}>거리</Text>
                <Text style={[styles.cell, styles.value, styles.headText]}>시간</Text>
                <Text style={[styles.cell, styles.value, styles.headText]}>페이스</Text>
                <Text style={[styles.cell, styles.value, styles.headText]}>심박수</Text>
            </View>
            {view.segments.map((s) => {
                const remainder = isRemainder(view, s.index);
                const best = fastest?.index === s.index;
                const tone = [remainder && styles.dim, best && styles.best];
                const distance = view.kind === 'split'
                    ? `${formatDistanceKm(s.distanceMeters)} km`
                    : `${s.distanceMeters} m`;

                return (
                    <View key={s.index} style={styles.row}>
                        <Text style={[styles.cell, styles.num, ...tone]}>
                            {s.index}
                        </Text>
                        <Text style={[styles.cell, styles.value, ...tone]}>
                            {distance}
                        </Text>
                        <Text style={[styles.cell, styles.value, ...tone]}>
                            {formatDuration(s.durationSeconds, true)}
                        </Text>
                        <Text style={[styles.cell, styles.value, ...tone]}>
                            {formatPace(segmentPaceSecPerKm(s))} /km
                        </Text>
                        <Text style={[styles.cell, styles.value, ...tone]}>
                            {s.heartRate} bpm
                        </Text>
                    </View>
                );
            })}
        </View>
    )
}

const styles = StyleSheet.create({
    wrap: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: spacing.lg,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text, marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 32,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.bgSubtle,
    },
    head: { borderBottomColor: colors.border },
    headText: { fontSize: 13, color: colors.textDisabled, fontWeight: '500' },
    cell: { fontSize: 15, color: colors.text, ...tabularNums },
    num: { width: 32 },
    value: { flex: 1, textAlign: 'center' },
    dim: { color: colors.textDisabled },
    best: { fontWeight: '700', color: colors.accent },
});