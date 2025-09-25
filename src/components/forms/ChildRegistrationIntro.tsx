import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Typography } from '../ui';
import { Colors, Sizes } from '../../utils/constants';

interface ChildRegistrationIntroProps {
  onStart: () => void;
  onCancel: () => void;
}

export const ChildRegistrationIntro: React.FC<ChildRegistrationIntroProps> = ({
  onStart,
  onCancel,
}) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Título */}
      <Typography variant="h1" style={styles.title}>
        Prezado responsável
      </Typography>

      {/* Mensagem de sensibilização */}
      <View style={styles.messageSection}>
        <Typography variant="body" style={styles.highlightText}>
          Você sabia que muitas crianças traqueostomizadas permanecem "invisíveis" diante do Estado, pela total falta de dados oficiais que informem a sua situação?
        </Typography>

        <Typography variant="body" style={styles.bodyText}>
          Sabia também que a falta de políticas públicas para atendimento dessas crianças, está diretamente relacionada a isso?
        </Typography>
      </View>

      {/* Seção de oportunidade */}
      <View style={styles.opportunitySection}>
        <View style={styles.opportunityHeader}>
          <Ionicons name="star-outline" size={24} color={Colors.vapapp.teal} />
          <Typography variant="h2" style={styles.opportunityTitle}>
            Uma oportunidade de mudança
          </Typography>
        </View>

        <Typography variant="body" style={styles.bodyText}>
          Nesse momento você terá a grande oportunidade de mudar essa situação, fazendo parte de uma importante <Typography variant="body" style={styles.boldText}>corrente do bem</Typography>.
        </Typography>

        <Typography variant="body" style={styles.bodyText}>
          Essa corrente é formada por pessoas que, assim como você, sentem na pele o desafio que é cuidar de uma criança com traqueostomia, que traz consigo desafios, muitas vezes quase impossíveis de serem vencidos.
        </Typography>
      </View>

      {/* Nosso convite */}
      <View style={styles.invitationSection}>
        <View style={styles.invitationHeader}>
          <Ionicons name="people-outline" size={24} color={Colors.vapapp.teal} />
          <Typography variant="h2" style={styles.invitationTitle}>
            Nosso convite
          </Typography>
        </View>

        <Typography variant="body" style={styles.bodyText}>
          Convidamos você a compartilhar aqui, <Typography variant="body" style={styles.boldText}>uma única vez</Typography>, informações referentes à sua criança traqueostomizada, de modo a ampliar os registros já lançados aqui por outras famílias.
        </Typography>

        <Typography variant="body" style={styles.bodyText}>
          Desse modo, todos de nossa equipe técnica terão a oportunidade de empreender esforços no sentido de montar um <Typography variant="body" style={styles.boldText}>Banco de Dados</Typography> que permita buscar junto ao Poder Público, mais ajuda, mais apoio, e a implementação de mais ações que visem ampliar o acolhimento e os cuidados destinados às crianças com traqueostomia, existentes em cada canto do Brasil, trazendo mais conforto e segurança para elas e as suas famílias.
        </Typography>
      </View>

      {/* Chamada para ação */}
      <View style={styles.callToActionSection}>
        <Typography variant="h2" style={styles.callToActionTitle}>
          Vamos juntos nessa missão!
        </Typography>

        <Typography variant="body" style={styles.callToActionText}>
          Ajude-nos nessa valorosa missão! Juntos poderemos melhorar cada vez mais esse cenário de total invisibilidade de crianças como a sua!
        </Typography>

        <View style={styles.embraceContainer}>
          <Ionicons name="heart" size={20} color={Colors.vapapp.teal} />
          <Typography variant="body" style={styles.embraceText}>
            Receba um fraterno abraço de nossa equipe!
          </Typography>
        </View>
      </View>



      {/* Nota importante */}
      <View style={styles.noteContainer}>
        <Ionicons name="information-circle-outline" size={20} color={Colors.info} />
        <Typography variant="caption" style={styles.noteText}>
          <Typography variant="caption" style={[styles.noteText, { fontWeight: '600' }]}>
            Importante:{' '}
          </Typography>
          Tenha em mãos o cartão SUS da criança e informações médicas básicas para facilitar o preenchimento.
        </Typography>
      </View>

      {/* Botões de ação */}
      <View style={styles.buttonsContainer}>
        <Button
          title="Fazer Parte Dessa Corrente do Bem"
          onPress={onStart}
          variant="primary"
          fullWidth
          style={styles.startButton}
        />
        <Button
          title="Voltar"
          onPress={onCancel}
          variant="outline"
          fullWidth
        />
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
  title: {
    textAlign: 'center',
    color: Colors.vapapp.teal,
    fontWeight: '700',
    marginTop: Sizes.spacing.xl,
    marginBottom: Sizes.spacing.lg,
  },
  messageSection: {
    backgroundColor: Colors.vapapp.teal + '10',
    borderRadius: Sizes.radius.lg,
    padding: Sizes.spacing.lg,
    marginBottom: Sizes.spacing.lg,
    borderWidth: 2,
    borderColor: Colors.vapapp.teal + '30',
  },
  highlightText: {
    color: Colors.vapapp.teal,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Sizes.spacing.md,
  },
  bodyText: {
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Sizes.spacing.md,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.vapapp.teal,
  },
  opportunitySection: {
    backgroundColor: Colors.vapapp.teal + '10',
    borderRadius: Sizes.radius.lg,
    padding: Sizes.spacing.lg,
    marginBottom: Sizes.spacing.lg,
    borderWidth: 2,
    borderColor: Colors.vapapp.teal + '30',
  },
  opportunityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.spacing.md,
  },
  opportunityTitle: {
    color: Colors.vapapp.teal,
    fontWeight: '700',
    marginLeft: Sizes.spacing.sm,
    fontSize: 20,
  },
  invitationSection: {
    backgroundColor: Colors.vapapp.teal + '10',
    borderRadius: Sizes.radius.lg,
    padding: Sizes.spacing.lg,
    marginBottom: Sizes.spacing.lg,
    borderWidth: 2,
    borderColor: Colors.vapapp.teal + '30',
  },
  invitationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.spacing.md,
  },
  invitationTitle: {
    color: Colors.vapapp.teal,
    fontWeight: '700',
    marginLeft: Sizes.spacing.sm,
    fontSize: 20,
  },
  callToActionSection: {
    backgroundColor: Colors.vapapp.teal + '10',
    borderRadius: Sizes.radius.lg,
    padding: Sizes.spacing.lg,
    marginBottom: Sizes.spacing.lg,
    borderWidth: 2,
    borderColor: Colors.vapapp.teal + '30',
  },
  callToActionTitle: {
    color: Colors.vapapp.teal,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Sizes.spacing.md,
    fontSize: 20,
  },
  callToActionText: {
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Sizes.spacing.lg,
  },
  embraceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.card,
    borderRadius: Sizes.radius.md,
    padding: Sizes.spacing.md,
  },
  embraceText: {
    color: Colors.text.primary,
    fontWeight: '600',
    marginLeft: Sizes.spacing.sm,
    fontStyle: 'italic',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.info + '10',
    borderRadius: Sizes.radius.md,
    padding: Sizes.spacing.md,
    marginBottom: Sizes.spacing.xl,
  },
  noteText: {
    flex: 1,
    marginLeft: Sizes.spacing.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  buttonsContainer: {
    gap: Sizes.spacing.md,
    marginBottom: Sizes.spacing.xl,
  },
  startButton: {
    backgroundColor: Colors.vapapp.teal,
  },
});