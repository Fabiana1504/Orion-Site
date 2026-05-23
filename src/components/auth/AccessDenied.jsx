"use client";

import Link from "next/link";
import Footer from "../Footer";
import Header from "../Header";

export default function AccessDenied() {
  return (
    <div id="top">
      <Header />
      <main className="team-lab-main">
        <div className="container team-lab-container">
          <div className="team-lab-gate clean-panel access-denied-card">
            <p className="eyebrow eyebrow--pulse">Laboratory</p>
            <h1 className="team-lab-page-title">Laboratory</h1>
            <p className="team-lab-lead">You do not have permission to access the laboratory.</p>
            <p className="team-lab-hint access-denied-hint">
              Roles: <code className="inline-code">admin</code>, <code className="inline-code">lab_operator</code>,{" "}
              <code className="inline-code">viewer</code>. Laboratory access requires{" "}
              <code className="inline-code">can_access_lab = true</code> in <code className="inline-code">lab_access</code>.
            </p>
            <div className="team-lab-gate-actions">
              <Link href="/" className="btn btn-primary">
                Back to public site
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
