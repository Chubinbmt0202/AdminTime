import { removeVietnameseTones } from '../../../utils/string';

export function generateUsername(fullName: string): string {
    const cleaned = removeVietnameseTones(fullName).toLowerCase();
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';

    const firstName = parts[parts.length - 1];
    const abbrev = parts.slice(0, -1).map(p => p[0]).join('');
    const base = abbrev ? `${firstName}.${abbrev}` : firstName;
    const rand = Math.floor(1000 + Math.random() * 9000);

    return `${base}${rand}`.replace(/[^a-z0-9_.]/g, '');
}