import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';

interface PDFViewerProps {
  visible: boolean;
  onClose: () => void;
  pdfContent: string;
  title: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  visible,
  onClose,
  pdfContent,
  title,
}) => {
  const handleDownload = () => {
    Alert.alert(
      'Download PDF',
      'To download and view the PDF, you need to install additional packages:\n\n1. react-native-html-to-pdf\n2. react-native-fs\n3. react-native-pdf\n\nWould you like to see the installation instructions?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Show Instructions', 
          onPress: () => {
            Alert.alert(
              'Installation Instructions',
              'Run these commands in your project:\n\nnpm install react-native-html-to-pdf react-native-fs react-native-pdf\n\nThen rebuild your app to view PDFs.',
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  const handleShare = () => {
    Alert.alert(
      'Share PDF',
      'PDF sharing functionality will be available after installing the required packages.',
      [{ text: 'OK' }]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="x" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
              <Icon name="share-2" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDownload} style={styles.actionButton}>
              <Icon name="download" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* PDF Content Preview */}
        <View style={styles.content}>
          <View style={styles.pdfPreview}>
            <View style={styles.pdfHeader}>
              <Icon name="file-text" size={48} color={COLORS.primary} />
              <Text style={styles.pdfTitle}>PDF Preview</Text>
              <Text style={styles.pdfSubtitle}>
                This is a preview of the generated PDF content
              </Text>
            </View>
            
            <View style={styles.pdfContent}>
              <Text style={styles.contentText} numberOfLines={20}>
                {pdfContent.replace(/<[^>]*>/g, '')}
              </Text>
            </View>
            
            <View style={styles.pdfFooter}>
              <Text style={styles.footerText}>
                To view the full PDF, install the required packages
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.bottomActions}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleDownload}
          >
            <Icon name="download" size={20} color={COLORS.text.light} />
            <Text style={styles.primaryButtonText}>Install PDF Viewer</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={onClose}
          >
            <Text style={styles.secondaryButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    backgroundColor: COLORS.surface,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    fontFamily: 'System',
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  pdfPreview: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    shadowColor: COLORS.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pdfHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  pdfTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: SPACING.sm,
    fontFamily: 'System',
  },
  pdfSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
    fontFamily: 'System',
  },
  pdfContent: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  contentText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.primary,
    lineHeight: 20,
    fontFamily: 'System',
  },
  pdfFooter: {
    alignItems: 'center',
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  footerText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontFamily: 'System',
  },
  bottomActions: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  primaryButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.text.light,
    fontFamily: 'System',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  secondaryButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    fontFamily: 'System',
  },
});

export default PDFViewer;
