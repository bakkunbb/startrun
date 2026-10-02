import { spacing, ThemeColors, useStyles } from "@/app/theme";
import { PeriodUnit, SubBucket } from "../../domain/period";
import { StyleSheet, Text, View } from "react-native";
import { formatBucketLabel } from "@/core/utils/format";

type Props = {
    buckets: SubBucket[];
    unit: PeriodUnit;
}

export function WeeklyBarChart({ buckets, unit }: Props) {
    const styles = useStyles(createStyles);
    const max = Math.max(...buckets.map((b) => b.distanceMeters), 1);

    return (
        <View style={styles.wrap}>
            <View style={styles.barRow}>
                {buckets.map((b) => {
                    const hasActivity = b.distanceMeters > 0;
                    const heightPct = hasActivity ? (b.distanceMeters / max) * 100 : 0;

                    return (
                        <View key={b.start.getTime()} style={styles.barColumn}>
                            <View
                                style={[
                                    styles.bar,
                                    { height: `${heightPct}%` },
                                    hasActivity ? styles.barActive : styles.barEmpty,
                                ]}
                            />
                        </View>
                    );
                })}
            </View>
            <View style={styles.labelRow}>
                {buckets.map((b) => (
                    <Text
                        key={b.start.getTime()}
                        style={[
                            styles.label,
                            { fontSize: unit === 'week' ? 12 : 8 }
                        ]}>
                        {formatBucketLabel(b.start, unit)}
                    </Text>
                ))}
            </View>
        </View>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    wrap: {
        paddingHorizontal: spacing.lg,
        marginHorizontal: spacing.md,
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 96,
        gap: 6,
    },
    barColumn: {
        flex: 1,              // 7개 바가 부모 너비를 균등하게 나눠 채운다
        alignItems: 'stretch',
    },
    bar: {
        borderRadius: 4,
        minHeight: 10,          // 0일 때도 완전히 사라지지 않도록
    },
    barActive: {
        backgroundColor: colors.accent,
    },
    barEmpty: {
        backgroundColor: colors.bgSubtle,
    },
    labelRow: {
        flexDirection: 'row',
        gap: 3,
        marginTop: spacing.md,
    },
    label: {
        flex: 1,
        textAlign: 'center',
        // fontSize: 10,
        color: colors.textMuted,
    },
});