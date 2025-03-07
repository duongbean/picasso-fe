export interface GetAllProvincesRequest {
  limit: number;
}

export interface GetAllDistrictsByProvinceCodeRequest {
  provinceCode: string;
  limit: number;
}

export interface GetAllWardsByDistrictCodeRequest {
  districtCode: string;
  limit: number;
}
