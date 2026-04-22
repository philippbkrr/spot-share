import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';
import { Button, Input, Card } from '../base';
import { Mail, Lock, User, ArrowRight } from 'lucide-react-native';

interface AuthScreenProps {
  onAuthSuccess?: () => void;
  onSwitchMode?: () => void;
}

type AuthMode = 'login' | 'signup';

export function AuthScreen({ onAuthSuccess, onSwitchMode }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!email || !password) {
      setError('Bitte alle Felder ausfüllen');
      return;
    }

    if (mode === 'signup' && !username) {
      setError('BitteUsername angeben');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              full_name: username,
            },
          },
        });
        if (error) throw error;
      }
      onAuthSuccess?.();
    } catch (e: any) {
      setError(e.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Logo / Brand */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>📍</Text>
          </View>
          <Text style={styles.title}>SpotShare</Text>
          <Text style={styles.subtitle}>
            {mode === 'login'
              ? 'Melde dich an, um Geheimtipps zu teilen'
              : 'Erstelle deinen Account und teile Geheimtipps'}
          </Text>
        </View>

        {/* Form */}
        <Card style={styles.formCard} elevated>
          {mode === 'signup' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <View style={styles.inputWrapper}>
                <User size={18} color={colors.textMuted} style={styles.inputIcon} />
                <Input
                  placeholder="Dein Username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  containerStyle={styles.input}
                />
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>E-Mail</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color={colors.textMuted} style={styles.inputIcon} />
              <Input
                placeholder="deine@email.de"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                containerStyle={styles.input}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Passwort</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color={colors.textMuted} style={styles.inputIcon} />
              <Input
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                containerStyle={styles.input}
              />
            </View>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Button
            title={mode === 'login' ? 'Anmelden' : 'Account erstellen'}
            onPress={handleSubmit}
            loading={loading}
            icon={<ArrowRight size={18} color="#fff" />}
            style={styles.submitButton}
          />
        </Card>

        {/* Switch Mode */}
        <View style={styles.switchContainer}>
          <Text style={styles.switchText}>
            {mode === 'login' ? 'Noch kein Account?' : 'Bereits registriert?'}
          </Text>
          <TouchableOpacity onPress={() => {
            setMode(mode === 'login' ? 'signup' : 'login');
            setError(null);
          }}>
            <Text style={styles.switchLink}>
              {mode === 'login' ? 'Sign Up' : 'Login'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[6],
    justifyContent: 'center',
    gap: spacing[6],
  },
  header: {
    alignItems: 'center',
    gap: spacing[3],
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  logoEmoji: {
    fontSize: 36,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  formCard: {
    gap: spacing[4],
  },
  inputGroup: {
    gap: spacing[2],
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: spacing[4],
    zIndex: 1,
  },
  input: {
    flex: 1,
    paddingLeft: spacing[10],
  },
  errorContainer: {
    backgroundColor: colors.error + '15',
    padding: spacing[3],
    borderRadius: borderRadius.sm,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: spacing[2],
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[2],
  },
  switchText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  switchLink: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[500],
  },
});