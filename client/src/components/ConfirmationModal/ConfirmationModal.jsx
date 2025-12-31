
import { Modal, Button } from 'react-bootstrap';
import './ConfirmationModal.css';

const ConfirmationModal = ({
                               show,
                               onHide,
                               onConfirm,
                               title = "Подтверждение",
                               message = "Вы уверены, что хотите выполнить это действие?",
                               confirmText = "Подтвердить",
                               cancelText = "Отмена",
                               variant = "danger",
                               loading = false
                           }) => {
    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            className="confirmation-modal"
        >
            <Modal.Header closeButton className="confirmation-modal__header">
                <Modal.Title className="confirmation-modal__title">
                    {title}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="confirmation-modal__body">
                <div className="confirmation-modal__icon">⚠️</div>
                <p className="confirmation-modal__message">{message}</p>
            </Modal.Body>
            <Modal.Footer className="confirmation-modal__footer">
                <Button
                    variant="outline-secondary"
                    onClick={onHide}
                    disabled={loading}
                    className="confirmation-modal__cancel-btn"
                >
                    {cancelText}
                </Button>
                <Button
                    variant={variant}
                    onClick={onConfirm}
                    disabled={loading}
                    className={`confirmation-modal__confirm-btn confirmation-modal__confirm-btn--${variant}`}
                >
                    {loading ? 'Загрузка...' : confirmText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmationModal;
