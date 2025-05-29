export type TPotholeVerification={
    potholeId: string;
    userId: string;
    status: "No"|"Yes"|"I don't know";
    createdAt: Date;
    updatedAt: Date;
}