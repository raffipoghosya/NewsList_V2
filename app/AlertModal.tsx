import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image, ViewStyle } from 'react-native';
import { scale, verticalScale } from './utils/scale';

interface AlertModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
  image?: React.ReactNode;
  containerStyle?: ViewStyle;
}

const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  onClose,
  title = 'Alert',
  buttonText = 'OK',
  image,
  containerStyle,
}) => {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, containerStyle]}>
          <Text style={styles.title}>{title}</Text>
          {image}
          <TouchableOpacity onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AlertModal;

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
    marginHorizontal: scale(12),
    color: '#1B90A2',
    textAlign: 'center',
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
