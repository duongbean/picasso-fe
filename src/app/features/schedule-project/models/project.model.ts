export interface GetListProjectsRequest {
  startTime: string;
  endTime: string;
}

export interface GetListRoomResponse {
  id: string;
  name: string;
  isActive: boolean;
}
export interface TypeProject {
  id: string;
  name: string;
}
export interface SlotTime {
  id: number;
  time: string;
}

export interface RequestCreateProject {
  name: string;
  startTime: string;
  endTime: string;
  customerId: string;
  employeeId: string;
  roomId: string;
}

export interface RequestGetListPhotographersValid {
  startTime: string;
  endTime: string;
}
export interface RequestGetListRoomsValid {
  startTime: string;
  endTime: string;
}

export interface GetListProjectsResponse {
  customerID: string;
  customerName: string;
  employeeID: string;
  endTime: string;
  id: string;
  name: string;
  roomID: string;
  startTime: string;
  status: string;
  updatedBy: string;
}
export interface ResponseGetListProjects {
  projectInfo: ProjectDetails;
  albumCount: number;
  firstThumbnail: string;
  photographer: PersonDetails;
  photographerEmail: string;
  photographerAvatar: string;
  saler: PersonDetails;
  salerEmail: string;
  customer: PersonDetails;
  customerEmail: string;
}

export interface PersonDetails {
  firstName: string;
  middleName: string;
  lastName: string;
}

export interface ProjectDetails {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  status: string;
  customerID: string;
  customerName: string | null;
  employeeID: string;
  roomID: string;
  updatedBy: string;
  roomName: string;
  createdBy: string;
  nameUserCreate: string;
  nameUserUpdate: string;
}
