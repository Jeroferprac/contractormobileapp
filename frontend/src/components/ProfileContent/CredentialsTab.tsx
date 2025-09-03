import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';
import { getCompanyService } from '../../services/serviceFactory';
import { CompanyCredential } from '../../services/companyService';

interface CredentialsTabProps {
  credentials?: CompanyCredential[];
}

export const CredentialsTab: React.FC<CredentialsTabProps> = ({ credentials: propCredentials }) => {
  const [credentials, setCredentials] = useState<CompanyCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propCredentials) {
      setCredentials(propCredentials);
      setLoading(false);
    } else {
      loadCredentials();
    }
  }, [propCredentials]);

  const loadCredentials = async () => {
    try {
      setLoading(true);
      setError(null);
      const companyService = getCompanyService();
      const credentialsData = await companyService.getCompanyCredentials();
      setCredentials(credentialsData);
    } catch (err: any) {
      console.error('❌ [CredentialsTab] Failed to load credentials:', err);
      setError(err.message || 'Failed to load credentials');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'expired':
        return '#F44336';
      case 'pending':
        return '#FF9800';
      default:
        return '#999999';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'expired':
        return 'Expired';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'license':
        return 'verified-user';
      case 'certification':
        return 'school';
      case 'accreditation':
        return 'stars';
      default:
        return 'description';
    }
  };

  const handleViewCredential = (credential: CompanyCredential) => {
    if (credential.document_url) {
      // You could implement document viewing here
      console.log('Viewing credential:', credential.title);
    } else {
      console.log('No document URL available for:', credential.title);
    }
  };

  const handleDownloadCredential = (credential: CompanyCredential) => {
    if (credential.document_url) {
      // You could implement document download here
      console.log('Downloading credential:', credential.title);
    } else {
      console.log('No document URL available for:', credential.title);
    }
  };

  const renderCredential = (credential: CompanyCredential) => (
    <View key={credential.id} style={styles.credentialCard}>
      <View style={styles.credentialHeader}>
        <View style={styles.credentialIcon}>
          <Icon 
            name={getTypeIcon(credential.type)} 
            size={24} 
            color="#FF6B35" 
          />
        </View>
        <View style={styles.credentialInfo}>
          <Text style={styles.credentialTitle}>{credential.title}</Text>
          <Text style={styles.credentialIssuer}>{credential.issuer}</Text>
        </View>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: getStatusColor(credential.status) }
        ]}>
          <Text style={styles.statusText}>{getStatusText(credential.status)}</Text>
        </View>
      </View>
      
      <View style={styles.credentialDetails}>
        <View style={styles.detailRow}>
          <Icon name="event" size={16} color="#666666" />
          <Text style={styles.detailText}>
            Issued: {new Date(credential.issue_date).toLocaleDateString()}
          </Text>
        </View>
        {credential.expiry_date && (
          <View style={styles.detailRow}>
            <Icon name="schedule" size={16} color="#666666" />
            <Text style={styles.detailText}>
              Expires: {new Date(credential.expiry_date).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.credentialActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleViewCredential(credential)}
        >
          <Icon name="visibility" size={16} color="#FF6B35" />
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDownloadCredential(credential)}
        >
          <Icon name="download" size={16} color="#FF6B35" />
          <Text style={styles.actionButtonText}>Download</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="verified-user" size={48} color="#CCCCCC" />
      <Text style={styles.emptyStateText}>No credentials yet</Text>
      <Text style={styles.emptyStateSubtext}>Add your company credentials and certifications to build trust</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading credentials...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error" size={48} color="#FF6B35" />
        <Text style={styles.errorText}>Failed to load credentials</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadCredentials}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {credentials.length > 0 ? (
          credentials.map(renderCredential)
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  credentialCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  credentialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  credentialIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  credentialInfo: {
    flex: 1,
  },
  credentialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  credentialIssuer: {
    fontSize: 14,
    color: '#666666',
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  credentialDetails: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  detailText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: SPACING.sm,
  },
  credentialActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF6B35',
    gap: SPACING.xs,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: SPACING.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6B35',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  retryButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF6B35',
    backgroundColor: '#FF6B35',
  },
  retryButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
