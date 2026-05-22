const ORION_CONTACT_EMAIL = "scuderia.oriononorati@gmail.com";
const ORION_INSTAGRAM_URL = "https://www.instagram.com/scuderiaorion?igsh=dG9sOTVjbXpyc3pq";

export default function Footer() {
  return (
    <footer id="contacto" className="footer">
      <div className="container footer-inner">
        <p className="footer-follow">Follow Orion and contact us</p>
        <div className="footer-links">
          <a
            className="footer-instagram"
            href={ORION_INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Follow Orion on Instagram"
            title="Instagram"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 1.9A3.9 3.9 0 0 0 3.9 7.8v8.4a3.9 3.9 0 0 0 3.9 3.9h8.4a3.9 3.9 0 0 0 3.9-3.9V7.8a3.9 3.9 0 0 0-3.9-3.9H7.8Zm8.9 1.46a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.9a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2Z" />
            </svg>
          </a>
          <a className="footer-mail" href={`mailto:${ORION_CONTACT_EMAIL}`}>
            {ORION_CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </footer>
  );
}