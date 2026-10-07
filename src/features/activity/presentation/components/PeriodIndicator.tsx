import { Pressable, StyleSheet, Text, View } from "react-native";
import { canGoNext, Period, shiftPeriod } from "../../domain/period";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { formatPeriodLabel } from "@/core/utils/format";
import { spacing, ThemeColors, useColors, useStyles } from "@/app/theme";

type Props = {
    period: Period;
    onChange: (period: Period) => void;
};

export function PeriodIndicator({ period, onChange }: Props) {

    const colors = useColors();
    const styles = useStyles(createStyles);

    return (
        <View style={styles.rowContainer}>
            <Pressable
                onPress={() => onChange(shiftPeriod(period, -1))}
            >
                <ChevronLeft color={colors.text} />
            </Pressable>
            <Text style={styles.periodLabel}>{formatPeriodLabel(period)}</Text>
            <Pressable
                onPress={() => onChange(shiftPeriod(period, 1))}
                disabled={!canGoNext(period)}
            >
                <ChevronRight color={colors.text} />
            </Pressable>
        </View>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    rowContainer: {
        paddingVertical: spacing.lg,
        flexDirection: 'row',          // Aligns items horizontally
        justifyContent: 'space-between', // Pushes items to the edges
        alignItems: 'center',          // Vertically centers items in the row
        width: '100%',                 // Takes up full horizontal space
    },
    periodLabel: {
        fontSize: 18,
        color: colors.text
    },
})