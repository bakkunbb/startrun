import { createToastConfig, } from '@/core/ui/Toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { ThemeProvider, useColors } from '../theme';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            staleTime: 1000 * 30,
        }
    },
});

function AppContent({ children }: { children: React.ReactNode }) {
    const colors = useColors();
    const toastConfig = useMemo(() => createToastConfig(colors), [colors]);

    return (
        <SafeAreaProvider>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            <Toast config={toastConfig} position='bottom' visibilityTime={2000} />
        </SafeAreaProvider>
    );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <KeyboardProvider>
                <AppContent>{children}</AppContent>
            </KeyboardProvider>
        </ThemeProvider>
    )
}