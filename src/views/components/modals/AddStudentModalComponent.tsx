import { AcademicCapIcon, CalendarDaysIcon, IdentificationIcon, UserIcon, UserPlusIcon, UsersIcon } from '@heroicons/react/24/outline'
import { Button, CloseButton, Col, Form, InputGroup, Modal, Row } from 'react-bootstrap'


function AddStudentModalComponent() {
  return (
    <div className="modal fade" id="studentModal" tabIndex={-1} aria-labelledby="studentModalLabel" aria-hidden="true">
      <Modal.Dialog centered>
        <Modal.Header>
          <Modal.Title className="d-flex align-items-center gap-2" id="studentModalLabel">
              <UserPlusIcon className="heroicon-url" aria-hidden="true" />
              Add Student
          </Modal.Title>
          <CloseButton data-bs-dismiss="modal" aria-label="Close" />
        </Modal.Header>
        <Form id="student-form" data-mode="add">
          <Modal.Body>
            <Form.Group className="mb-3" controlId="student-id-number">
              <Form.Label>
                  Student ID
              </Form.Label>
              <Row className="g-2 align-items-center">
                <Col xs={4} md={4}>
                  <InputGroup>
                    <InputGroup.Text>
                      <IdentificationIcon className="heroicon-url" aria-hidden="true" />
                    </InputGroup.Text>
                    <Form.Select id="student-id-year" name="studentIdYear" required defaultValue="">
                      <option value="" hidden>
                        Year
                      </option>
                    </Form.Select>
                  </InputGroup>
                </Col>
                <Col xs={1} className="text-center">
                  -
                </Col>
                <Col xs={7} md={7}>
                  <Form.Control
                      id="student-id-number"
                      name="studentIdNumber"
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      pattern="[0-9]{4}"
                      placeholder="NNNN"
                      required
                    />
                </Col>
              </Row>
            </Form.Group>

            <Row className="g-3">
              <Col xs={12} md={6}>
                <Form.Group controlId="student-first-name">
                  <Form.Label>
                    First Name
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <UserIcon className="heroicon-url" aria-hidden="true" />
                    </InputGroup.Text>
                    <Form.Control
                      id="student-first-name"
                      name="firstName"
                      type="text"
                      maxLength={16}
                      pattern="[A-Za-z ]+"
                      placeholder="First name"
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group controlId="student-last-name">
                  <Form.Label>
                    Last Name
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <UserIcon className="heroicon-url" aria-hidden="true" />
                    </InputGroup.Text>
                    <Form.Control
                      id="student-last-name"
                      name="lastName"
                      type="text"
                      maxLength={16}
                      pattern="[A-Za-z ]+"
                      placeholder="Last name"
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mt-3" controlId="student-program">
              <Form.Label>
                  Program Code
              </Form.Label>
              <InputGroup>
                <InputGroup.Text>
                    <AcademicCapIcon className="heroicon-url" aria-hidden="true" />
                </InputGroup.Text>
                <Form.Select id="student-program" name="programCode" required defaultValue="">
                  <option value="" hidden>
                    Select program code
                  </option>
                </Form.Select>
              </InputGroup>
            </Form.Group>

            <Row className="g-3 mt-1">
              <Col xs={6} md={6}>
                <Form.Group controlId="student-year">
                  <Form.Label>
                    Year
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <CalendarDaysIcon className="heroicon-url" aria-hidden="true" />
                    </InputGroup.Text>
                    <Form.Select id="student-year" name="year" required defaultValue="">
                      <option value="" hidden>
                        Select year
                      </option>
                      <option value={1}>1st Year</option>
                      <option value={2}>2nd Year</option>
                      <option value={3}>3rd Year</option>
                      <option value={4}>4th Year</option>
                    </Form.Select>
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col xs={6} md={6}>
                <Form.Group controlId="student-gender">
                  <Form.Label>
                    Gender
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <UsersIcon className="heroicon-url" aria-hidden="true" />
                    </InputGroup.Text>
                    <Form.Select id="student-gender" name="gender" required defaultValue="">
                      <option value="" hidden>
                        Select gender
                      </option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </Form.Select>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer>
            <Button type="button" variant="danger" data-bs-dismiss="modal">
                Cancel
            </Button>
            <Button type="submit" variant="success" id="student-submit">
                Add Student
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Dialog>
    </div>
  )
}

export default AddStudentModalComponent
