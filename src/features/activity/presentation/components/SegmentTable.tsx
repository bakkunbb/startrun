import { formatDistanceKm, formatDuration, formatPace } from "@/core/utils/format";
import { fastestSegment, isRemainder, segmentPaceSecPerKm, SegmentView } from "../../domain/entities/Segment";
import { StyleSheet, Text, View } from "react-native";

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
            </View>
            {view.segments.map((s) => {
                const remainder = isRemainder(view, s.index);
                const best = fastest?.index === s.index;
                const tone = [remainder && styles.dim, best && styles.best];

                return (
                    <View key={s.index} style={styles.row}>
                        <Text style={[styles.cell, styles.num, ...tone]}>
                            {s.index}
                        </Text>
                        <Text style={[styles.cell, styles.value, ...tone]}>
                            {formatDistanceKm(s.distanceMeters)} km
                        </Text>
                        <Text style={[styles.cell, styles.value, ...tone]}>
                            {formatDuration(s.durationSeconds)}
                        </Text>
                        <Text style={[styles.cell, styles.value, ...tone]}>
                            {formatPace(segmentPaceSecPerKm(s))}
                        </Text>
                    </View>
                );
            })}
        </View>
    )
}

const styles = StyleSheet.create({
    wrap: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginTop: 12,
    },
    title: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 32,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#F3F4F6',
    },
    head: { borderBottomColor: '#E5E7EB' },
    headText: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
    cell: { fontSize: 14, color: '#111827', fontVariant: ['tabular-nums'] },
    num: { width: 32 },
    value: { flex: 1, textAlign: 'right' },
    dim: { color: '#9CA3AF' },
    best: { fontWeight: '700', color: '#1D4ED8' },
});