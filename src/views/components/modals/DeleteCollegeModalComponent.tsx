import { TrashIcon } from '@heroicons/react/24/outline'
import { Button, CloseButton, Form, Modal } from 'react-bootstrap'

function DeleteCollegeModalComponent() {
  return (
    <div
      className="modal fade"
      id="deleteCollegeModal"
      tabIndex={-1}
      aria-labelledby="deleteCollegeModalLabel"
      aria-hidden="true"
    >
      <Modal.Dialog centered>
        <Modal.Header>
          <Modal.Title className="modal-title--main" id="deleteCollegeModalLabel">
            <TrashIcon className="u-icon" aria-hidden="true" />
            <span className="u-modal-title-text">Delete College</span>
          </Modal.Title>
          <CloseButton data-bs-dismiss="modal" aria-label="Close" />
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">Are you sure you want to delete this college?</p>
          <p className="text-muted small mb-0" id="delete-college-warning"></p>
          <Form.Control type="hidden" id="delete-college-id" name="collegeId" />
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" variant="secondary" data-bs-dismiss="modal">
            Cancel
          </Button>
          <Button type="button" variant="danger" id="confirm-delete-college">
            Delete
          </Button>
        </Modal.Footer>
      </Modal.Dialog>
    </div>
  )
}

export default DeleteCollegeModalComponent
