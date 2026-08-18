import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

type BannerTone = 'info' | 'warning' | 'danger';

type Props = {
    tone?: BannerTone;
    title?: string,
    lines?: string[],
    children?: ReactNode;
}

export function Banner({ tone = 'warning', title, lines, children }: Props) {
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

const styles = StyleSheet.create({
    base: { borderRadius: 12, borderLeftWidth: 3, padding: 16, gap: 4, marginBottom: 12, marginHorizontal: 16 },
    info: { backgroundColor: '#EEF4FF', borderLeftColor: '#3B6FD4' },
    warning: { backgroundColor: '#FFF7E6', borderLeftColor: '#D98B00' },
    danger: { backgroundColor: '#FEECEC', borderLeftColor: '#D14343' },
    title: { fontWeight: '600' },
    line: { fontSize: 13, lineHeight: 18 },
    actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
});