import { colors, layout } from '@/app/theme';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { KeyboardTypeOptions } from 'react-native';

type FieldProps = {
    label: string;
    unit?: string;
    value: string;
    onChangeText: (text: string) => void;
    keyboardType?: KeyboardTypeOptions;
    placeholder?: string;
    multiline?: boolean;
    invalid?: boolean;    // 파싱 실패
    uncertain?: boolean;  // lowConfidenceFields
    hint?: string;        // invalid일 때 보여줄 안내
};

export function Field({
    label, unit, value, onChangeText, keyboardType,
    placeholder, multiline, invalid, uncertain, hint,
}: FieldProps) {
    return (
        <View>
            <View style={styles.row}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                    style={[
                        styles.input,
                        multiline && styles.multiline,
                        uncertain && styles.uncertain,
                        invalid && styles.invalid,
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textDisabled}
                    multiline={multiline}
                    selectTextOnFocus={!multiline}
                    textAlignVertical={multiline ? 'top' : 'center'}
                />
                <Text style={styles.unit}>{unit ?? ''}</Text>
            </View>
            {invalid && hint ? <Text style={styles.hint}>{hint}</Text> : null}
        </View>
    );
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
    input: {
        flex: 1,
        fontSize: 18,
        color: colors.text,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        backgroundColor: colors.card,
    },
    multiline: {
        minHeight: 72,
        paddingTop: 8,
    },
    uncertain: {
        borderColor: colors.warning,
        backgroundColor: colors.warningSubtle,
    },
    invalid: {
        borderColor: colors.danger,
        backgroundColor: colors.dangerSubtle,
    },
    unit: {
        width: layout.formUnitWidth,
        fontSize: 15,
        color: colors.textMuted,
    },
    hint: {
        marginLeft: layout.formLabelWidth + 8,   // label + gap
        marginBottom: 6,
        fontSize: 13,
        color: colors.danger,
    },
});