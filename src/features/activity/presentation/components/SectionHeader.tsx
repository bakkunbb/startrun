import { StyleSheet, Text, View } from "react-native";
import { MonthSection } from "../../domain/period";
import { formatDistanceKm, formatYearMonth } from "@/core/utils/format";
import { layout, spacing, tabularNums, ThemeColors, typography, useStyles } from "@/app/theme";

export function SectionHeader({ section }: { section: MonthSection }) {
    const styles = useStyles(createStyles);

    return (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{formatYearMonth(section.start)}</Text>
            <Text style={styles.sectionSummary}>{formatDistanceKm(section.summary.totalDistanceMeters)}km · {section.summary.count}회</Text>
        </View>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        paddingHorizontal: layout.screenPadding,
        paddingTop: spacing.xl,
        paddingBottom: spacing.sm,
        backgroundColor: colors.bg,
    },
    sectionTitle: {
        ...typography.subtitle,
        color: colors.text,
    },
    sectionSummary: {
        ...typography.caption,
        color: colors.textMuted,
        ...tabularNums,
    },
});