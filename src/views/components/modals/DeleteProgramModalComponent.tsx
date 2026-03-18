import { Button, CloseButton, Form, Modal } from 'react-bootstrap'

function DeleteProgramModalComponent() {
  return (
    <div
      className="modal fade"
      id="deleteProgramModal"
      tabIndex={-1}
      aria-labelledby="deleteProgramModalLabel"
      aria-hidden="true"
    >
      <Modal.Dialog centered>
        <Modal.Header>
          <Modal.Title id="deleteProgramModalLabel">
              Delete Program
          </Modal.Title>
          <CloseButton data-bs-dismiss="modal" aria-label="Close" />
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">Are you sure you want to delete this program?</p>
          <p className="text-muted small mb-0" id="delete-program-warning"></p>
          <Form.Control type="hidden" id="delete-program-id" name="programId" />
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" variant="outline-secondary" data-bs-dismiss="modal">
              Cancel
          </Button>
          <Button type="button" variant="danger" id="confirm-delete-program">
              Delete
          </Button>
        </Modal.Footer>
      </Modal.Dialog>
    </div>
  )
}

export default DeleteProgramModalComponent
