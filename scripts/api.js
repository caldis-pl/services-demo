var caldisApi = (function () {
    const rootUrl =  "https://caldis.pl/api/v1";
    const apiKey = "";

    if(!apiKey){
        console.warn("caldis-api-key is missing")
    }
        
    const commonOptions = {
        method: "POST",
        headers: {
            "ApiKey": apiKey,
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
    };

    const fetchWithCommonOptions = async (url, data) => {
        const response = await fetch(url, {
            ...commonOptions,
            body: JSON.stringify(data),
        });

        var responseJson = await response.json()
        if (!response.ok) {
            console.info(`ERROR RESPONSE:`)
            console.info(responseJson);
            throw new Error(`Failed to fetch data from ${url}.`);
        }

        return responseJson;
    };

    return {
        getServiceGroups: async (data) => {
            const url = `${rootUrl}/ServiceReservation/GetServiceGroups`;
            return fetchWithCommonOptions(url, data);
        },
        getServiceDetails: async (data) => {
            const url = `${rootUrl}/ServiceReservation/GetServiceDetails`;
            return fetchWithCommonOptions(url, data);
        },
        getServicesAvailabilityForMonth: async (data) => {
            const url = `${rootUrl}/ServiceReservation/GetServicesAvailabilityForMonth`;
            return fetchWithCommonOptions(url, data);
        },
        getServicesAvailabilityHours: async (data) => {
            const url = `${rootUrl}/ServiceReservation/GetServicesAvailabilityHours`;
            return fetchWithCommonOptions(url, data);
        },
        getServicesSummary:  async (data) => {
            const url = `${rootUrl}/ServiceReservation/GetServicesSummary`;
            return fetchWithCommonOptions(url, data);
        },
        addServiceReservation:  async (data) => {
            const url = `${rootUrl}/ServiceReservation/AddServiceReservation`;
            return fetchWithCommonOptions(url, data);
        }
    };
})();