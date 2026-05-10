/** Email de contacto del equipo (cambialo por el real al publicar). */
const ORION_CONTACT_EMAIL = "orionteam@email.com";

export default function Footer() {
  return (
    <footer id="contacto" className="footer">
      <div className="container footer-inner">
        <a className="footer-mail" href={`mailto:${ORION_CONTACT_EMAIL}`}>
          {ORION_CONTACT_EMAIL}
        </a>
      </div>
    </footer>
  );
}