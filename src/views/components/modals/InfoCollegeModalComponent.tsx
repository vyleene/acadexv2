import { BuildingLibraryIcon, ClipboardDocumentIcon, TagIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { CloseButton, Modal } from 'react-bootstrap'


function InfoCollegeModalComponent() {
  return (
    <div
      className="modal fade"
      id="collegeInfoModal"
      tabIndex={-1}
      aria-labelledby="collegeInfoModalLabel"
      aria-hidden="true"
    >
      <Modal.Dialog centered>
        <Modal.Header>
          <Modal.Title id="collegeInfoModalLabel">
              College Information
          </Modal.Title>
          <CloseButton data-bs-dismiss="modal" aria-label="Close" />
        </Modal.Header>

        <Modal.Body id="collegeInfoModalBody">
            <div className="student-info">
              <div className="student-info__header">
                <div>
                  <div className="student-info__label">
                    <TagIcon className="heroicon-url" aria-hidden="true" />
                    College Code
                  </div>
                  <div className="student-info__value" id="college-info-code"></div>
                </div>
                <div>
                  <div className="student-info__label">
                    <BuildingLibraryIcon className="heroicon-url" aria-hidden="true" />
                    College Name
                  </div>
                  <div className="student-info__value" id="college-info-name"></div>
                </div>
              </div>

              <div className="student-info__meta mt-3">
                <div className="student-info__meta-item">
                  <div className="student-info__label">
                    <ClipboardDocumentIcon className="heroicon-url" aria-hidden="true" />
                    Programs
                  </div>
                  <div className="student-info__value student-info__chip" id="college-info-program-count"></div>
                </div>
                <div className="student-info__meta-item">
                  <div className="student-info__label">
                    <UserGroupIcon className="heroicon-url" aria-hidden="true" />
                    Students
                  </div>
                  <div className="student-info__value student-info__chip" id="college-info-student-count"></div>
                </div>
              </div>
            </div>
        </Modal.Body>
      </Modal.Dialog>
    </div>
  )
}

export default InfoCollegeModalComponent
