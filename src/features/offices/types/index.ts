export interface Office {
    id_van_phong: number;
    locationname: string;
    address: string;
    id_gps: number | null;
    longitude: string | null;
    latitude: string | null;
    radius: number | null;
}

export interface AddOfficeGPSPayload {
    locationName: string;
    address: string;
    longitude: string;
    latitude: string;
    radius: number;
}
