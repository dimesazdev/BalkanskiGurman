import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import * as ImagePickerLib from 'expo-image-picker';
import Button from './Button';

type ImageType = {
    file: {
        uri: string;
        name: string;
        type: string;
    };
    url: string;
};

type ImagePickerProps = {
    images: ImageType[];
    setImages: React.Dispatch<React.SetStateAction<ImageType[]>>;
    maxImages?: number;
    onInvalid?: () => void;
    style?: any;
};

const ImagePicker: React.FC<ImagePickerProps> = ({
    images,
    setImages,
    maxImages = 3,
    onInvalid,
    style
}) => {
    const { t } = useTranslation();
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const isValidImage = (uri: string) => {
        return uri.endsWith('.png') || uri.endsWith('.jpg') || uri.endsWith('.jpeg');
    };

    const pickImages = async () => {
        const result = await ImagePickerLib.launchImageLibraryAsync({
            mediaTypes: ImagePickerLib.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: maxImages - images.length,
            quality: 1,
        });

        if (!result.canceled) {
            const selected = result.assets
                .filter((asset) => isValidImage(asset.uri))
                .map((asset) => ({
                    file: {
                        uri: asset.uri,
                        name: asset.fileName || 'image.jpg',
                        type: asset.type || 'image/jpeg',
                    },
                    url: asset.uri,
                }));

            if (selected.length + images.length > maxImages) return;
            setImages([...images, ...selected]);
        } else {
            onInvalid?.();
        }
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        setActiveIndex(null);
    };

    return (
        <View style={[styles.container, style]}>
            {images.map((img, index) => (
                <Pressable
                    key={index}
                    style={styles.imageWrapper}
                    onPress={() =>
                        setActiveIndex((prev) => (prev === index ? null : index))
                    }
                >
                    <Image source={{ uri: img.url }} style={styles.image} />

                    {activeIndex === index && (
                        <View style={styles.overlay}>
                            <Button
                                variant="red-small"
                                onPress={() => removeImage(index)}
                                style={styles.removeBtn}
                            >
                                {t('buttons.remove')}
                            </Button>
                        </View>
                    )}
                </Pressable>
            ))}

            {images.length < maxImages && (
                <TouchableOpacity
                    style={styles.uploadPlaceholder}
                    onPress={pickImages}
                >
                    <Icon name="image" size={50} color={Colors.red} />
                    <Text style={styles.uploadText}>{t('labels.chooseOrDrop')}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default ImagePicker;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        backgroundColor: Colors.beige,
        padding: 16,
        borderRadius: 20,
        justifyContent: 'center',
    },
    imageWrapper: {
        width: 140,
        height: 140,
        position: 'relative',
        borderRadius: 4,
        overflow: 'hidden',
        marginRight: 8,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    uploadPlaceholder: {
        width: 140,
        height: 140,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff0e0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadText: {
        fontSize: 16,
        color: '#2f2f2f',
        marginTop: 8,
        textAlign: 'center',
        fontFamily: 'CormorantGaramond-Regular',
    },
}); 