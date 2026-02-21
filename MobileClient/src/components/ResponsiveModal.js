import React from 'react';
import { Modal, View, Platform, StyleSheet } from 'react-native';

const ResponsiveModal = ({ visible, children, onRequestClose, animationType = 'slide', transparent = true, ...props }) => {
    if (Platform.OS === 'web') {
        if (!visible) return null;
        return (
            <View style={styles.webModalOverlay}>
                <View style={styles.webModalContent}>
                    {children}
                </View>
            </View>
        );
    }

    return (
        <Modal
            visible={visible}
            onRequestClose={onRequestClose}
            animationType={animationType}
            transparent={transparent}
            {...props}
        >
            {children}
        </Modal>
    );
};

const styles = StyleSheet.create({
    webModalOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1000,
        overflow: 'hidden',
        // Ensure it sits on top of everything else in the "phone" container
    },
    webModalContent: {
        flex: 1,
    }
});

export default ResponsiveModal;
