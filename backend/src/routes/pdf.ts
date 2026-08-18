import { Router, Request, Response } from "express";
import PDFDocument from "pdfkit";

const router = Router();

router.get("/cours/suffixe-prefixe", (_req: Request, res: Response) => {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="cours_suffixe_prefixe.pdf"');
  doc.pipe(res);

  doc.fontSize(24).font("Helvetica-Bold").text("Cours : Suffixes et Préfixes", { align: "center" });
  doc.moveDown(2);

  doc.fontSize(16).fillColor("#2563eb").text("1. Définition");
  doc.moveDown(0.5);
  doc.fontSize(12).fillColor("#000");
  doc.text("Un préfixe est un élément qui se place avant le radical d'un mot pour en modifier le sens.");
  doc.text("Un suffixe est un élément qui se place après le radical d'un mot pour former un nouveau mot.");
  doc.moveDown(1.5);

  doc.fontSize(16).fillColor("#2563eb").text("2. Principaux Préfixes");
  doc.moveDown(0.5);
  doc.fontSize(12).fillColor("#000");
  const prefixes = [
    ["pré-", "avant", "préhistoire, prévoir"],
    ["post-", "après", "postopératoire, postdater"],
    ["anti-", "contre", "antivirus, anticonstitutionnel"],
    ["super-", "au-dessus", "supermarché, superpuissance"],
    ["sous-", "en dessous", "sous-marin, sous-estimer"],
    ["multi-", "plusieurs", "multinational, multicolore"],
    ["auto-", "soi-même", "automobile, automatique"],
    ["inter-", "entre", "international, interagir"],
    ["extra-", "au-delà", "extraordinaire, extraterrestre"],
    ["re-", "de nouveau", "refaire, recommencer"],
  ];
  prefixes.forEach(([p, sens, ex]) => {
    doc.text(`• ${p}  —  ${sens}  (ex: ${ex})`);
  });
  doc.moveDown(1.5);

  doc.fontSize(16).fillColor("#2563eb").text("3. Principaux Suffixes");
  doc.moveDown(0.5);
  doc.fontSize(12).fillColor("#000");
  const suffixes = [
    ["-tion", "action/résultat", "éducation, construction"],
    ["-ment", "action/résultat", "changement, développement"],
    ["-eur/-euse", "personne qui fait", "chanteur, danseuse"],
    ["-able/-ible", "possibilité", "mangeable, possible"],
    ["-iste", "partisan/profession", "artiste, journaliste"],
    ["-logie", "science/étude", "biologie, psychologie"],
    ["-phobie", "peur", "claustrophobie, arachnophobie"],
    ["-scope", "instrument d'observation", "microscope, télescope"],
    ["-ment", "adverbe", "rapidement, heureusement"],
    ["-erie", "lieu/qualité", "boulangerie, supercherie"],
  ];
  suffixes.forEach(([s, sens, ex]) => {
    doc.text(`• ${s}  —  ${sens}  (ex: ${ex})`);
  });
  doc.moveDown(1.5);

  doc.fontSize(16).fillColor("#2563eb").text("4. Exercices");
  doc.moveDown(0.5);
  doc.fontSize(12).fillColor("#000");
  doc.text("1. Ajoute un préfixe à \"faire\" pour former un nouveau mot.");
  doc.text("2. Ajoute un suffixe à \"danse\" pour former un nom de personne.");
  doc.text("3. Quel est le préfixe dans \"international\" ?");
  doc.text("4. Quel est le suffixe dans \"rapidement\" ?");
  doc.text("5. Forme un mot avec le préfixe \"anti-\".");
  doc.moveDown(2);

  doc.fontSize(10).fillColor("#666").text("Généré par Jisser — Plateforme de financement étudiant", { align: "center" });

  doc.end();
});

export default router;
