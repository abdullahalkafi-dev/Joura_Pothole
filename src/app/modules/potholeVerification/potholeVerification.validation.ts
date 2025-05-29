import { z } from "zod";

const createPotholeVerificationValidation = z.object({
    body:z.object({
        potholeId: z.string({
            required_error: "Pothole ID is required",
        }),
        status: z.enum(["No", "Yes", "I don't know"], {
          message: "Status must be 'No' or 'Yes' or 'I don\'t know'",
        }),
        userId: z.string({
            required_error: "userId is required",
        }),
    })
})

export const PotholeVerificationValidation = {
    createPotholeVerificationValidation,
}