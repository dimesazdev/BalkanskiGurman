import { useEffect, useRef, useState } from "react";
import Icon from "@mdi/react";
import { mdiChevronLeftCircleOutline, mdiChevronRightCircleOutline } from "@mdi/js";
import "../styles/ImageGallery.css";

function ImageGallery({ images }) {
  const galleryRef = useRef(null);
  const [showArrows, setShowArrows] = useState(false);

  const checkOverflow = () => {
    const { current } = galleryRef;
    if (current) {
      setShowArrows(current.scrollWidth > current.clientWidth);
    }
  };

  useEffect(() => {
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [images]);

  const scroll = (direction) => {
    const { current } = galleryRef;
    if (current) {
      const scrollAmount = 500; // adjust if needed
      current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="image-gallery-wrapper">
      {showArrows && (
        <button
          className="gallery-arrow left"
          onClick={() => scroll("left")}
        >
          <Icon path={mdiChevronLeftCircleOutline} size={1.8} />
        </button>
      )}

      <div className="image-gallery" ref={galleryRef}>
        {images.map((img, index) => (
          <img
            key={index}
            src={img.Url}
            alt={`Gallery ${index + 1}`}
            className="gallery-image"
          />
        ))}
      </div>

      {showArrows && (
        <button
          className="gallery-arrow right"
          onClick={() => scroll("right")}
        >
          <Icon path={mdiChevronRightCircleOutline} size={1.8} />
        </button>
      )}
    </div>
  );
}

export default ImageGallery;
