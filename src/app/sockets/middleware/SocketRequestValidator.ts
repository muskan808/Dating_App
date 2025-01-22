import { AnyObjectSchema } from "yup";

export const SocketRequestValidator = async (
    data:any,
    resourceSchema: AnyObjectSchema
) => {
      try {
        if (!Object.keys(data).length) { 
            data.errorMessage = `parameters are required!` 
            return data;
        }
        const value = await resourceSchema.validateSync(data, {
            abortEarly: false,
            stripUnknown: true,
        });
        data.validatedData = value;

        return data;
    } catch (error: any) {
        data.errorMessage = `Errors: ${error.errors}`
        return data;
    }
};