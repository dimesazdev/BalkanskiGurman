import { useNavigate } from 'react-router-dom';
import "../styles/CustomModal.css";

const LoginAlertModal = ({ onClose }) => {
  const navigate = useNavigate();

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>You need to log in</h3>
        <p>Please log in to add restaurants to your favorites.</p>
        <button className="modal-btn red" onClick={() => navigate('/login')}>Log In</button>
        <button className="modal-btn" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default LoginAlertModal;