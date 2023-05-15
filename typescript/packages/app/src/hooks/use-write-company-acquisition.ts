import useSWRMutation from "swr/mutation";

export const useWriteCompanyAcquisition = () => {
  const data = useSWRMutation<
    void,
    unknown,
    "/api/proxy/data/company-acquisition",
    {
      parentCompanyId: number;
      acquiredCompanyId: number;
      mergedIntoParentCompany: boolean;
    }
  >("/api/proxy/data/company-acquisition", async (url: string, args) => {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args.arg),
    });
    const data = await res.json();
    return data;
  });

  return data;
};
