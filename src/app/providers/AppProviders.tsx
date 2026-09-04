import { toastConfig } from '@/core/ui/Toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            staleTime: 1000 * 30,
        }
    },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <KeyboardProvider>
            <SafeAreaProvider>
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                <Toast config={toastConfig} position='bottom' visibilityTime={2000} />
            </SafeAreaProvider>
        </KeyboardProvider>
    )
}