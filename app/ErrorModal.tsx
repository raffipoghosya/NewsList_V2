// ErrorModal.tsx
import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import WrongPassWord from "../assets/images/wrongPassword.svg";
import { scale, verticalScale } from './utils/scale';

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
          <Text style={styles.title}>ՍԽԱԼ ԾԱԾԿԱԳԻՐ</Text>
          <WrongPassWord width={120} height={60} />
          <TouchableOpacity onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>Փորձել կրկին</Text>
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
    borderRadius: scale(30),
    paddingTop: verticalScale(44),
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  title: {
    fontSize: scale(42),
    fontWeight: '400',
    marginBottom: verticalScale(39),
    color: '#1B90A2',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1B90A2',
    paddingVertical: verticalScale(34),
    paddingHorizontal: 20,
    borderBottomLeftRadius: scale(30),
    borderBottomRightRadius: scale(30),
    width: '100%',
    marginTop: verticalScale(65),
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: scale(38),
    fontWeight: '400',
  },
});
