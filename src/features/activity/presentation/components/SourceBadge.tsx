import { Text, StyleSheet, View } from "react-native";
import { ActivitySource } from "../../domain/entities/Activity";
import { colors, radius, spacing } from "@/app/theme";

const STYLE_BY_SOURCE: Record<ActivitySource, { label: string; bg: string, fg: string }> = {
    ai_import: { label: '스크린샷', bg: colors.accentSubtle, fg: colors.accent },
    strava: { label: 'Strava', bg: colors.warningSubtle, fg: colors.warning },
    gps: { label: '직접 기록', bg: colors.successSubtle, fg: colors.success },
    health: { label: '건강 앱', bg: colors.healthSubtle, fg: colors.health },
}

export function SourceBadge({ source }: { source: ActivitySource }) {
    const { label, bg, fg } = STYLE_BY_SOURCE[source];

    return (
        <View style={[styles.badge, { backgroundColor: bg, }]}>
            <Text style={[styles.label, { color: fg }]}>{label}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: radius.sm,
        alignSelf: 'flex-start',
    },
    label: {
        fontSize: 11,
        fontWeight: '500',
    },
});