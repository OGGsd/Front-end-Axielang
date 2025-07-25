import type { UseMutationResult } from "@tanstack/react-query";
import type { Users, useMutationFunctionType } from "@/types/api";
import type { UserInputType } from "@/types/components";
import { api } from "../../api";
import { getURL } from "../../helpers/constants";
import { UseRequestProcessor } from "../../services/request-processor";

export const useAddUser: useMutationFunctionType<undefined, UserInputType> = (
  options?,
) => {
  const { mutate } = UseRequestProcessor();

  // Disabled user creation functionality - Axie Studio uses login-only mode
  const addUserFunction = async (
    user: UserInputType,
  ): Promise<Array<Users>> => {
    // Return an error indicating that user creation is disabled
    throw new Error("User creation is disabled in Axie Studio. Please contact your administrator.");
  };

  const mutation: UseMutationResult<Array<Users>, any, UserInputType> = mutate(
    ["useAddUser"],
    addUserFunction,
    options,
  );

  return mutation;
};
