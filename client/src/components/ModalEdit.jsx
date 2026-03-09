import React from 'react';
import "./modal.css"
const ModalEdit = ({ active, setActive,children }) => {
    return (
        <div className={active ? "modal active" : "modal"} onClick={() => setActive(false)}>
            <div className="modal_content" onClick={e => e.stopPropagation()}>
                {children }
            </div>
        </div>
    )
}
export default ModalEdit;