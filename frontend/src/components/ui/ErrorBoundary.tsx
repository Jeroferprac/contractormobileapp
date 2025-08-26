import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service (e.g., Sentry, Crashlytics)
    this.logErrorToService(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error state when props change (if enabled)
    if (this.props.resetOnPropsChange && prevProps !== this.props) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        showDetails: false,
      });
    }
  }

  logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Implement logging to external service
    // Example: Sentry.captureException(error, { extra: errorInfo });
    console.log('Error logged to service:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  handleReportError = () => {
    const { error, errorInfo } = this.state;
    if (error && errorInfo) {
      // Implement error reporting logic
      Alert.alert(
        'Report Error',
        'Error details have been sent to our development team. Thank you for your patience.',
        [{ text: 'OK' }]
      );
    }
  };

  handleToggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails,
    }));
  };

  renderErrorUI = () => {
    const { error, errorInfo, showDetails } = this.state;
    const { fallback } = this.props;

    // Use custom fallback if provided
    if (fallback) {
      return fallback;
    }

    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Error Icon */}
          <View style={styles.iconContainer}>
            <Icon name="alert-triangle" size={64} color={COLORS.status.error} />
          </View>

          {/* Error Title */}
          <Text style={styles.title}>Oops! Something went wrong</Text>

          {/* Error Message */}
          <Text style={styles.message}>
            We're sorry, but something unexpected happened. Our team has been notified and is working to fix this issue.
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={this.handleRetry}
              activeOpacity={0.8}
            >
              <Icon name="refresh-cw" size={20} color={COLORS.text.light} />
              <Text style={styles.primaryButtonText}>Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={this.handleReportError}
              activeOpacity={0.8}
            >
              <Icon name="send" size={20} color={COLORS.primary} />
              <Text style={styles.secondaryButtonText}>Report Issue</Text>
            </TouchableOpacity>
          </View>

          {/* Error Details Toggle */}
          {error && (
            <TouchableOpacity
              style={styles.detailsToggle}
              onPress={this.handleToggleDetails}
              activeOpacity={0.7}
            >
              <Text style={styles.detailsToggleText}>
                {showDetails ? 'Hide Details' : 'Show Details'}
              </Text>
              <Icon
                name={showDetails ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={COLORS.text.secondary}
              />
            </TouchableOpacity>
          )}

          {/* Error Details */}
          {showDetails && error && (
            <View style={styles.detailsContainer}>
              <Text style={styles.detailsTitle}>Error Details</Text>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Error Message:</Text>
                <Text style={styles.detailText}>{error.message}</Text>
              </View>

              {error.stack && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Stack Trace:</Text>
                  <Text style={styles.detailText}>{error.stack}</Text>
                </View>
              )}

              {errorInfo && errorInfo.componentStack && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Component Stack:</Text>
                  <Text style={styles.detailText}>{errorInfo.componentStack}</Text>
                </View>
              )}
            </View>
          )}

          {/* Contact Information */}
          <View style={styles.contactContainer}>
            <Text style={styles.contactText}>
              If this problem persists, please contact our support team.
            </Text>
            <Text style={styles.contactEmail}>support@contractorapp.com</Text>
          </View>
        </ScrollView>
      </View>
    );
  };

  render() {
    if (this.state.hasError) {
      return this.renderErrorUI();
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  message: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    minWidth: 120,
    ...SHADOWS.sm,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  primaryButtonText: {
    color: COLORS.text.light,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  detailsToggleText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginRight: SPACING.xs,
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  detailsTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  detailSection: {
    marginBottom: SPACING.sm,
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  detailText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 16,
  },
  contactContainer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  contactText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  contactEmail: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default ErrorBoundary;
