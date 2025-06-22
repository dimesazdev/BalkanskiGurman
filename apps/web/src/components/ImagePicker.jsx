import { useState } from "react";
import Icon from "@mdi/react";
import { mdiImage } from "@mdi/js";
import Button from "./Button";
import "../styles/ImagePicker.css";
import { useTranslation } from "react-i18next";

const ImagePicker = ({ images, setImages, maxImages = 3, onInvalid }) => {
  const [dragOver, setDragOver] = useState(false);
  const { t } = useTranslation();

  const isValidImage = (file) => {
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    return validTypes.includes(file.type);
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (!files.every(isValidImage)) {
      onInvalid?.();
      return;
    }

    const newImages = files.slice(0, maxImages - images.length).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.every(isValidImage)) {
      onInvalid?.();
      return;
    }

    const newImages = files.slice(0, maxImages - images.length).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  return (
    <div
      className={`image-drop-zone ${dragOver ? "drag-over" : ""}`}
      onDrop={handleImageDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
    >
      {images.map((img, i) => (
        <div
          key={i}
          className="image-wrapper"
          onMouseEnter={(e) => e.currentTarget.classList.add("hover")}
          onMouseLeave={(e) => e.currentTarget.classList.remove("hover")}
        >
          <img src={img.url} alt={`Upload ${i}`} />
          <Button
            variant="red"
            className="remove-btn"
            onClick={(e) => {
              e.stopPropagation();
              setImages((prev) => prev.filter((_, index) => index !== i));
            }}
          >
            Remove
          </Button>
        </div>
      ))}

      {images.length < maxImages && (
        <label className="upload-placeholder">
          <input type="file" accept="image/*" multiple hidden onChange={handleImageUpload} />
          <div className="upload-square" style={{ textAlign: "center" }}>
            <Icon path={mdiImage} size={1.5} color="var(--red)" />
            <div>{t("labels.chooseOrDrop")}</div>
          </div>
        </label>
      )}
    </div>
  );
};

export default ImagePicker;