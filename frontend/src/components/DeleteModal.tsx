import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';

// --- PROPS INTERFACE ---
interface DeleteModalProps {
  visible: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
}

// --- SVG ICON COMPONENTS ---

const ConfirmationIcon = () => (
    <Svg width="80" height="80" viewBox="0 0 80 80">
        <G fill="none" fillRule="evenodd">
            <Circle fill="#FDECEC" cx="40" cy="40" r="40"/>
            <G stroke="#C81E1E" strokeWidth="2" strokeLinecap="round">
                <Path d="M52.4 56.8H27.6c-1.8 0-3.3-1.4-3.4-3.2l-2-24.8c-.1-1.8 1.3-3.3 3-3.3h26.4c1.7 0 3.1 1.5 3 3.3l-2 24.8c-.1 1.8-1.6 3.2-3.4 3.2zM32.8 25.5V22c0-1.8 1.4-3.2 3.2-3.2h8c1.8 0 3.2 1.4 3.2 3.2v3.5"/>
            </G>
        </G>
    </Svg>
);

const DeletingIcon = () => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: -1, duration: 800, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ])
    ).start();
     Animated.loop(
      Animated.sequence([
        Animated.timing(translateAnim, { toValue: -2, duration: 600, useNativeDriver: true }),
        Animated.timing(translateAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const lidRotation = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-15deg', '5deg'],
  });

  return (
    <Animated.View style={{ transform: [{ translateY: translateAnim }] }}>
        <Svg width="80" height="80" viewBox="0 0 80 80">
            <G fill="none" fillRule="evenodd">
                <Circle fill="#F0F4FF" cx="40" cy="40" r="40"/>
                <G transform="translate(15 18)">
                    <Animated.View style={{ transform: [{ translateX: 13 }, { rotate: lidRotation }], transformOrigin: '24px 25px' }}>
                      <Path d="M28 25v-3h2v3h-2z" fill="#F472B6" />
                    </Animated.View>
                    <Animated.View style={{ transform: [{ translateX: -4}, { rotate: lidRotation }], transformOrigin: '24px 25px' }}>
                      <Path d="M28 25h24v2H28z" fill="#F472B6" />
                    </Animated.View>
                    <Path d="M36 48a2 2 0 104 0h-4zm-6-20l-1-1.7c-.5.3-1 .8-1 1.7h2zm14 0h2c0-.9-.5-1.4-1-1.7L44 28z" fill="#3B82F6"/>
                    <Path d="M26 31h28v-2H26v2zm-2 2l3 24h-2l-3-24h2zm27 24l3-24h-2l-3 24h2zm5-26a1 1 0 10-2 0h2zM25 31a1 1 0 10-2 0h2zm6 2l-1 1.7 1.8.9.2-.9-1-1.7zm11.8 1.7l1 1.7 1-1.7-.2-.9-1.8.9zM30 33l3 24h2l-3-24h-2zm17 24l3-24h-2l-3 24h2z" fill="#A4C3F3"/>
                    <Path d="M35 48a1 1 0 002 0h-2zm-5-10a1 1 0 10-2 0h2zm12 0a1 1 0 10-2 0h2z" fill="#FFF"/>
                </G>
            </G>
        </Svg>
    </Animated.View>
  );
};

const SuccessIcon = () => {
    const checkmarkAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(checkmarkAnim, {
            toValue: 1,
            duration: 1000,
            delay: 200,
            useNativeDriver: true,
        }).start();
    }, []);

    const strokeDashoffset = checkmarkAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [100, 0],
    });

    return (
        <Svg width="80" height="80" viewBox="0 0 80 80">
            <G fill="none" fillRule="evenodd">
                <Circle fill="#E7F7EF" cx="40" cy="40" r="40"/>
                <Path 
                    d="M28 41.3l8.6 8.6L52 34" 
                    stroke="#0E9F6E" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    strokeDasharray="100"
                    strokeDashoffset={strokeDashoffset}
                />
            </G>
        </Svg>
    );
};

// --- MAIN DELETE MODAL COMPONENT ---

const DeleteModal: React.FC<DeleteModalProps> = ({
  visible,
  isDeleting,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  itemName,
}) => {
  const [stage, setStage] = useState<'confirm' | 'deleting' | 'success'>('confirm');
  const modalAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setStage('confirm');
      Animated.timing(modalAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);
  
  useEffect(() => {
    if (isDeleting) {
      setStage('deleting');
    } else if (stage === 'deleting' && !isDeleting) {
      setStage('success');
      setTimeout(() => {
        onClose(); 
      }, 1500); // Auto-close after success
    }
  }, [isDeleting, stage]);


  const modalOpacity = modalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const modalScale = modalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.modalContainer, { opacity: modalOpacity, transform: [{ scale: modalScale }] }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} disabled={stage !== 'confirm'}>
             <Text style={{fontSize: 20, color: '#9CA3AF'}}>✕</Text>
          </TouchableOpacity>
          
          {/* Confirmation Stage */}
          {stage === 'confirm' && (
            <>
              <ConfirmationIcon />
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>
                {message}
                {itemName && <Text style={{fontWeight: 'bold'}}> "{itemName}"</Text>}
              </Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={onConfirm}>
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Deleting Stage */}
          {stage === 'deleting' && (
             <>
              <DeletingIcon />
              <Text style={styles.title}>Deleting...</Text>
              <Text style={styles.message}>Please wait while we remove the item.</Text>
            </>
          )}

          {/* Success Stage */}
          {stage === 'success' && (
             <>
              <SuccessIcon />
              <Text style={styles.title}>Deleted Successfully</Text>
              <Text style={styles.message}>The item has been removed.</Text>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#DC2626',
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default DeleteModal;
