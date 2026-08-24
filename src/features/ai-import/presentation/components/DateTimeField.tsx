import { colors, layout } from "@/app/theme";
import { formatDatetime } from "@/core/utils/format";
import RNDateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
    label: string;
    value: Date;
    onChange: (next: Date) => void;
    uncertain?: boolean;
};

export function DateTimeField({ label, value, onChange, uncertain }: Props) {
    const [iosOpen, setIosOpen] = useState(false);

    const openAdnroid = () => {
        DateTimePickerAndroid.open({
            value,
            mode: 'date',
            onChange: (_, date) => {
                if (!date) return;
                DateTimePickerAndroid.open({
                    value: date,
                    mode: 'time',
                    is24Hour: true,
                    onChange: (__, time) => {
                        if (!time) return;
                        const merged = new Date(date);
                        merged.setHours(time.getHours(), time.getMinutes(), 0, 0);
                        onChange(merged);
                    }
                });
            }
        });
    };

    return (
        <View>
            <View style={styles.row}>
                <Text style={styles.label}>{label}</Text>
                <Pressable
                    style={({ pressed }) => [
                        styles.value,
                        uncertain && styles.uncertain,
                        pressed && styles.pressed,
                    ]}
                    onPress={() => (Platform.OS === 'android' ? openAdnroid() : setIosOpen((v) => !v))}>
                    <Text style={styles.valueText}>{formatDatetime(value)}</Text>
                </Pressable>
                <Text style={styles.unit} />
            </View>
            {Platform.OS === 'ios' && iosOpen ? (
                <RNDateTimePicker
                    value={value}
                    mode="datetime"
                    textColor={colors.text}
                    display="spinner"
                    locale="ko-KR"
                    onValueChange={(_, date) => {
                        if (date) onChange(date);
                    }}
                />
            ) : null}
        </View>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: layout.minTouchSize,
        gap: 8,
    },
    label: {
        width: layout.formLabelWidth,
        fontSize: 15,
        color: colors.textMuted,
    },
    value: {
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        backgroundColor: colors.card,
    },
    valueText: {
        fontSize: 18,
        color: colors.text,
    },
    uncertain: {
        borderColor: colors.warning,
        backgroundColor: colors.warningSubtle,
    },
    pressed: {
        backgroundColor: colors.bgSubtle,
    },
    unit: {
        width: layout.formUnitWidth,
    },
});