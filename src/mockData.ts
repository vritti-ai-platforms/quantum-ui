/**
 * Mock data for testing SingleSelect component with API integration
 */

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  department?: string;
}

export interface MockDepartment {
  id: string;
  name: string;
  description: string;
  headCount: number;
}

export interface MockCountry {
  id: string;
  name: string;
  code: string;
  continent: string;
  population: number;
}

// Mock users dataset (50+ entries for pagination testing)
export const mockUsers: MockUser[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice.johnson@example.com', role: 'admin', department: 'Engineering' },
  { id: '2', name: 'Bob Smith', email: 'bob.smith@example.com', role: 'user', department: 'Marketing' },
  { id: '3', name: 'Carol Davis', email: 'carol.davis@example.com', role: 'manager', department: 'Sales' },
  { id: '4', name: 'David Wilson', email: 'david.wilson@example.com', role: 'user', department: 'Engineering' },
  { id: '5', name: 'Emma Brown', email: 'emma.brown@example.com', role: 'admin', department: 'HR' },
  { id: '6', name: 'Frank Miller', email: 'frank.miller@example.com', role: 'user', department: 'Finance' },
  { id: '7', name: 'Grace Lee', email: 'grace.lee@example.com', role: 'manager', department: 'Engineering' },
  { id: '8', name: 'Henry Taylor', email: 'henry.taylor@example.com', role: 'user', department: 'Marketing' },
  { id: '9', name: 'Iris Martinez', email: 'iris.martinez@example.com', role: 'admin', department: 'Sales' },
  { id: '10', name: 'Jack Anderson', email: 'jack.anderson@example.com', role: 'user', department: 'Engineering' },
  { id: '11', name: 'Kelly Thomas', email: 'kelly.thomas@example.com', role: 'manager', department: 'HR' },
  { id: '12', name: 'Leo Jackson', email: 'leo.jackson@example.com', role: 'user', department: 'Finance' },
  { id: '13', name: 'Maria White', email: 'maria.white@example.com', role: 'admin', department: 'Marketing' },
  { id: '14', name: 'Nathan Harris', email: 'nathan.harris@example.com', role: 'user', department: 'Engineering' },
  { id: '15', name: 'Olivia Martin', email: 'olivia.martin@example.com', role: 'manager', department: 'Sales' },
  { id: '16', name: 'Paul Thompson', email: 'paul.thompson@example.com', role: 'user', department: 'HR' },
  { id: '17', name: 'Quinn Garcia', email: 'quinn.garcia@example.com', role: 'admin', department: 'Finance' },
  { id: '18', name: 'Rachel Martinez', email: 'rachel.martinez@example.com', role: 'user', department: 'Engineering' },
  { id: '19', name: 'Sam Robinson', email: 'sam.robinson@example.com', role: 'manager', department: 'Marketing' },
  { id: '20', name: 'Tina Clark', email: 'tina.clark@example.com', role: 'user', department: 'Sales' },
  { id: '21', name: 'Uma Rodriguez', email: 'uma.rodriguez@example.com', role: 'admin', department: 'HR' },
  { id: '22', name: 'Victor Lewis', email: 'victor.lewis@example.com', role: 'user', department: 'Engineering' },
  { id: '23', name: 'Wendy Walker', email: 'wendy.walker@example.com', role: 'manager', department: 'Finance' },
  { id: '24', name: 'Xavier Hall', email: 'xavier.hall@example.com', role: 'user', department: 'Marketing' },
  { id: '25', name: 'Yara Allen', email: 'yara.allen@example.com', role: 'admin', department: 'Sales' },
  { id: '26', name: 'Zack Young', email: 'zack.young@example.com', role: 'user', department: 'Engineering' },
  { id: '27', name: 'Amy Hernandez', email: 'amy.hernandez@example.com', role: 'manager', department: 'HR' },
  { id: '28', name: 'Ben King', email: 'ben.king@example.com', role: 'user', department: 'Finance' },
  { id: '29', name: 'Cathy Wright', email: 'cathy.wright@example.com', role: 'admin', department: 'Marketing' },
  { id: '30', name: 'Dan Lopez', email: 'dan.lopez@example.com', role: 'user', department: 'Engineering' },
  { id: '31', name: 'Eva Hill', email: 'eva.hill@example.com', role: 'manager', department: 'Sales' },
  { id: '32', name: 'Fred Scott', email: 'fred.scott@example.com', role: 'user', department: 'HR' },
  { id: '33', name: 'Gina Green', email: 'gina.green@example.com', role: 'admin', department: 'Finance' },
  { id: '34', name: 'Hank Adams', email: 'hank.adams@example.com', role: 'user', department: 'Engineering' },
  { id: '35', name: 'Ivy Baker', email: 'ivy.baker@example.com', role: 'manager', department: 'Marketing' },
  { id: '36', name: 'John Gonzalez', email: 'john.gonzalez@example.com', role: 'user', department: 'Sales' },
  { id: '37', name: 'Kate Nelson', email: 'kate.nelson@example.com', role: 'admin', department: 'HR' },
  { id: '38', name: 'Liam Carter', email: 'liam.carter@example.com', role: 'user', department: 'Engineering' },
  { id: '39', name: 'Mia Mitchell', email: 'mia.mitchell@example.com', role: 'manager', department: 'Finance' },
  { id: '40', name: 'Noah Perez', email: 'noah.perez@example.com', role: 'user', department: 'Marketing' },
  { id: '41', name: 'Ola Roberts', email: 'ola.roberts@example.com', role: 'admin', department: 'Sales' },
  { id: '42', name: 'Pete Turner', email: 'pete.turner@example.com', role: 'user', department: 'Engineering' },
  { id: '43', name: 'Ruby Phillips', email: 'ruby.phillips@example.com', role: 'manager', department: 'HR' },
  { id: '44', name: 'Steve Campbell', email: 'steve.campbell@example.com', role: 'user', department: 'Finance' },
  { id: '45', name: 'Tara Parker', email: 'tara.parker@example.com', role: 'admin', department: 'Marketing' },
  { id: '46', name: 'Umar Evans', email: 'umar.evans@example.com', role: 'user', department: 'Engineering' },
  { id: '47', name: 'Vera Edwards', email: 'vera.edwards@example.com', role: 'manager', department: 'Sales' },
  { id: '48', name: 'Will Collins', email: 'will.collins@example.com', role: 'user', department: 'HR' },
  { id: '49', name: 'Xena Stewart', email: 'xena.stewart@example.com', role: 'admin', department: 'Finance' },
  { id: '50', name: 'Yale Sanchez', email: 'yale.sanchez@example.com', role: 'user', department: 'Engineering' },
];

// Mock departments dataset (20+ entries)
export const mockDepartments: MockDepartment[] = [
  { id: '1', name: 'Engineering', description: 'Software Development & IT', headCount: 45 },
  { id: '2', name: 'Marketing', description: 'Brand & Communications', headCount: 25 },
  { id: '3', name: 'Sales', description: 'Revenue & Business Development', headCount: 30 },
  { id: '4', name: 'Human Resources', description: 'People & Culture', headCount: 12 },
  { id: '5', name: 'Finance', description: 'Accounting & Financial Planning', headCount: 18 },
  { id: '6', name: 'Product Management', description: 'Product Strategy & Planning', headCount: 15 },
  { id: '7', name: 'Customer Success', description: 'Customer Support & Relations', headCount: 22 },
  { id: '8', name: 'Operations', description: 'Business Operations & Logistics', headCount: 20 },
  { id: '9', name: 'Legal', description: 'Legal & Compliance', headCount: 8 },
  { id: '10', name: 'Design', description: 'UX/UI Design & Creative', headCount: 14 },
  { id: '11', name: 'Data Science', description: 'Analytics & Machine Learning', headCount: 16 },
  { id: '12', name: 'DevOps', description: 'Infrastructure & Deployment', headCount: 10 },
  { id: '13', name: 'Quality Assurance', description: 'Testing & Quality Control', headCount: 12 },
  { id: '14', name: 'Security', description: 'Information Security', headCount: 9 },
  { id: '15', name: 'Research & Development', description: 'Innovation & Research', headCount: 11 },
  { id: '16', name: 'Procurement', description: 'Purchasing & Vendor Management', headCount: 7 },
  { id: '17', name: 'Facilities', description: 'Office & Facility Management', headCount: 6 },
  { id: '18', name: 'Training', description: 'Learning & Development', headCount: 5 },
  { id: '19', name: 'Public Relations', description: 'Media & Public Affairs', headCount: 8 },
  { id: '20', name: 'Business Intelligence', description: 'Data Analysis & Reporting', headCount: 10 },
];

// Mock countries dataset (100+ entries for pagination)
export const mockCountries: MockCountry[] = [
  { id: '1', name: 'United States', code: 'US', continent: 'North America', population: 331900000 },
  { id: '2', name: 'China', code: 'CN', continent: 'Asia', population: 1441000000 },
  { id: '3', name: 'India', code: 'IN', continent: 'Asia', population: 1393000000 },
  { id: '4', name: 'Indonesia', code: 'ID', continent: 'Asia', population: 273500000 },
  { id: '5', name: 'Pakistan', code: 'PK', continent: 'Asia', population: 225200000 },
  { id: '6', name: 'Brazil', code: 'BR', continent: 'South America', population: 213900000 },
  { id: '7', name: 'Nigeria', code: 'NG', continent: 'Africa', population: 211400000 },
  { id: '8', name: 'Bangladesh', code: 'BD', continent: 'Asia', population: 166300000 },
  { id: '9', name: 'Russia', code: 'RU', continent: 'Europe', population: 145900000 },
  { id: '10', name: 'Mexico', code: 'MX', continent: 'North America', population: 130200000 },
  { id: '11', name: 'Japan', code: 'JP', continent: 'Asia', population: 125800000 },
  { id: '12', name: 'Ethiopia', code: 'ET', continent: 'Africa', population: 117900000 },
  { id: '13', name: 'Philippines', code: 'PH', continent: 'Asia', population: 111000000 },
  { id: '14', name: 'Egypt', code: 'EG', continent: 'Africa', population: 104300000 },
  { id: '15', name: 'Vietnam', code: 'VN', continent: 'Asia', population: 98200000 },
  { id: '16', name: 'Congo', code: 'CD', continent: 'Africa', population: 92400000 },
  { id: '17', name: 'Turkey', code: 'TR', continent: 'Asia', population: 85000000 },
  { id: '18', name: 'Iran', code: 'IR', continent: 'Asia', population: 85000000 },
  { id: '19', name: 'Germany', code: 'DE', continent: 'Europe', population: 83200000 },
  { id: '20', name: 'Thailand', code: 'TH', continent: 'Asia', population: 69900000 },
  { id: '21', name: 'United Kingdom', code: 'GB', continent: 'Europe', population: 68200000 },
  { id: '22', name: 'France', code: 'FR', continent: 'Europe', population: 65400000 },
  { id: '23', name: 'Italy', code: 'IT', continent: 'Europe', population: 60400000 },
  { id: '24', name: 'Tanzania', code: 'TZ', continent: 'Africa', population: 61500000 },
  { id: '25', name: 'South Africa', code: 'ZA', continent: 'Africa', population: 60000000 },
  { id: '26', name: 'Myanmar', code: 'MM', continent: 'Asia', population: 54800000 },
  { id: '27', name: 'Kenya', code: 'KE', continent: 'Africa', population: 54000000 },
  { id: '28', name: 'South Korea', code: 'KR', continent: 'Asia', population: 51300000 },
  { id: '29', name: 'Colombia', code: 'CO', continent: 'South America', population: 51300000 },
  { id: '30', name: 'Spain', code: 'ES', continent: 'Europe', population: 46800000 },
  { id: '31', name: 'Argentina', code: 'AR', continent: 'South America', population: 45600000 },
  { id: '32', name: 'Algeria', code: 'DZ', continent: 'Africa', population: 44600000 },
  { id: '33', name: 'Sudan', code: 'SD', continent: 'Africa', population: 44900000 },
  { id: '34', name: 'Uganda', code: 'UG', continent: 'Africa', population: 47100000 },
  { id: '35', name: 'Ukraine', code: 'UA', continent: 'Europe', population: 43700000 },
  { id: '36', name: 'Iraq', code: 'IQ', continent: 'Asia', population: 41200000 },
  { id: '37', name: 'Afghanistan', code: 'AF', continent: 'Asia', population: 39800000 },
  { id: '38', name: 'Poland', code: 'PL', continent: 'Europe', population: 37800000 },
  { id: '39', name: 'Canada', code: 'CA', continent: 'North America', population: 38000000 },
  { id: '40', name: 'Morocco', code: 'MA', continent: 'Africa', population: 37300000 },
  { id: '41', name: 'Saudi Arabia', code: 'SA', continent: 'Asia', population: 35000000 },
  { id: '42', name: 'Uzbekistan', code: 'UZ', continent: 'Asia', population: 33900000 },
  { id: '43', name: 'Peru', code: 'PE', continent: 'South America', population: 33400000 },
  { id: '44', name: 'Angola', code: 'AO', continent: 'Africa', population: 33900000 },
  { id: '45', name: 'Malaysia', code: 'MY', continent: 'Asia', population: 32700000 },
  { id: '46', name: 'Mozambique', code: 'MZ', continent: 'Africa', population: 32200000 },
  { id: '47', name: 'Ghana', code: 'GH', continent: 'Africa', population: 31700000 },
  { id: '48', name: 'Yemen', code: 'YE', continent: 'Asia', population: 30500000 },
  { id: '49', name: 'Nepal', code: 'NP', continent: 'Asia', population: 29700000 },
  { id: '50', name: 'Venezuela', code: 'VE', continent: 'South America', population: 28400000 },
  { id: '51', name: 'Madagascar', code: 'MG', continent: 'Africa', population: 28400000 },
  { id: '52', name: 'Cameroon', code: 'CM', continent: 'Africa', population: 27200000 },
  { id: '53', name: 'Ivory Coast', code: 'CI', continent: 'Africa', population: 27000000 },
  { id: '54', name: 'Niger', code: 'NE', continent: 'Africa', population: 25300000 },
  { id: '55', name: 'Australia', code: 'AU', continent: 'Oceania', population: 25700000 },
  { id: '56', name: 'North Korea', code: 'KP', continent: 'Asia', population: 25800000 },
  { id: '57', name: 'Taiwan', code: 'TW', continent: 'Asia', population: 23600000 },
  { id: '58', name: 'Mali', code: 'ML', continent: 'Africa', population: 20900000 },
  { id: '59', name: 'Burkina Faso', code: 'BF', continent: 'Africa', population: 21500000 },
  { id: '60', name: 'Sri Lanka', code: 'LK', continent: 'Asia', population: 21400000 },
  { id: '61', name: 'Malawi', code: 'MW', continent: 'Africa', population: 19600000 },
  { id: '62', name: 'Zambia', code: 'ZM', continent: 'Africa', population: 18900000 },
  { id: '63', name: 'Romania', code: 'RO', continent: 'Europe', population: 19200000 },
  { id: '64', name: 'Chile', code: 'CL', continent: 'South America', population: 19200000 },
  { id: '65', name: 'Kazakhstan', code: 'KZ', continent: 'Asia', population: 19000000 },
  { id: '66', name: 'Ecuador', code: 'EC', continent: 'South America', population: 17900000 },
  { id: '67', name: 'Netherlands', code: 'NL', continent: 'Europe', population: 17400000 },
  { id: '68', name: 'Cambodia', code: 'KH', continent: 'Asia', population: 16900000 },
  { id: '69', name: 'Senegal', code: 'SN', continent: 'Africa', population: 17200000 },
  { id: '70', name: 'Chad', code: 'TD', continent: 'Africa', population: 16900000 },
  { id: '71', name: 'Somalia', code: 'SO', continent: 'Africa', population: 16400000 },
  { id: '72', name: 'Zimbabwe', code: 'ZW', continent: 'Africa', population: 15100000 },
  { id: '73', name: 'Guinea', code: 'GN', continent: 'Africa', population: 13500000 },
  { id: '74', name: 'Rwanda', code: 'RW', continent: 'Africa', population: 13300000 },
  { id: '75', name: 'Benin', code: 'BJ', continent: 'Africa', population: 12500000 },
  { id: '76', name: 'Burundi', code: 'BI', continent: 'Africa', population: 12300000 },
  { id: '77', name: 'Tunisia', code: 'TN', continent: 'Africa', population: 12000000 },
  { id: '78', name: 'Bolivia', code: 'BO', continent: 'South America', population: 11800000 },
  { id: '79', name: 'Belgium', code: 'BE', continent: 'Europe', population: 11600000 },
  { id: '80', name: 'Haiti', code: 'HT', continent: 'North America', population: 11500000 },
  { id: '81', name: 'Cuba', code: 'CU', continent: 'North America', population: 11300000 },
  { id: '82', name: 'South Sudan', code: 'SS', continent: 'Africa', population: 11400000 },
  { id: '83', name: 'Dominican Republic', code: 'DO', continent: 'North America', population: 11000000 },
  { id: '84', name: 'Czech Republic', code: 'CZ', continent: 'Europe', population: 10700000 },
  { id: '85', name: 'Greece', code: 'GR', continent: 'Europe', population: 10400000 },
  { id: '86', name: 'Jordan', code: 'JO', continent: 'Asia', population: 10300000 },
  { id: '87', name: 'Portugal', code: 'PT', continent: 'Europe', population: 10200000 },
  { id: '88', name: 'Azerbaijan', code: 'AZ', continent: 'Asia', population: 10200000 },
  { id: '89', name: 'Sweden', code: 'SE', continent: 'Europe', population: 10400000 },
  { id: '90', name: 'Honduras', code: 'HN', continent: 'North America', population: 10100000 },
  { id: '91', name: 'United Arab Emirates', code: 'AE', continent: 'Asia', population: 9900000 },
  { id: '92', name: 'Hungary', code: 'HU', continent: 'Europe', population: 9700000 },
  { id: '93', name: 'Tajikistan', code: 'TJ', continent: 'Asia', population: 9700000 },
  { id: '94', name: 'Belarus', code: 'BY', continent: 'Europe', population: 9400000 },
  { id: '95', name: 'Austria', code: 'AT', continent: 'Europe', population: 9000000 },
  { id: '96', name: 'Papua New Guinea', code: 'PG', continent: 'Oceania', population: 9100000 },
  { id: '97', name: 'Serbia', code: 'RS', continent: 'Europe', population: 8700000 },
  { id: '98', name: 'Israel', code: 'IL', continent: 'Asia', population: 8700000 },
  { id: '99', name: 'Switzerland', code: 'CH', continent: 'Europe', population: 8700000 },
  { id: '100', name: 'Togo', code: 'TG', continent: 'Africa', population: 8500000 },
];

// Options for form testing
export const roleOptions = [
  { label: 'Software Engineer', value: 'engineer' },
  { label: 'Product Manager', value: 'product_manager' },
  { label: 'Designer', value: 'designer' },
  { label: 'Data Analyst', value: 'analyst' },
  { label: 'Marketing Manager', value: 'marketing' },
];

export const departmentOptions = [
  { label: 'Engineering', value: 'engineering' },
  { label: 'Product', value: 'product' },
  { label: 'Design', value: 'design' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Sales', value: 'sales' },
  { label: 'Customer Success', value: 'customer_success' },
];
