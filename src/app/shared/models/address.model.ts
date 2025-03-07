export interface GetListProvinces {
  id: string;
  name: string;
}

export interface GetListDistricts {
  id: string;
  name: string;
  provinceId: string;
}

export interface GetListWards {
  id: string;
  name: string;
  districtId: string;
}
