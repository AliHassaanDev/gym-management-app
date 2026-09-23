// PKR currency formatter
export const formatPKR = (amount: number): string => {
  return `PKR ${amount.toLocaleString('en-PK')}`;
};

// Format date as DD-MM-YYYY
export const formatDate = (isoDate: string): string => {
  const d = new Date(isoDate);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

// Format datetime as DD MMM YYYY • HH:MM AM/PM
export const formatDateTime = (isoDate: string): string => {
  const d = new Date(isoDate);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const day = String(d.getDate()).padStart(2, '0');
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${day} ${month} ${year} • ${hours}:${minutes} ${ampm}`;
};

// Add days to a date string, returns ISO date string
export const addDays = (isoDate: string, days: number): string => {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

// Check if a date is overdue
export const isOverdue = (dueDateIso: string): boolean => {
  return new Date(dueDateIso) < new Date();
};

// Days remaining until due date
export const daysUntilDue = (dueDateIso: string): number => {
  const diff = new Date(dueDateIso).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Generate member number like G001
export const generateMemberNumber = (count: number): string => {
  return `G${String(count).padStart(3, '0')}`;
};

// Get initials from name
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
