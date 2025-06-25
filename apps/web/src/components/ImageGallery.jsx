import { useEffect, useRef, useState } from "react";
import Icon from "@mdi/react";
import { mdiArrowLeftThin, mdiArrowRightThin } from "@mdi/js";
import "../styles/ImageGallery.css";

function ImageGallery({ images, arrowColor="#FFEEDB", arrowSize=1.8 }) {
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
      const scrollAmount = 500; 
      current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="image-gallery-wrapper" style={{ padding: showArrows ? "0 40px" : 0 }}>
      {showArrows && (
        <button className="gallery-arrow left" onClick={() => scroll("left")}>
          <Icon path={mdiArrowLeftThin} size={arrowSize} color={arrowColor} />
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
        <button className="gallery-arrow right" onClick={() => scroll("right")}>
          <Icon path={mdiArrowRightThin} size={arrowSize} color={arrowColor} />
        </button>
      )}
    </div>
  );
}

export default ImageGallery;
