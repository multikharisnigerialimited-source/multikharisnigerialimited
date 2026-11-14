export const SITE = {
  name: "Multikharis Nigeria Limited",
  shortName: "Multikharis",
  tagline: "LEARN • BUILD • GROW",
  address: "Shop D7, College of Education, Warri, Delta State, Nigeria.",
  phones: ["08106168576", "+234 812 882 9678"],
  phoneHrefs: ["tel:+2348106168576", "tel:+2348128829678"],
  whatsapp: "https://wa.me/2348128829678",
  email: "multikharisnigerialimited@gmail.com",
  mapEmbed:
    "https://www.google.com/maps?q=College+of+Education+Warri+Delta+State+Nigeria&output=embed",
  mapLink: "https://maps.google.com/?q=College+of+Education+Warri+Delta+State+Nigeria",
  /** Account that receives every card payment (configured as the settlement account in Paystack). */
  payout: { accountName: "MULTIKHARIS", accountNumber: "2032300125", bank: "First Bank" },
} as const;
