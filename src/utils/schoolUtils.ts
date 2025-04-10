interface SchoolInfo {
  name: string;
  address: string;
  logo?: string;
}

export const getSchoolInfo = (): SchoolInfo => ({
  name: import.meta.env.VITE_SCHOOL_NAME || 'Your School Name',
  address: import.meta.env.VITE_SCHOOL_ADDRESS || 'Your School Address',
});