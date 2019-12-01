import modalStyle from '../../scss/modal.scss';
import React, {useRef, useCallback, useState, useEffect} from 'react';
import Modal from 'react-modal';
Modal.setAppElement('#app');

export default (props) => {

  
  /*********
   * HOOKS
   ********/
  
  const [modalVisible, setModalVisible] = useState(props.modalVisible);
  const overlayCallback = useCallback(node => {
    if (node) {
      node.addEventListener('mousedown', (e) => {
        setModalVisible(false);
      });
      node.addEventListener('wheel', (e) => {
        setModalVisible(false);
      });
    }
  });
  const contentCallback = useCallback(node => {
    if (node) {
      node.addEventListener('mousedown', (e) => {
        e.stopPropagation();
      });
      node.addEventListener('wheel', (e) => {
        e.stopPropagation();
      });
    }
  });

  useEffect(() => {
    setModalVisible(props.modalVisible);
  }, [props.modalVisible]);

  /*********
   * RENDER
   ********/

  return (
  <Modal
    isOpen={modalVisible}
    className={modalStyle.modal}
    overlayClassName={modalStyle.overlay}
    overlayRef={overlayCallback}
    contentRef={contentCallback}
  >
    {props.children}
  </Modal>
  );
}