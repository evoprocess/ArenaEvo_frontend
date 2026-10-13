import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const normalizeBrazilianWhatsapp = (value: unknown) => {
  if (typeof value !== 'string' && typeof value !== 'number') return null;

  const digits = String(value).replace(/\D/g, '');
  const internationalNumber = digits.startsWith('55') ? digits : `55${digits}`;

  return /^55[1-9][0-9][0-9]{8,9}$/.test(internationalNumber)
    ? internationalNumber
    : null;
};

export async function getCommercialWhatsappUrl() {
  const snapshot = await getDoc(doc(db, 'public', 'config'));
  if (!snapshot.exists()) return null;

  const number = normalizeBrazilianWhatsapp(snapshot.data().contatoWhatsappComercial);
  return number ? `https://wa.me/${number}` : null;
}
