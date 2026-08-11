import { Contact } from '../types';

/**
 * Generates a standard vCard (.vcf) string representation for a Contact.
 */
export function generateVCard(contact: Contact): string {
  const nameParts = contact.name.trim().split(' ');
  const lastName = nameParts.length > 1 ? nameParts.pop() : '';
  const firstName = nameParts.join(' ');

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${lastName};${firstName};;;`,
    `FN:${contact.name}`,
  ];

  if (contact.company) {
    lines.push(`ORG:${contact.company}`);
  }

  if (contact.job_title) {
    lines.push(`TITLE:${contact.job_title}`);
  }

  if (contact.phone) {
    const cleanPhone = contact.phone.replace(/[^\d+]/g, '');
    lines.push(`TEL;TYPE=CELL,VOICE:${cleanPhone}`);
  }

  if (contact.secondary_phone) {
    const cleanPhone = contact.secondary_phone.replace(/[^\d+]/g, '');
    lines.push(`TEL;TYPE=WORK,VOICE:${cleanPhone}`);
  }

  if (contact.email) {
    lines.push(`EMAIL;TYPE=INTERNET,HOME:${contact.email}`);
  }

  if (contact.address) {
    lines.push(`ADR;TYPE=HOME:;;${contact.address};;;;`);
  }

  if (contact.birthday) {
    lines.push(`BDAY:${contact.birthday.replace(/-/g, '')}`);
  }

  if (contact.notes) {
    lines.push(`NOTE:${contact.notes.replace(/\n/g, '\\n')}`);
  }

  lines.push('END:VCARD');

  return lines.join('\r\n');
}

/**
 * Downloads a vCard file for a contact.
 */
export function downloadVCard(contact: Contact) {
  const vcardData = generateVCard(contact);
  const blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = `${contact.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.vcf`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Clean phone number for WhatsApp links (adds Brazilian country code 55 if needed)
 */
export function getWhatsAppLink(phone: string): string {
  let clean = phone.replace(/[^\d]/g, '');
  if (clean.length === 10 || clean.length === 11) {
    clean = '55' + clean;
  }
  return `https://wa.me/${clean}`;
}
