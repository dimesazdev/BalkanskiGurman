import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet
} from 'react-native';
import Button from './Button';
import Colors from '../constants/Colors';

type AlertProps = {
    visible: boolean;
    message: string;
    buttonText: string;
    onButtonClick: () => void;
    onClose: () => void;
    showCancel?: boolean;
    cancelText?: string;
};

const Alert = ({
    visible,
    message,
    buttonText,
    onButtonClick,
    onClose,
    showCancel = true,
    cancelText = 'Cancel',
}: AlertProps) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.alertBox}>
                    <Text style={styles.message}>{message}</Text>
                    <View style={styles.buttonBox}>
                        <Button variant="red" onPress={onButtonClick}>
                            {buttonText}
                        </Button>
                        {showCancel && (
                            <Button onPress={onClose}>{cancelText}</Button>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default Alert;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    alertBox: {
        backgroundColor: Colors.beige,
        borderRadius: 16,
        padding: 32,
        width: '80%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    message: {
        marginBottom: 24,
        fontSize: 20,
        textAlign: 'center',
        fontFamily: 'CormorantGaramond-Regular',
        color: Colors.black,
    },
    buttonBox: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    }
});