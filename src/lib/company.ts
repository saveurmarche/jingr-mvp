/** Identité légale de l'éditeur de jingr (pages légales, contact). */
const TODO = "[à compléter]";

export const company = {
  name: process.env.COMPANY_NAME || TODO,
  form: process.env.COMPANY_FORM || TODO,
  siret: process.env.COMPANY_SIRET || TODO,
  address: process.env.COMPANY_ADDRESS || TODO,
  email: process.env.CONTACT_EMAIL || "contact@jingr.ai",
  director: process.env.PUBLICATION_DIRECTOR || TODO,
};

export const companyIncomplete = Object.values(company).includes(TODO);
