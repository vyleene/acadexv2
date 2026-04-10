import { BuildingLibraryIcon, DocumentTextIcon, TagIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { CloseButton, Modal } from 'react-bootstrap'

function InfoProgramModalComponent() {
  return (
    <div
      className="modal fade"
      id="programInfoModal"
      tabIndex={-1}
      aria-labelledby="programInfoModalLabel"
      aria-hidden="true"
    >
      <Modal.Dialog centered>
        <Modal.Header>
          <Modal.Title className="modal-title--main" id="programInfoModalLabel">
            <DocumentTextIcon className="u-icon" aria-hidden="true" />
            <span className="u-modal-title-text">Program Information</span>
          </Modal.Title>
          <CloseButton data-bs-dismiss="modal" aria-label="Close" />
        </Modal.Header>
        <Modal.Body id="programInfoModalBody">
            <div className="student-info">
              <div className="student-info__header">
                <div>
                  <div className="student-info__label">
                    <TagIcon className="u-icon" aria-hidden="true" />
                    Program Code
                  </div>
                  <div className="student-info__value" id="program-info-code"></div>
                </div>
                <div>
                  <div className="student-info__label">
                    <DocumentTextIcon className="u-icon" aria-hidden="true" />
                    Program Name
                  </div>
                  <div className="student-info__value" id="program-info-name"></div>
                </div>
              </div>

              <div className="student-info__meta mt-3">
                <div className="student-info__meta-item">
                  <div className="student-info__label">
                    <UserGroupIcon className="u-icon" aria-hidden="true" />
                    Students
                  </div>
                  <div className="student-info__value student-info__chip" id="program-info-student-count"></div>
                </div>
              </div>

              <div className="row g-3 mt-3">
                <div className="col-12">
                  <div className="student-info__label">
                    <BuildingLibraryIcon className="u-icon" aria-hidden="true" />
                    College
                  </div>
                  <div className="student-info__inline">
                    <span
                      className="badge rounded-pill text-bg-secondary student-info__badge"
                      id="program-info-college-code"
                    ></span>
                    <div className="student-info__value" id="program-info-college-name"></div>
                  </div>
                </div>
              </div>
            </div>
        </Modal.Body>
      </Modal.Dialog>
    </div>
  )
}

export default InfoProgramModalComponent
