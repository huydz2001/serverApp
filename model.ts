interface ResidentInfo {
    fullName: string,
    date_of_birth?: Date;
    phone_number: string;
    personal_identification_number: string;
    permanent_address: string;
    gender: string;
    portrait_url?: string;
    email: string;
    check_in_date?: Date,
    payments: Bill[]
}

interface Bill {
    name: string,
    amount: number,
    isPayment: boolean,
    type: "water" | " electricity" | "rent" | "other"
}

interface Room {
    id: number;
    name: string;
    floor?: number;
    status: "Occupied" | "Vacant";
    user_id?: string;
    resident: ResidentInfo
}


interface UtilityInfo {
    id: number;
    room_id: number;
    electricity_meter?: number;
    water_meter?: number;
    rent_fee?: number;
    deposit?: number;
}

interface PaymentInfo {
    id: number;
    room_id: number;
    electricity_fee?: number;
    water_fee?: number;
    rent_fee?: number;
    total_fee?: number;
    paid_at?: Date;
}

interface Feedback {
    id: number;
    type: any;
    user_id: string;
    content: string;
    created_at: Date;
}

interface ChatMessage {
    id: number;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: Date;
}
