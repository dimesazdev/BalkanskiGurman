import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Pressable,
    FlatList,
    TouchableOpacity,
    Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';

export type Option = {
    label: string;
    value: string | number;
};

type FormSelectProps = {
    label?: string;
    value: string | number;
    onChange: (val: string | number) => void;
    options: Option[];
    placeholder: string;
};

const FormSelect: React.FC<FormSelectProps> = ({ label, value, onChange, options, placeholder }) => {
    const [visible, setVisible] = useState(false);

    const selectedLabel = options.find(opt => opt.value === value)?.label;

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            <Pressable style={styles.input} onPress={() => setVisible(true)}>
                <Text style={[styles.inputText, !selectedLabel && styles.placeholder]}>
                    {selectedLabel || placeholder}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={22} color="#000" style={styles.icon} />
            </Pressable>

            <Modal visible={visible} transparent animationType="fade">
                <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
                    <View style={styles.dropdown}>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => String(item.value)}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.option}
                                    onPress={() => {
                                        onChange(item.value);
                                        setVisible(false);
                                    }}
                                >
                                    <Text style={styles.optionText}>{item.label}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

export default FormSelect;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 16,
    },
    label: {
        ...Typography.label
    },
    input: {
        backgroundColor: Colors.beige,
        borderRadius: 20,
        height: 48,
        justifyContent: 'center',
        paddingHorizontal: 20,
        position: 'relative',
    },
    inputText: {
        fontSize: 16,
        fontFamily: 'CormorantGaramond-Regular',
        color: '#000',
    },
    placeholder: {
        color: '#666',
    },
    icon: {
        position: 'absolute',
        right: 16,
        justifyContent: 'center',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdown: {
        backgroundColor: Colors.beige,
        width: '80%',
        maxHeight: '50%',
        borderRadius: 16,
        paddingVertical: 12,
    },
    option: {
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    optionText: {
        fontSize: 16,
        fontFamily: 'CormorantGaramond-Regular',
        color: '#000',
    },
});