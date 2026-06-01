import PDFDocument from "pdfkit";
import { storagePut } from "../storage";

export interface CertificateData {
  credentialId: string;
  holderName: string;
  examTitle: string;
  orgName: string;
  issueDate: Date | string;
  expiryDate?: Date | string | null;
  score?: string | number | null;
  skills?: string[];
}

/**
 * Generate a printable PDF certificate and upload it to S3.
 * Returns the public CDN URL of the generated PDF.
 */
export async function generateCertificatePdf(data: CertificateData): Promise<string> {
  const pdfBuffer = await buildPdfBuffer(data);
  const key = `certificates/${data.credentialId}.pdf`;
  const { url } = await storagePut(key, pdfBuffer, "application/pdf");
  return url;
}

function buildPdfBuffer(data: CertificateData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margins: { top: 40, bottom: 40, left: 60, right: 60 },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const W = doc.page.width;   // 841.89
    const H = doc.page.height;  // 595.28

    // ─── Background ───────────────────────────────────────────────────────────
    // Deep navy background
    doc.rect(0, 0, W, H).fill("#0f172a");

    // Gold border frame
    const bm = 18;
    doc.rect(bm, bm, W - bm * 2, H - bm * 2)
      .lineWidth(3)
      .stroke("#d4a017");

    // Inner thin border
    const bm2 = 24;
    doc.rect(bm2, bm2, W - bm2 * 2, H - bm2 * 2)
      .lineWidth(0.5)
      .stroke("#d4a017");

    // ─── Header ornament ──────────────────────────────────────────────────────
    // Gold top bar
    doc.rect(bm2, bm2, W - bm2 * 2, 6).fill("#d4a017");

    // ─── SDC Logo text ────────────────────────────────────────────────────────
    doc.fillColor("#d4a017")
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("SDC CERTIFICATIONS", 0, 55, { align: "center" });

    doc.fillColor("#94a3b8")
      .fontSize(8)
      .font("Helvetica")
      .text("SKILLS DEVELOPMENT COUNCIL", 0, 70, { align: "center" });

    // Divider line
    doc.moveTo(W / 2 - 80, 88).lineTo(W / 2 + 80, 88).lineWidth(0.5).stroke("#d4a017");

    // ─── Certificate of Achievement title ────────────────────────────────────
    doc.fillColor("#ffffff")
      .fontSize(28)
      .font("Helvetica-Bold")
      .text("CERTIFICATE OF ACHIEVEMENT", 0, 105, { align: "center" });

    // ─── Presented to ────────────────────────────────────────────────────────
    doc.fillColor("#94a3b8")
      .fontSize(11)
      .font("Helvetica")
      .text("This is to certify that", 0, 155, { align: "center" });

    // Holder name
    doc.fillColor("#d4a017")
      .fontSize(32)
      .font("Helvetica-Bold")
      .text(data.holderName, 0, 178, { align: "center" });

    // Underline
    doc.fontSize(32);
    const nameWidth = Math.min(doc.widthOfString(data.holderName), W - 160);
    const nameX = (W - nameWidth) / 2;
    doc.moveTo(nameX, 218).lineTo(nameX + nameWidth, 218).lineWidth(1).stroke("#d4a017");

    // ─── Body text ───────────────────────────────────────────────────────────
    doc.fillColor("#cbd5e1")
      .fontSize(11)
      .font("Helvetica")
      .text("has successfully completed and passed the examination for", 0, 232, { align: "center" });

    // Exam title
    doc.fillColor("#ffffff")
      .fontSize(16)
      .font("Helvetica-Bold")
      .text(data.examTitle, 80, 255, { align: "center", width: W - 160 });

    // Issued by
    doc.fillColor("#94a3b8")
      .fontSize(10)
      .font("Helvetica")
      .text(`Issued by ${data.orgName}`, 0, 295, { align: "center" });

    // ─── Score badge ─────────────────────────────────────────────────────────
    if (data.score != null) {
      const scoreStr = `${parseFloat(data.score.toString()).toFixed(0)}%`;
      const badgeX = W / 2 - 30;
      doc.circle(badgeX + 30, 340, 28).fill("#1e3a5f").stroke("#d4a017");
      doc.fillColor("#d4a017")
        .fontSize(14)
        .font("Helvetica-Bold")
        .text(scoreStr, badgeX - 10, 333, { width: 80, align: "center" });
      doc.fillColor("#94a3b8")
        .fontSize(7)
        .font("Helvetica")
        .text("SCORE", badgeX - 10, 352, { width: 80, align: "center" });
    }

    // ─── Footer row ───────────────────────────────────────────────────────────
    const footerY = H - 90;
    doc.moveTo(bm2, footerY).lineTo(W - bm2, footerY).lineWidth(0.5).stroke("#334155");

    const issueDateStr = new Date(data.issueDate).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
    const expiryStr = data.expiryDate
      ? new Date(data.expiryDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      : "No Expiry";

    // Left: Issue date
    doc.fillColor("#94a3b8").fontSize(8).font("Helvetica")
      .text("DATE OF ISSUE", 80, footerY + 12)
      .fillColor("#ffffff").fontSize(10).font("Helvetica-Bold")
      .text(issueDateStr, 80, footerY + 24);

    // Centre: Credential ID
    doc.fillColor("#94a3b8").fontSize(8).font("Helvetica")
      .text("CREDENTIAL ID", 0, footerY + 12, { align: "center" })
      .fillColor("#d4a017").fontSize(9).font("Helvetica-Bold")
      .text(data.credentialId, 0, footerY + 24, { align: "center" });

    // Right: Expiry
    doc.fillColor("#94a3b8").fontSize(8).font("Helvetica")
      .text("VALID UNTIL", W - 200, footerY + 12)
      .fillColor("#ffffff").fontSize(10).font("Helvetica-Bold")
      .text(expiryStr, W - 200, footerY + 24);

    // Skills chips
    if (data.skills && data.skills.length > 0) {
      let chipX = 80;
      const chipY = footerY - 28;
      doc.fillColor("#94a3b8").fontSize(7).font("Helvetica").text("SKILLS:", 80, chipY - 12);
      for (const skill of data.skills.slice(0, 6)) {
        doc.fontSize(7);
        const sw = doc.widthOfString(skill) + 12;
        doc.roundedRect(chipX, chipY, sw, 14, 4).fill("#1e293b").stroke("#334155");
        doc.fillColor("#94a3b8").fontSize(7).text(skill, chipX + 6, chipY + 3);
        chipX += sw + 6;
        if (chipX > W - 120) break;
      }
    }

    // Verify URL
    doc.fillColor("#475569").fontSize(7).font("Helvetica")
      .text(`Verify at: ${process.env.VITE_OAUTH_PORTAL_URL || "https://sdccertify.manus.space"}/verify/${data.credentialId}`, 0, H - 30, { align: "center" });

    doc.end();
  });
}
