import React from 'react';
import {
  View,
  Modal,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../../constants/spacing';
import { TYPOGRAPHY, TEXT_STYLES } from '../../../constants/typography';

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
  exporting: boolean;
  exportProgress: number;
  filteredTransfersCount: number;
  hasFilters: boolean;
}

const ExportModal: React.FC<ExportModalProps> = ({
  visible,
  onClose,
  onExportPDF,
  onExportCSV,
  exporting,
  exportProgress,
  filteredTransfersCount,
  hasFilters,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Export Transfers</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Icon name="x" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.exportDescription}>
              {hasFilters 
                ? `Export ${filteredTransfersCount} filtered transfers in your preferred format`
                : `Export all ${filteredTransfersCount} transfers in your preferred format`
              }
            </Text>

            {hasFilters && (
              <View style={styles.exportFilterNotice}>
                <Icon name="info" size={16} color={COLORS.primary} />
                <Text style={styles.exportFilterNoticeText}>
                  Exporting filtered results only
                </Text>
              </View>
            )}

                         {exporting && (
               <View style={styles.exportProgressContainer}>
                 <View style={styles.loadingSpinner}>
                   <Icon name="loader" size={20} color={COLORS.primary} />
                 </View>
                 <Text style={styles.exportProgressText}>
                   Exporting... {exportProgress}%
                 </Text>
                 <View style={styles.progressBar}>
                   <View style={[styles.progressFill, { width: `${exportProgress}%` }]} />
                 </View>
               </View>
             )}

            <TouchableOpacity
              style={[styles.exportOption, exporting && styles.exportOptionDisabled]}
              onPress={exporting ? undefined : onExportPDF}
            >
              <View style={styles.exportOptionIcon}>
                <Icon name="file-text" size={24} color="#EF4444" />
              </View>
              <View style={styles.exportOptionContent}>
                <Text style={styles.exportOptionTitle}>Export as PDF</Text>
                <Text style={styles.exportOptionSubtitle}>Professional document format with charts and summaries</Text>
              </View>
              <Icon name="chevron-right" size={20} color={COLORS.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.exportOption, exporting && styles.exportOptionDisabled]}
              onPress={exporting ? undefined : onExportCSV}
            >
              <View style={styles.exportOptionIcon}>
                <Icon name="file-text" size={24} color="#10B981" />
              </View>
              <View style={styles.exportOptionContent}>
                <Text style={styles.exportOptionTitle}>Export as CSV</Text>
                <Text style={styles.exportOptionSubtitle}>Spreadsheet compatible format for data analysis</Text>
              </View>
              <Icon name="chevron-right" size={20} color={COLORS.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text.primary,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  exportDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.text.secondary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  exportFilterNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  exportFilterNoticeText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginLeft: SPACING.sm,
    fontWeight: '500',
  },
  exportProgressContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderRadius: BORDER_RADIUS.md,
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  exportProgressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.secondary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    marginBottom: SPACING.md,
    backgroundColor: '#FFFFFF',
  },
  exportOptionDisabled: {
    opacity: 0.5,
  },
  exportOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  exportOptionContent: {
    flex: 1,
  },
  exportOptionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  exportOptionSubtitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
});

export default ExportModal;
