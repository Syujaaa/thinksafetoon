import { useState, useEffect } from "react";
import styled from "styled-components";

const Kredit = ({ isOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <StyledWrapper>
      {/* Backdrop */}
      <div
        className={`backdrop ${isVisible ? "visible" : ""}`}
        onClick={onClose}
      />

      {/* Popup Container */}
      <div className={`popup-container ${isVisible ? "visible" : ""}`}>
        {/* Comic-style popup */}
        <div className="comic-popup">
          {/* Popup Header with comic style */}
          <div className="popup-header">
            <div className="header-content">
              <div className="comic-burst">
                <span className="burst-text">KREDIT</span>
              </div>
              <h2 className="popup-title">Tim Pengembang ThinkSafeToon</h2>
              <p className="popup-subtitle">PKM RSH 2026 - FMIPA UNNES</p>
            </div>

            {/* Close button */}
            <button className="close-button" onClick={onClose}>
              <span className="close-icon">✕</span>
            </button>
          </div>

          {/* Popup Content */}
          <div className="popup-content">
            {/* Development Team Section */}
            <div className="team-section">
              <div className="section-header">
                <div className="section-icon">👥</div>
                <h3>Tim Peneliti</h3>
              </div>

              <div className="team-grid">
                {/* Ketua */}
                <div className="team-card main">
                  <div className="card-header">
                    <span className="role-badge">Ketua PKM</span>
                    <div className="card-icon">👑</div>
                  </div>
                  <div className="member-info">
                    <h4 className="member-name">Salsabila Afifah</h4>
                    <p className="member-nim">NIM: 2304020155</p>
                    <p className="member-prodi">Pendidikan Matematika</p>
                    <div className="contact-info">
                      <span className="contact-item">
                        📧 afifahsalsabila173@students.unnes.ac.id
                      </span>
                      <span className="contact-item">📱 081285031957</span>
                    </div>
                  </div>
                </div>

                {/* Anggota 1 */}
                <div className="team-card">
                  <div className="card-header">
                    <span className="role-badge">Anggota</span>
                  </div>
                  <div className="member-info">
                    <h4 className="member-name">Dewi Setiyawati</h4>
                    <p className="member-nim">NIM: 2304020162</p>
                    <p className="member-prodi">Pendidikan Matematika</p>
                  </div>
                </div>

                {/* Anggota 2 */}
                <div className="team-card">
                  <div className="card-header">
                    <span className="role-badge">Anggota</span>
                  </div>
                  <div className="member-info">
                    <h4 className="member-name">Aulia Nur Azizah</h4>
                    <p className="member-nim">NIM: 2304020143</p>
                    <p className="member-prodi">Pendidikan Matematika</p>
                  </div>
                </div>

                {/* Anggota 3 */}
                <div className="team-card">
                  <div className="card-header">
                    <span className="role-badge">Anggota</span>
                  </div>
                  <div className="member-info">
                    <h4 className="member-name">Annisa Uswatun Khasanah</h4>
                    <p className="member-nim">NIM: 2304020033</p>
                    <p className="member-prodi">Pendidikan Matematika</p>
                  </div>
                </div>

                {/* Anggota 4 */}
                <div className="team-card">
                  <div className="card-header">
                    <span className="role-badge">Anggota</span>
                  </div>
                  <div className="member-info">
                    <h4 className="member-name">Farras Syuja</h4>
                    <p className="member-nim">NIM: 2504130038</p>
                    <p className="member-prodi">Teknik Informatika</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dosen Pembimbing */}
            <div className="advisor-section">
              <div className="section-header">
                <div className="section-icon">🎓</div>
                <h3>Dosen Pendamping</h3>
              </div>

              <div className="advisor-card">
                <div className="advisor-info">
                  <h4 className="advisor-name">
                    Adi Satrio Ardianyah, S.Pd., M.Pd.
                  </h4>
                  <p className="advisor-nidn">NIDN: 0014019401</p>
                  <p className="advisor-prodi">Pendidikan Matematika - FMIPA</p>
                </div>
                <div className="advisor-icon">👨‍🏫</div>
              </div>
            </div>

            {/* Institution */}
            <div className="institution-section">
              <div className="section-header">
                <div className="section-icon">🏛️</div>
                <h3>Institusi</h3>
              </div>

              <div className="institution-info">
                <h4 className="institution-name">
                  Universitas Negeri Semarang (UNNES)
                </h4>
                <p className="institution-faculty">
                  Fakultas Matematika dan Ilmu Pengetahuan Alam (FMIPA)
                </p>
                <div className="institution-address">
                  <span className="address-icon">📍</span>
                  <span>Jl. Sekaran, Gunungpati, Semarang, Jawa Tengah</span>
                </div>
              </div>
            </div>

            {/* Mitra */}
            <div className="partner-section">
              <div className="section-header">
                <div className="section-icon">🤝</div>
                <h3>Mitra Pelaksanaan</h3>
              </div>

              <div className="partner-info">
                <h4 className="partner-name">SMP Negeri 13 Semarang</h4>
                <p className="partner-status">Sekolah Negeri Terakreditasi A</p>
                <div className="partner-address">
                  <span className="address-icon">📍</span>
                  <span>Jalan Lamongan Raya, Gajah Mungkur, Kota Semarang</span>
                </div>
                <p className="partner-note">
                  Mitra dipilih berdasarkan kriteria kontekstual, demografis,
                  dan akademik yang relevan dengan program ThinkSafeToon
                </p>
              </div>
            </div>

            {/* Project Info */}
            <div className="project-info">
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Program</span>
                  <span className="info-value">PKM RSH 2026</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Tema</span>
                  <span className="info-value">
                    Pendidikan & Mitigasi Bencana
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Metode</span>
                  <span className="info-value">
                    Research & Development (R&D)
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Pendekatan</span>
                  <span className="info-value">Challenge Based Learning</span>
                </div>
              </div>
            </div>
          </div>

          {/* Popup Footer */}
          <div className="popup-footer">
            <div className="footer-content">
              <p className="copyright">
                © 2026 ThinkSafeToon - Aplikasi Komik Interactive Challenge
              </p>
              <p className="slogan">
                Meningkatkan Sikap Konservasi dan Berpikir Kritis Berbasis
                Mitigasi Bencana
              </p>
            </div>

            {/* Action buttons */}
            <div className="action-buttons">
              <button className="action-button close-btn" onClick={onClose}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;

  /* Backdrop */
  .backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    opacity: 0;
    transition: opacity 0.3s ease;

    &.visible {
      opacity: 1;
    }
  }

  /* Popup Container */
  .popup-container {
    position: relative;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    opacity: 0;
    transform: scale(0.9) translateY(20px);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

    &.visible {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  /* Comic Popup */
  .comic-popup {
    background: white;
    border: 6px solid #000;
    border-radius: 20px;
    box-shadow:
      0 20px 40px rgba(0, 0, 0, 0.3),
      0 0 0 10px #ffd700,
      0 0 0 12px #000;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    max-height: inherit;
  }

  /* Popup Header */
  .popup-header {
    background: linear-gradient(135deg, #ff3d3d 0%, #ff6b6b 100%);
    padding: 20px 30px;
    border-bottom: 4px solid #000;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    position: relative;

    .header-content {
      flex: 1;
    }

    .comic-burst {
      display: inline-block;
      background: #ffef00;
      border: 3px solid #000;
      border-radius: 50px;
      padding: 8px 20px;
      transform: rotate(-3deg);
      margin-bottom: 10px;

      .burst-text {
        font-weight: 900;
        font-size: 1.2em;
        letter-spacing: 2px;
        color: #000;
        text-shadow: 2px 2px 0 #fff;
      }
    }

    .popup-title {
      font-size: 1.8em;
      font-weight: 900;
      color: #fff;
      margin: 5px 0;
      text-shadow: 3px 3px 0 #000;
      letter-spacing: 1px;
    }

    .popup-subtitle {
      color: #ffef00;
      font-weight: 600;
      font-size: 0.9em;
      letter-spacing: 1px;
    }

    .close-button {
      background: #000;
      border: 3px solid #fff;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: #ff3d3d;
        transform: scale(1.1);
      }

      .close-icon {
        color: #fff;
        font-size: 1.5em;
        font-weight: bold;
      }
    }
  }

  /* Popup Content */
  .popup-content {
    padding: 25px;
    overflow-y: auto;
    flex: 1;

    /* Custom scrollbar */
    &::-webkit-scrollbar {
      width: 10px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-left: 2px solid #000;
    }

    &::-webkit-scrollbar-thumb {
      background: #ff3d3d;
      border: 2px solid #000;
      border-radius: 5px;
    }
  }

  /* Section Styles */
  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 3px dashed #000;

    .section-icon {
      font-size: 1.8em;
    }

    h3 {
      font-size: 1.4em;
      font-weight: 800;
      color: #000;
      margin: 0;
    }
  }

  /* Team Section */
  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }

  .team-card {
    background: #fff;
    border: 3px solid #000;
    border-radius: 15px;
    padding: 20px;
    position: relative;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 8px 8px 0 #000;
    }

    &.main {
      border-color: #ff3d3d;
      background: linear-gradient(135deg, #fff 0%, #ffef00 100%);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      .role-badge {
        background: #000;
        color: #fff;
        padding: 5px 15px;
        border-radius: 20px;
        font-size: 0.8em;
        font-weight: 700;
        text-transform: uppercase;
      }

      .card-icon {
        font-size: 1.5em;
      }
    }

    .member-info {
      .member-name {
        font-size: 1.2em;
        font-weight: 800;
        color: #000;
        margin: 0 0 8px 0;
      }

      .member-nim,
      .member-prodi {
        color: #666;
        font-size: 0.9em;
        margin: 4px 0;
      }

      .contact-info {
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px dashed #ccc;

        .contact-item {
          display: block;
          font-size: 0.85em;
          color: #444;
          margin: 5px 0;

          &::before {
            margin-right: 8px;
          }
        }
      }
    }
  }

  /* Advisor Section */
  .advisor-section {
    margin-bottom: 30px;
  }

  .advisor-card {
    background: linear-gradient(135deg, #e3f2fd 0%, #fff 100%);
    border: 3px solid #3d3dff;
    border-radius: 15px;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .advisor-info {
      flex: 1;

      .advisor-name {
        font-size: 1.3em;
        font-weight: 800;
        color: #000;
        margin: 0 0 8px 0;
      }

      .advisor-nidn,
      .advisor-prodi {
        color: #444;
        font-size: 0.9em;
        margin: 4px 0;
      }
    }

    .advisor-icon {
      font-size: 2.5em;
    }
  }

  /* Institution & Partner Sections */
  .institution-section,
  .partner-section {
    margin-bottom: 30px;
  }

  .institution-info,
  .partner-info {
    background: #fff;
    border: 3px solid #000;
    border-radius: 15px;
    padding: 20px;

    .institution-name,
    .partner-name {
      font-size: 1.2em;
      font-weight: 800;
      color: #000;
      margin: 0 0 10px 0;
    }

    .institution-faculty,
    .partner-status {
      color: #444;
      font-size: 0.95em;
      margin: 5px 0;
    }

    .institution-address,
    .partner-address {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 0.9em;
      margin: 10px 0;

      .address-icon {
        font-size: 1.2em;
      }
    }

    .partner-note {
      font-size: 0.85em;
      color: #888;
      font-style: italic;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px dashed #ccc;
    }
  }

  /* Project Info */
  .project-info {
    background: #000;
    border-radius: 15px;
    padding: 20px;
    margin-top: 30px;

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 15px;
    }

    .info-item {
      display: flex;
      flex-direction: column;

      .info-label {
        color: #ffef00;
        font-size: 0.8em;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 5px;
      }

      .info-value {
        color: #fff;
        font-weight: 700;
        font-size: 0.95em;
      }
    }
  }

  /* Popup Footer */
  .popup-footer {
    background: #000;
    padding: 20px 30px;
    border-top: 4px solid #ffd700;

    .footer-content {
      margin-bottom: 20px;

      .copyright {
        color: #fff;
        font-size: 0.9em;
        font-weight: 600;
        margin: 0 0 10px 0;
      }

      .slogan {
        color: #ffef00;
        font-size: 0.85em;
        font-style: italic;
        margin: 0;
      }
    }

    .action-buttons {
      display: flex;
      justify-content: center;

      .action-button {
        background: #ff3d3d;
        color: #fff;
        border: 3px solid #fff;
        border-radius: 50px;
        padding: 12px 40px;
        font-size: 1em;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1px;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          background: #fff;
          color: #ff3d3d;
          transform: scale(1.05);
        }

        &.close-btn {
          background: #3d3dff;

          &:hover {
            background: #fff;
            color: #3d3dff;
          }
        }
      }
    }
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .popup-container {
      width: 95%;
    }

    .team-grid {
      grid-template-columns: 1fr;
    }

    .info-grid {
      grid-template-columns: 1fr !important;
    }

    .popup-header {
      padding: 15px 20px;

      .popup-title {
        font-size: 1.5em;
      }
    }

    .popup-content {
      padding: 15px;
    }
  }

  /* Entrance animations for cards */
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .team-card,
  .advisor-card,
  .institution-info,
  .partner-info {
    animation: slideInUp 0.5s ease-out;
    animation-fill-mode: both;
  }

  .team-card:nth-child(1) {
    animation-delay: 0.1s;
  }
  .team-card:nth-child(2) {
    animation-delay: 0.2s;
  }
  .team-card:nth-child(3) {
    animation-delay: 0.3s;
  }
  .team-card:nth-child(4) {
    animation-delay: 0.4s;
  }
  .team-card:nth-child(5) {
    animation-delay: 0.5s;
  }
  .advisor-card {
    animation-delay: 0.6s;
  }
  .institution-info {
    animation-delay: 0.7s;
  }
  .partner-info {
    animation-delay: 0.8s;
  }
  .project-info {
    animation-delay: 0.9s;
  }
`;

export default Kredit;
