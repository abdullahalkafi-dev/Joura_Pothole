import { z } from "zod";

const createPotholeVerificationValidation = z.object({
    body:z.object({
        potholeId: z.string({
            required_error: "Pothole ID is required",
        }),
        status: z.enum(["verified", "not_verified"], {
          message: "Status must be 'No' or 'Yes' or 'I don\'t know'",
        }),
        verifiedBy: z.string({
            required_error: "Verified By is required",
        }),
    })
})

export const PotholeVerificationValidation = {
    createPotholeVerificationValidation,
}