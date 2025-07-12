import { useState, useMemo } from "react";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import "../styles/MediaGallery.css";

const extractYouTubeId = (url) => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
};

const MediaGallery = ({ media }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const galleryItems = useMemo(() =>
        media.map((item) => {
            const isYouTube = item.Url.includes("youtube.com") || item.Url.includes("youtu.be");

            if (isYouTube) {
                const videoId = extractYouTubeId(item.Url);
                return {
                    thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                    isVideo: true,
                    videoId
                };
            }

            return {
                original: item.Url,
                thumbnail: item.Url,
                isVideo: false
            };
        }), [media]);

    const renderItem = (item, index) => {
        if (item.isVideo) {
            const autoplay = index === currentIndex ? 1 : 0;
            const videoUrl = `https://www.youtube.com/embed/${item.videoId}?autoplay=${autoplay}&mute=1&rel=0`;

            return (
                <div className="video-wrapper">
                    <iframe
                        src={videoUrl}
                        title={`YouTube Video ${index}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            );
        }

        return <img src={item.original} alt={`Image ${index}`} />;
    };

    return (
        <div className="media-gallery-container">
            <ImageGallery
                items={galleryItems}
                showPlayButton={false}
                showFullscreenButton={false}
                showBullets={false}
                showThumbnails={galleryItems.length > 1}
                showNav={galleryItems.length > 1}
                onSlide={setCurrentIndex}
                renderItem={renderItem}
                startIndex={0}
            />
        </div> 
    );
};

export default MediaGallery;