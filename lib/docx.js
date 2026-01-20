import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

function normalizeString(v) {
  if (v === null || v === undefined) return "";
  return String(v);
}

export function mapDevoteeToTemplateData(dev) {
  return {
    fullName: normalizeString(dev.fullName),
    relation: normalizeString(dev.relation),
    relationName: normalizeString(dev.relationName),
    gender: normalizeString(dev.gender),
    maritalStatus: normalizeString(dev.maritalStatus),
    address: normalizeString(dev.address),

    country: normalizeString(dev.country),
    state: normalizeString(dev.state),
    city: normalizeString(dev.city),

    profession: normalizeString(dev.profession),
    mobileNumber: normalizeString(dev.mobileNumber),
    whatsappNumber: normalizeString(dev.whatsappNumber),

    idType: normalizeString(dev.idType),
    idNumber: normalizeString(dev.idNumber),

    family: Array.isArray(dev.family)
      ? dev.family.map((f) => ({
          name: normalizeString(f.name),
          relation: normalizeString(f.relation),
          mobileNumber: normalizeString(f.mobileNumber),
        }))
      : [],

    printedOn: new Date().toLocaleDateString("en-GB"),
  };
}

export function renderDevoteeDocx(devoteeData) {
  const templatePath = path.join(process.cwd(), "templates", "devotee_template.docx");
  if (!fs.existsSync(templatePath)) {
    throw new Error(`DOCX template missing at: ${templatePath}`);
  }

  const content = fs.readFileSync(templatePath);
  const zip = new PizZip(content);

  let doc;
  try {
    doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });
  } catch (e) {
    console.error("[docx] init error", e);
    throw e;
  }

  const data = mapDevoteeToTemplateData(devoteeData);

  try {
    doc.render(data);
  } catch (e) {
    console.error("[docx] render error", e);
    throw e;
  }

  const out = doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  });

  return out; // Buffer
}
