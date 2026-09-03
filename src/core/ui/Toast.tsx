import { colors, layout, radius, typography } from "@/app/theme";
import { BaseToast, ErrorToast } from "react-native-toast-message";

export const toastConfig = {
    success: (props: any) => (
        <BaseToast
            {...props}
            style={{
                backgroundColor: colors.bg,
                borderLeftColor: colors.success,
                height: layout.toastHeight,
                borderRadius: radius.md,
            }}
            text1Style={{ ...typography.label, color: colors.text }}
        />
    ),
    error: (props: any) => (
        <ErrorToast
            {...props}
            style={{
                backgroundColor: colors.bg,
                borderLeftColor: colors.danger,
                height: layout.toastHeight,
                borderRadius: radius.md,
            }}
            text1Style={{ ...typography.label, color: colors.text }}
        />
    ),
};