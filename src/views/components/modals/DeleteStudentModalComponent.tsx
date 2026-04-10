import { TrashIcon } from '@heroicons/react/24/outline'
import { Button, CloseButton, Form, Modal } from 'react-bootstrap'

function DeleteStudentModalComponent() {
  return (
    <div
      className="modal fade"
      id="deleteStudentModal"
      tabIndex={-1}
      aria-labelledby="deleteStudentModalLabel"
      aria-hidden="true"
    >
      <Modal.Dialog centered>
        <Modal.Header>
          <Modal.Title className="modal-title--main" id="deleteStudentModalLabel">
            <TrashIcon className="u-icon" aria-hidden="true" />
            <span className="u-modal-title-text">Delete Student</span>
          </Modal.Title>
          <CloseButton data-bs-dismiss="modal" aria-label="Close" />
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">Are you sure you want to delete this student?</p>
          <Form.Control type="hidden" id="delete-student-id" name="studentId" />
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" variant="secondary" data-bs-dismiss="modal">
            Cancel
          </Button>
          <Button type="button" variant="danger" id="confirm-delete-student">
            Delete
          </Button>
        </Modal.Footer>
      </Modal.Dialog>
    </div>
  )
}

export default DeleteStudentModalComponent
