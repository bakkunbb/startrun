import { ThemeColors, useStyles } from "@/app/theme";
import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

type BannerTone = 'info' | 'warning' | 'danger';

type Props = {
    tone?: BannerTone;
    title?: string,
    lines?: string[],
    children?: ReactNode;
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    base: { borderRadius: 12, borderLeftWidth: 3, padding: 16, gap: 4, marginBottom: 12, marginHorizontal: 16 },
    info: { backgroundColor: colors.accentSubtle, borderLeftColor: colors.accent },
    warning: { backgroundColor: colors.warningSubtle, borderLeftColor: colors.warning },
    danger: { backgroundColor: colors.dangerSubtle, borderLeftColor: colors.danger },
    title: { fontSize: 15, fontWeight: '600' },
    line: { fontSize: 14, lineHeight: 19 },
    actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
});

export function Banner({ tone = 'warning', title, lines, children }: Props) {
    const styles = useStyles(createStyles);

    return (
        <View style={[styles.base, styles[tone]]}>
            <Text style={styles.title}>{title}</Text>
            {lines?.map((line) => (
                <Text key={line} style={styles.line}>· {line}</Text>
            ))}
            {children ? <View style={styles.actions}>{children}</View> : null}
        </View>
    );
}