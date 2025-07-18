import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Modal,
    Pressable
} from 'react-native';
import Colors from '@/constants/Colors';

interface SortBarProps {
    label?: string;
    sortOptions: string[];
    selected: string;
    onSelect: (option: string) => void;
    t: (key: string) => string;
}

const SortBar: React.FC<SortBarProps> = ({ label = '', sortOptions, selected, onSelect, t }) => {
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View style={styles.container}>
            {label ? <Text style={styles.label}>{label}</Text> : null}

            <TouchableOpacity style={styles.selector} onPress={() => setModalVisible(true)}>
                <Text style={styles.selectorText}>{t(`sort.${selected}`)}</Text>
                <Text style={styles.arrow}>{modalVisible ? '▾' : '▸'}</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent animationType="fade">
                <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
                    <View style={styles.dropdown}>
                        <FlatList
                            data={sortOptions}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.option}
                                    onPress={() => {
                                        onSelect(item);
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.optionText}>{t(`sort.${item}`)}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

export default SortBar;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        minWidth: 150,
    },
    label: {
        color: Colors.beige,
        fontSize: 20,
        fontFamily: 'CormorantGaramond-Regular',
    },
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.beige,
        paddingHorizontal: 20,
        height: 48,
        borderRadius: 20,
        justifyContent: 'center',
    },
    selectorText: {
        fontSize: 18,
        color: '#2f2f2f',
        fontWeight: '600',
        fontFamily: 'CormorantGaramond-Regular',
    },
    arrow: {
        marginLeft: 10,
        fontSize: 16,
        color: '#2f2f2f',
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    dropdown: {
        backgroundColor: Colors.beige,
        borderRadius: 20,
        paddingVertical: 10,
        width: 200,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    option: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    optionText: {
        fontSize: 16,
        color: '#2f2f2f',
        textAlign: 'center',
        fontFamily: 'CormorantGaramond-Regular',
    },
});