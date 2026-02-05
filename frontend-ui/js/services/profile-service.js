let profileService;

class ProfileService
{
    lastProfile = null;

    loadProfile()
    {
        const url = `${config.baseUrl}/profile`;

        axios.get(url)
             .then(response => {
                 this.lastProfile = response.data;
                 templateBuilder.build("profile", response.data, "main")
             })
             .catch(error => {
                 const data = {
                     error: "Load profile failed."
                 };

                 templateBuilder.append("error", data, "errors")
             })
    }

    loadProfileForFlow()
    {
        const url = `${config.baseUrl}/profile`;
        return axios.get(url)
             .then(response => {
                 this.lastProfile = response.data;
             })
             .catch(() => { this.lastProfile = null; })
    }

    updateProfile(profile)
    {

        const url = `${config.baseUrl}/profile`;

        axios.put(url, profile)
             .then(() => {
                 const data = {
                     message: "The profile has been updated."
                 };

                 templateBuilder.append("message", data, "errors")
             })
             .catch(error => {
                 const data = {
                     error: "Save profile failed."
                 };

                 templateBuilder.append("error", data, "errors")
             })
    }
}

document.addEventListener("DOMContentLoaded", () => {
   profileService = new ProfileService();
});
