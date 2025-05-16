// ErrorModal.tsx
import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface ErrorModalProps {
  visible: boolean;
  onClose: () => void;
  message?: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ visible, onClose, message }) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Red sad face */}
          <Text style={styles.emoji}>😡</Text>

          <Text style={styles.title}>Սխալ</Text>
          <Text style={styles.message}>{message || "Ինչ-որ բան սխալ է գնացել։"}</Text>

          <TouchableOpacity onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>Փակել</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ErrorModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: '#d32f2f',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#d32f2f',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});
