import { BuildingLibraryIcon, DocumentTextIcon, TagIcon } from '@heroicons/react/24/outline'
import { Button, CloseButton, Form, InputGroup, Modal } from 'react-bootstrap'

function AddCollegeModalComponent() {
  return (
    <div className="modal fade" id="collegeModal" tabIndex={-1} aria-labelledby="collegeModalLabel" aria-hidden="true">
      <Modal.Dialog centered>
        <Modal.Header>
          <Modal.Title className="modal-title--main" id="collegeModalLabel">
            <BuildingLibraryIcon className="u-icon" aria-hidden="true" />
            <span id="collegeModalTitleText" className="u-modal-title-text">Add College</span>
          </Modal.Title>
          <CloseButton data-bs-dismiss="modal" aria-label="Close" />
        </Modal.Header>

        <Form id="college-form" data-mode="add">
          <Modal.Body>
            <Form.Group className="mb-3" controlId="college-code">
              <Form.Label>College Code</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <TagIcon className="u-icon" aria-hidden="true" />
                </InputGroup.Text>
                <Form.Control id="college-code" name="collegeCode" type="text" required />
              </InputGroup>
            </Form.Group>

            <Form.Group controlId="college-name">
              <Form.Label>College Name</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <DocumentTextIcon className="u-icon" aria-hidden="true" />
                </InputGroup.Text>
                <Form.Control id="college-name" name="collegeName" type="text" required />
              </InputGroup>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button type="button" variant="danger" data-bs-dismiss="modal">
              Cancel
            </Button>
            <Button type="submit" variant="success" id="college-submit">
              Add College
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Dialog>
    </div>
  )
}

export default AddCollegeModalComponent
