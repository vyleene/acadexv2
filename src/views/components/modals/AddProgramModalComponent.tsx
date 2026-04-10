import { BuildingLibraryIcon, ClipboardDocumentIcon, DocumentTextIcon, TagIcon } from '@heroicons/react/24/outline'
import { Button, CloseButton, Form, InputGroup, Modal } from 'react-bootstrap'

function AddProgramModalComponent() {
  return (
    <div className="modal fade" id="programModal" tabIndex={-1} aria-labelledby="programModalLabel" aria-hidden="true">
      <Modal.Dialog centered>
        <Modal.Header>
          <Modal.Title className="modal-title--main" id="programModalLabel">
            <ClipboardDocumentIcon className="u-icon" aria-hidden="true" />
            <span id="programModalTitleText" className="u-modal-title-text">Add Program</span>
          </Modal.Title>
          <CloseButton data-bs-dismiss="modal" aria-label="Close" />
        </Modal.Header>
        <Form id="program-form" data-mode="add">
          <Modal.Body>
            <Form.Group className="mb-3" controlId="program-code">
              <Form.Label>Program Code</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <TagIcon className="u-icon" aria-hidden="true" />
                </InputGroup.Text>
                <Form.Control
                  id="program-code"
                  name="programCode"
                  type="text"
                  maxLength={16}
                  autoCapitalize="characters"
                  autoComplete="off"
                  required
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3" controlId="program-name">
              <Form.Label>Program Name</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <DocumentTextIcon className="u-icon" aria-hidden="true" />
                </InputGroup.Text>
                <Form.Control id="program-name" name="programName" type="text" required />
              </InputGroup>
            </Form.Group>

            <Form.Group controlId="program-college">
              <Form.Label>College Code</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <BuildingLibraryIcon className="u-icon" aria-hidden="true" />
                </InputGroup.Text>
                <Form.Select id="program-college" name="collegeCode" required defaultValue="">
                  <option value="" hidden>
                    Select college code
                  </option>
                </Form.Select>
              </InputGroup>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button type="button" variant="danger" data-bs-dismiss="modal">
              Cancel
            </Button>
            <Button type="submit" variant="success" id="program-submit">
              Add Program
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Dialog>
    </div>
  )
}

export default AddProgramModalComponent
