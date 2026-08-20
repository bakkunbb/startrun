import { useEffect, useRef, useState } from "react";
import { useUpdateNote } from "../hooks/useUpdateNote";
import { Alert, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export function NoteEditor({ id, activityNote }: { id: string; activityNote: string | undefined }) {
    const updateNote = useUpdateNote();
    const [note, setNote] = useState(activityNote ?? '');

    const [justSaved, setJustSaved] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

    const dirty = note.trim() !== (activityNote ?? '');
    const disabled = !dirty || updateNote.isPending;

    const onSave = () => {
        Keyboard.dismiss()
        updateNote.mutate(
            { id, note },
            {
                onSuccess: () => {
                    setJustSaved(true);
                    if (timer.current) clearTimeout(timer.current);
                    timer.current = setTimeout(() => setJustSaved(false), 1800);
                },
                onError: () => {
                    Alert.alert('내용을 수정하지 못했습니다.', '잠시 후 다시 시도해주세요.')
                }
            }
        )
    }

    return (
        <View>
            <Text>메모</Text>
            <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="내용을 입력하세요"
                multiline={true}
                selectTextOnFocus={false}
                textAlignVertical="top" />
            <Pressable
                style={({ pressed }) => [
                    styles.noteButton,
                    justSaved && styles.noteButtonDone,
                    disabled && !justSaved && styles.noteButtonOff,
                    pressed && styles.pressed,
                ]}
                disabled={disabled}
                onPress={onSave}
            >
                <Text style={[styles.noteButtonText, disabled && !justSaved && styles.noteButtonTextOff]}>
                    {updateNote.isPending ? '저장 중…' : justSaved ? '저장됨' : '저장'}
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    noteButton: {
        alignSelf: 'flex-end',
        minWidth: 88,
        height: 40,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1D4ED8',
    },
    noteButtonDone: { backgroundColor: '#0F9D58' },
    noteButtonOff: { backgroundColor: '#F3F4F6' },
    pressed: { opacity: 0.85 },
    noteButtonText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
    noteButtonTextOff: { color: '#9CA3AF' },
});