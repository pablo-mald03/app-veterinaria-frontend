//Room list item
export interface RoomResponse {
    id: number;
    name: string;
    location: string;
    number: number;
    status: boolean;
}

//Complete room detail (the list does not include the description)
export interface RoomDetailResponse extends RoomResponse {
    description: string;
}

//Create / update body
export interface RoomRequest {
    name: string;
    location: string;
    description: string;
    number: number;
}

//Create / update response
export interface RoomSavedResponse {
    id: number;
    name: string;
    number: number;
}

//Status change response
export interface RoomStatusResponse {
    id: number;
    status: boolean;
}

//Room filters
export interface RoomFilters {
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: "asc" | "desc";
    name?: string;
    location?: string;
    number?: number;
    status?: boolean;
}
