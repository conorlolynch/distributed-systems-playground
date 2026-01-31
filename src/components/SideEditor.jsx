import { useState, useEffect } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";

export function SideEditor({ isOpen, onClose, title, children }) {
  return (
    <>
      <Offcanvas show={isOpen} onHide={onClose}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{title}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>{children}</Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
