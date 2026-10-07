import { radius, spacing, ThemeColors, typography, useStyles } from "@/app/theme";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Option<T extends string> = {
    value: T;
    label: string
};

type Props<T extends string> = {
    options: Option<T>[];
    value: T;
    onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>(props: Props<T>) {
    const styles = useStyles(createStyle);

    return (
        <View style={styles.track}>
            {props.options.map((opt) => {
                const selected = opt.value === props.value;

                return (
                    <Pressable
                        key={opt.value}
                        style={[
                            styles.segment,
                            selected && styles.segmentSelected
                        ]}
                        onPress={() => props.onChange(opt.value)}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                    >
                        <Text style={[styles.label, selected && styles.labelSelected]}>
                            {opt.label}
                        </Text>
                    </Pressable>
                )
            })}
        </View>
    )
}

const createStyle = (colors: ThemeColors) => StyleSheet.create({
    track: {
        flexDirection: 'row',
        alignSelf: 'center',
        backgroundColor: colors.bgSubtle,
        borderRadius: radius.md,
        padding: 2,
    },
    segment: {
        flex: 1,
        minWidth: 56,
        minHeight: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radius.sm,
        paddingHorizontal: spacing.md,
    },
    segmentSelected: {
        backgroundColor: colors.card,
        shadowColor: colors.shadow,
        shadowOpacity: 0.12,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
    },
    label: {
        ...typography.label,
        color: colors.textMuted,
    },
    labelSelected: {
        color: colors.text,
        fontWeight: '600',
    },
});