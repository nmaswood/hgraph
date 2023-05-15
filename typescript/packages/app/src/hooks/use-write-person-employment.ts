import useSWRMutation from "swr/mutation";

export const useWritePersonEmployment = () => {
  const data = useSWRMutation<
    void,
    unknown,
    "/api/proxy/data/person-employment",
    {
      companyId: number;
      personId: number;
      employmentTitle: string;
      startDate: string | undefined;
      endDate: string | undefined;
    }
  >("/api/proxy/data/person-employment", async (url: string, args) => {
    await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args.arg),
    });
  });

  return data;
};
