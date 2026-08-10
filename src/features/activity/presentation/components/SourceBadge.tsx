import { Text, StyleSheet, View } from "react-native";
import { ActivitySource } from "../../domain/entities/Activity";
import { radius, spacing } from "@/app/theme";

const STYLE_BY_SOURCE: Record<ActivitySource, { label: string; bg: string, fg: string }> = {
    ai_import: { label: '스크린샷', bg: '#e6f1fb', fg: '#185fa5' },
    strava: { label: 'Strava', bg: '#faeeda', fg: '#854f0b' },
    gps: { label: '직접 기록', bg: '#eaf3de', fg: '#3b6d11' },
    health: { label: '건강 앱', bg: '#fbeaf0', fg: '#993556' },
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