export interface Profile {
  id: string;
  name: string;
  createdAt: string;
}

export interface Medication {
  id: string;
  profileId: string;
  name: string;
  dose: string;
  route: MedicationRoute;
  times: string[];
  notes?: string;
  createdAt: string;
}

export interface MedicationLog {
  id: string;
  profileId: string;
  medicationId: string;
  scheduledTime: string;
  taken: boolean;
  takenTime?: string;
  date: string;
}

export type MedicationRoute =
  | 'Tablet'
  | 'Spoon/Syrup'
  | 'Intramuscular Injection'
  | 'Intravenous Injection'
  | 'Inhaler'
  | 'Drop'
  | 'Cream';

export const MEDICATION_ROUTES: MedicationRoute[] = [
  'Tablet',
  'Spoon/Syrup',
  'Intramuscular Injection',
  'Intravenous Injection',
  'Inhaler',
  'Drop',
  'Cream',
];

export const getRouteTranslationKey = (route: MedicationRoute): string => {
  const routeMap: Record<MedicationRoute, string> = {
    'Tablet': 'tablet',
    'Spoon/Syrup': 'syrup',
    'Intramuscular Injection': 'intramuscular',
    'Intravenous Injection': 'intravenous',
    'Inhaler': 'inhaler',
    'Drop': 'drop',
    'Cream': 'cream',
  };
  return routeMap[route];
};
