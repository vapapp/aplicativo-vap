import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Typography } from '../ui';
import { Colors, Sizes } from '../../utils/constants';

interface SUSHelpModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const SUSHelpModal: React.FC<SUSHelpModalProps> = ({
  visible,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Typography variant="h3" style={styles.title}>
              Cartão do SUS
            </Typography>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.neutral[500]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Typography variant="body" style={styles.description}>
              O Cartão Nacional de Saúde (CNS) é um documento que identifica o usuário no SUS.
            </Typography>

            <View style={styles.infoSection}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="location-outline" size={18} color={Colors.vapapp.teal} />
                <Typography variant="subtitle" style={styles.sectionTitle}>
                  Onde encontrar:
                </Typography>
              </View>
              <Typography variant="body" style={styles.sectionText}>
                • São 15 dígitos na frente do cartão
              </Typography>
              <Typography variant="body" style={styles.sectionText}>
                • Exemplo: 123 4567 8901 2345
              </Typography>
            </View>

            <View style={styles.imageSection}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="card-outline" size={18} color={Colors.vapapp.teal} />
                <Typography variant="subtitle" style={styles.sectionTitle}>
                  Exemplo do cartão:
                </Typography>
              </View>
              <View style={styles.imageContainer}>
                <Image
                  source={require('../../assets/images/guides/cartao-sus-exemplo.png')}
                  style={styles.susCardImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            <View style={styles.infoSection}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="help-circle-outline" size={18} color={Colors.vapapp.teal} />
                <Typography variant="subtitle" style={styles.sectionTitle}>
                  Não tem o cartão?
                </Typography>
              </View>
              <Typography variant="body" style={styles.sectionText}>
                • Procure uma Unidade Básica de Saúde (UBS)
              </Typography>
              <Typography variant="body" style={styles.sectionText}>
                • Leve RG, CPF e comprovante de residência
              </Typography>
              <Typography variant="body" style={styles.sectionText}>
                • O cartão é gratuito e feito na hora
              </Typography>
            </View>

            <View style={styles.importantBox}>
              <Ionicons name="information-circle" size={20} color={Colors.vapapp.teal} />
              <Typography variant="caption" style={styles.importantText}>
                <Typography variant="caption" style={styles.importantBold}>
                  Importante:
                </Typography>
                {' '}Se você não tem o cartão ou não lembra o número, pode deixar em branco por enquanto e completar depois.
              </Typography>
            </View>

            <Button
              title="Entendi, fechar"
              onPress={onClose}
              fullWidth
              style={styles.closeModalButton}
            />
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 0,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    padding: 20,
    maxHeight: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  infoSection: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  sectionText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 18,
  },
  closeModalButton: {
    backgroundColor: Colors.vapapp.teal,
    marginTop: 16,
  },
  imageSection: {
    marginBottom: 16,
  },
  imageContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  susCardImage: {
    width: screenWidth * 0.7,
    height: (screenWidth * 0.7) * 0.6,
    borderRadius: 8,
  },
  importantBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.vapapp.teal + '10',
    borderLeftWidth: 3,
    borderLeftColor: Colors.vapapp.teal,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  importantText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: '#374151',
    lineHeight: 16,
  },
  importantBold: {
    fontWeight: '600',
    color: Colors.vapapp.teal,
  },
});