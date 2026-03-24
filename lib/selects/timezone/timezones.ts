import type { SelectOption } from '../../components/Select/types';

export const TIMEZONES: SelectOption[] = [
  // UTC
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },

  // Africa
  { value: 'Africa/Cairo', label: 'Cairo (UTC+2:00)' },
  { value: 'Africa/Casablanca', label: 'Casablanca (UTC+1:00)' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (UTC+2:00)' },
  { value: 'Africa/Lagos', label: 'Lagos (UTC+1:00)' },
  { value: 'Africa/Nairobi', label: 'Nairobi (UTC+3:00)' },

  // America — North
  { value: 'America/Anchorage', label: 'Anchorage (UTC-9:00)' },
  { value: 'America/Chicago', label: 'Chicago (UTC-6:00)' },
  { value: 'America/Denver', label: 'Denver (UTC-7:00)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (UTC-8:00)' },
  { value: 'America/Mexico_City', label: 'Mexico City (UTC-6:00)' },
  { value: 'America/New_York', label: 'New York (UTC-5:00)' },
  { value: 'America/Phoenix', label: 'Phoenix (UTC-7:00)' },
  { value: 'America/Toronto', label: 'Toronto (UTC-5:00)' },
  { value: 'America/Vancouver', label: 'Vancouver (UTC-8:00)' },

  // America — Central
  { value: 'America/Costa_Rica', label: 'Costa Rica (UTC-6:00)' },
  { value: 'America/Guatemala', label: 'Guatemala (UTC-6:00)' },
  { value: 'America/Havana', label: 'Havana (UTC-5:00)' },
  { value: 'America/Jamaica', label: 'Jamaica (UTC-5:00)' },
  { value: 'America/Panama', label: 'Panama (UTC-5:00)' },

  // America — South
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (UTC-3:00)' },
  { value: 'America/Bogota', label: 'Bogota (UTC-5:00)' },
  { value: 'America/Caracas', label: 'Caracas (UTC-4:00)' },
  { value: 'America/Lima', label: 'Lima (UTC-5:00)' },
  { value: 'America/Santiago', label: 'Santiago (UTC-4:00)' },
  { value: 'America/Sao_Paulo', label: 'Sao Paulo (UTC-3:00)' },

  // Asia — East
  { value: 'Asia/Bangkok', label: 'Bangkok (UTC+7:00)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (UTC+8:00)' },
  { value: 'Asia/Jakarta', label: 'Jakarta (UTC+7:00)' },
  { value: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur (UTC+8:00)' },
  { value: 'Asia/Manila', label: 'Manila (UTC+8:00)' },
  { value: 'Asia/Seoul', label: 'Seoul (UTC+9:00)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (UTC+8:00)' },
  { value: 'Asia/Singapore', label: 'Singapore (UTC+8:00)' },
  { value: 'Asia/Taipei', label: 'Taipei (UTC+8:00)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (UTC+9:00)' },

  // Asia — South
  { value: 'Asia/Colombo', label: 'Colombo (UTC+5:30)' },
  { value: 'Asia/Dhaka', label: 'Dhaka (UTC+6:00)' },
  { value: 'Asia/Karachi', label: 'Karachi (UTC+5:00)' },
  { value: 'Asia/Kathmandu', label: 'Kathmandu (UTC+5:45)' },
  { value: 'Asia/Kolkata', label: 'Kolkata (UTC+5:30)' },

  // Asia — Middle East
  { value: 'Asia/Dubai', label: 'Dubai (UTC+4:00)' },
  { value: 'Asia/Jerusalem', label: 'Jerusalem (UTC+2:00)' },
  { value: 'Asia/Kuwait', label: 'Kuwait (UTC+3:00)' },
  { value: 'Asia/Riyadh', label: 'Riyadh (UTC+3:00)' },
  { value: 'Asia/Tehran', label: 'Tehran (UTC+3:30)' },

  // Asia — Central
  { value: 'Asia/Almaty', label: 'Almaty (UTC+6:00)' },
  { value: 'Asia/Baku', label: 'Baku (UTC+4:00)' },
  { value: 'Asia/Tashkent', label: 'Tashkent (UTC+5:00)' },
  { value: 'Asia/Tbilisi', label: 'Tbilisi (UTC+4:00)' },
  { value: 'Asia/Yerevan', label: 'Yerevan (UTC+4:00)' },

  // Atlantic
  { value: 'Atlantic/Azores', label: 'Azores (UTC-1:00)' },
  { value: 'Atlantic/Bermuda', label: 'Bermuda (UTC-4:00)' },
  { value: 'Atlantic/Cape_Verde', label: 'Cape Verde (UTC-1:00)' },
  { value: 'Atlantic/Reykjavik', label: 'Reykjavik (UTC+0:00)' },

  // Australia
  { value: 'Australia/Adelaide', label: 'Adelaide (UTC+9:30)' },
  { value: 'Australia/Brisbane', label: 'Brisbane (UTC+10:00)' },
  { value: 'Australia/Darwin', label: 'Darwin (UTC+9:30)' },
  { value: 'Australia/Melbourne', label: 'Melbourne (UTC+10:00)' },
  { value: 'Australia/Perth', label: 'Perth (UTC+8:00)' },
  { value: 'Australia/Sydney', label: 'Sydney (UTC+10:00)' },

  // Europe — West
  { value: 'Europe/Dublin', label: 'Dublin (UTC+0:00)' },
  { value: 'Europe/Lisbon', label: 'Lisbon (UTC+0:00)' },
  { value: 'Europe/London', label: 'London (UTC+0:00)' },

  // Europe — Central
  { value: 'Europe/Amsterdam', label: 'Amsterdam (UTC+1:00)' },
  { value: 'Europe/Berlin', label: 'Berlin (UTC+1:00)' },
  { value: 'Europe/Brussels', label: 'Brussels (UTC+1:00)' },
  { value: 'Europe/Copenhagen', label: 'Copenhagen (UTC+1:00)' },
  { value: 'Europe/Madrid', label: 'Madrid (UTC+1:00)' },
  { value: 'Europe/Oslo', label: 'Oslo (UTC+1:00)' },
  { value: 'Europe/Paris', label: 'Paris (UTC+1:00)' },
  { value: 'Europe/Prague', label: 'Prague (UTC+1:00)' },
  { value: 'Europe/Rome', label: 'Rome (UTC+1:00)' },
  { value: 'Europe/Stockholm', label: 'Stockholm (UTC+1:00)' },
  { value: 'Europe/Vienna', label: 'Vienna (UTC+1:00)' },
  { value: 'Europe/Warsaw', label: 'Warsaw (UTC+1:00)' },
  { value: 'Europe/Zurich', label: 'Zurich (UTC+1:00)' },

  // Europe — East
  { value: 'Europe/Athens', label: 'Athens (UTC+2:00)' },
  { value: 'Europe/Bucharest', label: 'Bucharest (UTC+2:00)' },
  { value: 'Europe/Helsinki', label: 'Helsinki (UTC+2:00)' },
  { value: 'Europe/Istanbul', label: 'Istanbul (UTC+3:00)' },
  { value: 'Europe/Kyiv', label: 'Kyiv (UTC+2:00)' },
  { value: 'Europe/Moscow', label: 'Moscow (UTC+3:00)' },
  { value: 'Europe/Sofia', label: 'Sofia (UTC+2:00)' },

  // Pacific
  { value: 'Pacific/Auckland', label: 'Auckland (UTC+12:00)' },
  { value: 'Pacific/Fiji', label: 'Fiji (UTC+12:00)' },
  { value: 'Pacific/Guam', label: 'Guam (UTC+10:00)' },
  { value: 'Pacific/Honolulu', label: 'Honolulu (UTC-10:00)' },
  { value: 'Pacific/Pago_Pago', label: 'Pago Pago (UTC-11:00)' },
  { value: 'Pacific/Port_Moresby', label: 'Port Moresby (UTC+10:00)' },
  { value: 'Pacific/Tongatapu', label: 'Tongatapu (UTC+13:00)' },
];
