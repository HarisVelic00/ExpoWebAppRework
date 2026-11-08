export type Expo = {
  id: number;
  title: string | null;
  description: string | null;
  date_of_opening: string;
  date_of_closing: string;
  work_hours_opening: string | null;
  work_hours_closing: string | null;
  organiser_id: number | null;
  location_id: number | null;
  industry_id: number;
};

export type Industry = {
  id: number;
  name: string | null;
};

export type Location = {
  id: number;
  address: string | null;
  city: string | null;
  zip_code: string;
};

export type ExpoFormData = {
  title: string;
  description: string;
  date_of_opening: string;
  date_of_closing: string;
  work_hours_opening: string;
  work_hours_closing: string;
  location_id: string;
  industry_id: string;
};
