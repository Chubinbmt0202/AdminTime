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

export interface WifiConfig {
    id_wifi: string | number;
    id_van_phong: string | number;
    locationname?: string;
    address?: string;
    wifiName: string;
    wifiAddress: string;
    status?: 'active' | 'inactive';
}

export interface AddWifiPayload {
    id_van_phong: number | string;
    wifiName: string;
    wifiAddress: string;
}
