import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, layout, radius, spacing, typography } from "@/app/theme";

type Props = {
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            {description ? <Text style={styles.description}>{description}</Text> : null}
            {actionLabel && onAction ? (
                <Pressable
                    style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
                    onPress={onAction}
                >
                    <Text style={styles.actionText}>{actionLabel}</Text>
                </Pressable>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
        gap: spacing.sm,
    },
    title: {
        ...typography.subtitle,
        color: colors.text,
        textAlign: 'center',
    },
    description: {
        ...typography.label,
        color: colors.textMuted,
        textAlign: 'center',
        maxWidth: 280,
    },
    action: {
        marginTop: spacing.md,
        minHeight: layout.minTouchSize,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.md,
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionPressed: {
        backgroundColor: colors.accentPressed,
    },
    actionText: {
        ...typography.button,
        color: colors.textInverse,
    },
});
