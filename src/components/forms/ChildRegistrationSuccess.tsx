import React from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Typography } from '../ui';
import { Colors, Sizes } from '../../utils/constants';

interface ChildRegistrationSuccessProps {
  childName: string;
  childId: string;
  onBackToHome: () => void;
}

export const ChildRegistrationSuccess: React.FC<ChildRegistrationSuccessProps> = ({
  childName,
  childId,
  onBackToHome,
}) => {
  const handleContactEmail = () => {
    Linking.openURL('mailto:comunicacao@vap-app.com.br');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Ícone de sucesso */}
      <View style={styles.iconContainer}>
        <View style={styles.successCircle}>
          <Ionicons name="checkmark" size={64} color={Colors.text.inverse} />
        </View>
      </View>

      {/* Título principal */}
      <Typography variant="h1" style={styles.title}>
        Cadastro Concluído!
      </Typography>

      <Typography variant="body" style={styles.subtitle}>
        Os dados de <Typography variant="body" style={styles.childName}>{childName}</Typography> foram salvos com sucesso no sistema.
      </Typography>

      {/* Card de informações */}
      <View style={styles.infoCard}>
        <Typography variant="h3" style={styles.cardTitle}>
          Informações do Cadastro
        </Typography>

        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={20} color={Colors.vapapp.teal} />
          <View style={styles.infoContent}>
            <Typography variant="caption" style={styles.infoLabel}>
              Nome da Criança
            </Typography>
            <Typography variant="subtitle" style={styles.infoValue}>
              {childName}
            </Typography>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="finger-print-outline" size={20} color={Colors.vapapp.teal} />
          <View style={styles.infoContent}>
            <Typography variant="caption" style={styles.infoLabel}>
              ID do Registro
            </Typography>
            <Typography variant="caption" style={styles.infoValue}>
              {childId}
            </Typography>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={20} color={Colors.vapapp.teal} />
          <View style={styles.infoContent}>
            <Typography variant="caption" style={styles.infoLabel}>
              Data do Cadastro
            </Typography>
            <Typography variant="subtitle" style={styles.infoValue}>
              {new Date().toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
          </View>
        </View>
      </View>

      {/* Próximos passos */}
      <View style={styles.nextStepsCard}>
        <Typography variant="h3" style={styles.cardTitle}>
          Próximos Passos
        </Typography>

        <View style={styles.stepItem}>
          <View style={styles.stepNumber}>
            <Typography variant="caption" style={styles.stepNumberText}>1</Typography>
          </View>
          <View style={styles.stepContent}>
            <Typography variant="subtitle" style={styles.stepTitle}>
              Dados Seguros
            </Typography>
            <Typography variant="body" style={styles.stepDescription}>
              As informações foram salvas de forma segura e criptografada em nosso sistema.
            </Typography>
          </View>
        </View>

        <View style={styles.stepItem}>
          <View style={styles.stepNumber}>
            <Typography variant="caption" style={styles.stepNumberText}>2</Typography>
          </View>
          <View style={styles.stepContent}>
            <Typography variant="subtitle" style={styles.stepTitle}>
              Acesso aos Recursos
            </Typography>
            <Typography variant="body" style={styles.stepDescription}>
              Agora você pode acessar todas as funcionalidades do VapApp para o acompanhamento da criança.
            </Typography>
          </View>
        </View>

        <View style={styles.stepItem}>
          <View style={styles.stepNumber}>
            <Typography variant="caption" style={styles.stepNumberText}>3</Typography>
          </View>
          <View style={styles.stepContent}>
            <Typography variant="subtitle" style={styles.stepTitle}>
              Suporte Contínuo
            </Typography>
            <Typography variant="body" style={styles.stepDescription}>
              Nossa equipe está disponível para ajudar em qualquer dúvida ou necessidade.
            </Typography>
          </View>
        </View>
      </View>

      {/* Card de atualização de dados */}
      <View style={styles.updateCard}>
        <View style={styles.updateHeader}>
          <Ionicons name="mail-outline" size={24} color={Colors.info} />
          <Typography variant="h3" style={styles.updateTitle}>
            Atualização de Dados
          </Typography>
        </View>

        <Typography variant="body" style={styles.updateDescription}>
          Caso precise atualizar ou corrigir alguma informação cadastrada, entre em contato conosco:
        </Typography>

        <View style={styles.emailContainer}>
          <Typography variant="subtitle" style={styles.emailLabel}>
            Email de Contato:
          </Typography>
          <Typography
            variant="subtitle"
            style={styles.emailAddress}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
          >
            comunicacao@vap-app.com.br
          </Typography>
        </View>

        <Button
          title="Enviar Email"
          onPress={handleContactEmail}
          variant="outline"
          style={styles.emailButton}
        />

        <Typography variant="caption" style={styles.updateNote}>
          Nossa equipe responderá em até 24 horas úteis.
        </Typography>
      </View>

      {/* Botão voltar ao portal */}
      <View style={styles.actionContainer}>
        <Button
          title="Voltar ao Portal"
          onPress={onBackToHome}
          variant="primary"
          fullWidth
          style={styles.backButton}
        />
      </View>

      {/* Agradecimento */}
      <View style={styles.thankYouContainer}>
        <Typography variant="body" style={styles.thankYouText}>
          Obrigado por confiar no VapApp para o cuidado da sua criança! 💚
        </Typography>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    paddingHorizontal: Sizes.spacing.lg,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: Sizes.spacing.xl,
    marginBottom: Sizes.spacing.lg,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  title: {
    textAlign: 'center',
    color: Colors.vapapp.teal,
    fontWeight: '700',
    marginBottom: Sizes.spacing.md,
  },
  subtitle: {
    textAlign: 'center',
    color: Colors.text.secondary,
    marginBottom: Sizes.spacing.xl,
    lineHeight: 24,
  },
  childName: {
    fontWeight: '600',
    color: Colors.vapapp.teal,
  },
  infoCard: {
    backgroundColor: Colors.background.card,
    borderRadius: Sizes.radius.lg,
    padding: Sizes.spacing.lg,
    marginBottom: Sizes.spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    color: Colors.vapapp.teal,
    fontWeight: '600',
    marginBottom: Sizes.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Sizes.spacing.md,
  },
  infoContent: {
    flex: 1,
    marginLeft: Sizes.spacing.sm,
  },
  infoLabel: {
    color: Colors.text.secondary,
    marginBottom: Sizes.spacing.xs,
  },
  infoValue: {
    color: Colors.text.primary,
    fontWeight: '500',
  },
  nextStepsCard: {
    backgroundColor: Colors.background.card,
    borderRadius: Sizes.radius.lg,
    padding: Sizes.spacing.lg,
    marginBottom: Sizes.spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Sizes.spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.vapapp.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.spacing.sm,
  },
  stepNumberText: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: Sizes.spacing.xs,
  },
  stepDescription: {
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  updateCard: {
    backgroundColor: Colors.info + '10',
    borderRadius: Sizes.radius.lg,
    borderWidth: 1,
    borderColor: Colors.info + '20',
    padding: Sizes.spacing.lg,
    marginBottom: Sizes.spacing.lg,
  },
  updateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.spacing.md,
  },
  updateTitle: {
    color: Colors.info,
    fontWeight: '600',
    marginLeft: Sizes.spacing.sm,
  },
  updateDescription: {
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: Sizes.spacing.md,
  },
  emailContainer: {
    backgroundColor: Colors.background.card,
    borderRadius: Sizes.radius.md,
    padding: Sizes.spacing.md,
    marginBottom: Sizes.spacing.md,
  },
  emailLabel: {
    color: Colors.text.secondary,
    marginBottom: Sizes.spacing.xs,
  },
  emailAddress: {
    color: Colors.vapapp.teal,
    fontWeight: '600',
    flexShrink: 1,
    numberOfLines: 1,
    adjustsFontSizeToFit: true,
    minimumFontScale: 0.8,
  },
  emailButton: {
    marginBottom: Sizes.spacing.md,
    borderColor: Colors.info,
  },
  updateNote: {
    color: Colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionContainer: {
    marginBottom: Sizes.spacing.lg,
  },
  backButton: {
    backgroundColor: Colors.vapapp.teal,
  },
  thankYouContainer: {
    alignItems: 'center',
    marginBottom: Sizes.spacing.xl,
  },
  thankYouText: {
    textAlign: 'center',
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
});