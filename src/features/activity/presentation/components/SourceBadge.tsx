import { Text, StyleSheet, View } from "react-native";
import { ActivitySource } from "../../domain/entities/Activity";
import { radius, spacing, ThemeColors, useStyles } from "@/app/theme";

export function SourceBadge({ source }: { source: ActivitySource }) {
    const styles = useStyles(createStyles);
    const sourceStyles = useStyles(createSourceStyles);

    const { label, bg, fg } = sourceStyles[source];

    return (
        <View style={[styles.badge, { backgroundColor: bg, }]}>
            <Text style={[styles.label, { color: fg }]}>{label}</Text>
        </View>
    )
}

const createSourceStyles = (colors: ThemeColors): Record<ActivitySource, { label: string; bg: string, fg: string }> => ({
    ai_import: { label: '스크린샷', bg: colors.accentSubtle, fg: colors.accent },
    strava: { label: 'Strava', bg: colors.warningSubtle, fg: colors.warning },
    gps: { label: '직접 기록', bg: colors.successSubtle, fg: colors.success },
    health: { label: '건강 앱', bg: colors.healthSubtle, fg: colors.health },
});

const createStyles = () => StyleSheet.create({
    badge: {
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: radius.sm,
        alignSelf: 'flex-start',
    },
    label: {
        fontSize: 12,
        fontWeight: '500',
    },
});