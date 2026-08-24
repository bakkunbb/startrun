import { StyleSheet, Text, View } from "react-native";
import { Activity } from "../../domain/entities/Activity";
import { formatDatetime, formatDistanceKm } from "@/core/utils/format";
import { SourceBadge } from "./SourceBadge";
import { colors, spacing, typography } from "@/app/theme";

export function DetailHeader({ activity }: { activity: Activity }) {
    return (
        <View style={styles.header}>
            <SourceBadge source={activity.source} />
            <Text style={styles.distance}>
                {formatDistanceKm(activity.distanceMeters)}<Text style={styles.distanceUnit}> km</Text>
            </Text>
            <Text style={styles.subtitle}>
                {formatDatetime(activity.startedAt)}
                {activity.heartRate !== undefined ? ` · 평균 ${activity.heartRate}bpm` : ''}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    header: { paddingHorizontal: spacing.lg, gap: spacing.xs },
    distance: {
        ...typography.display,
        color: colors.text,
        marginTop: spacing.xs,
    },
    distanceUnit: {
        fontSize: 15,
        fontWeight: '400',
        color: colors.textMuted,
    },
    subtitle: {
        fontSize: 13,
        color: colors.textMuted,
    },
});
