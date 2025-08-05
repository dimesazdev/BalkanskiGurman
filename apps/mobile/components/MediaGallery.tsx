import React, { useState, useMemo, useRef } from 'react';
import { View, Image, StyleSheet, Dimensions, Pressable } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import Carousel from 'react-native-reanimated-carousel';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import type { ICarouselInstance } from 'react-native-reanimated-carousel';

const { width } = Dimensions.get('window');

const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
};

export type MediaItem = { Url: string | string[] };

export type MediaGalleryProps = {
    media: MediaItem[];
    dotColor?: string;
    contentStyle?: object;
};

const MediaGallery: React.FC<MediaGalleryProps> = ({ media, dotColor, contentStyle }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselRef = useRef<ICarouselInstance>(null);

    const galleryItems = useMemo(() =>
        media.map((item) => {
            const rawUrl = Array.isArray(item.Url) ? item.Url[0] : item.Url;
            const urlStr = typeof rawUrl === 'string' ? rawUrl : ''; 
            const isYouTube = urlStr.includes('youtube.com') || urlStr.includes('youtu.be');
            if (isYouTube) {
                const videoId = extractYouTubeId(urlStr) || undefined;
                return { isVideo: true, videoId };
            }
            return { isVideo: false, uri: urlStr };
        }),
        [media]
    );

    const renderItem = ({ item, index }: { item: { isVideo: boolean; videoId?: string; uri?: string }; index: number }) => {
        if (item.isVideo) {
            return (
                <View style={[styles.videoWrapper, contentStyle]}>
                    <YoutubePlayer
                        height={230}
                        width={width * 0.9}
                        videoId={item.videoId}
                        play={index === currentIndex}
                        mute
                    />
                </View>
            );
        }
        return (
            <Image
                source={{ uri: item.uri }}
                style={[styles.image, contentStyle]}
                resizeMode="contain"
            />

        );
    };

    const Dot = ({
        active,
        dotIndex,
        color,
    }: {
        active: boolean;
        dotIndex: number;
        color: string;
    }) => {
        const animatedStyle = useAnimatedStyle(() => {
            return {
                width: withTiming(active ? 14 : 8),
                opacity: withTiming(active ? 1 : 0.4),
            };
        }, [active]);

        return (
            <Pressable onPress={() => {
                carouselRef.current?.scrollTo({ index: dotIndex, animated: true });
                setCurrentIndex(dotIndex);
            }}>
                <Animated.View style={[styles.dot, { backgroundColor: color }, animatedStyle]} />
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            <Carousel
                ref={carouselRef}
                loop={galleryItems.length > 1}
                enabled={galleryItems.length > 1}
                width={width * 0.9}
                height={230}
                data={galleryItems}
                scrollAnimationDuration={500}
                onSnapToItem={setCurrentIndex}
                renderItem={renderItem}
            />
            {galleryItems.length > 1 && (
                <View style={styles.dotsContainer}>
                    {galleryItems.map((_, i) => (
                        <Dot key={i} active={i === currentIndex} dotIndex={i} color={dotColor || '#FFEEDB'} />
                    ))}
                </View>
            )}
        </View>
    );
};

export default MediaGallery;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    videoWrapper: {
        width: '100%',
        height: 220,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: 220,
        maxWidth: '100%',
        alignSelf: 'center',
        resizeMode: 'contain'
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFEEDB'
    },
});