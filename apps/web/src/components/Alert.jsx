import "../styles/Alert.css";
import Button from './Button';

const Alert = ({ message, buttonText, onButtonClick, onClose, showCancel = true, cancelText = "Cancel" }) => {
    return (
        <div className="alert-overlay">
            <div className="alert-box">
                <p>{message}</p>
                <div className='button-box'>
                    <Button variant="red" onClick={onButtonClick}>{buttonText}</Button>
                    {showCancel && (
                        <Button onClick={onClose}>{cancelText}</Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Alert;