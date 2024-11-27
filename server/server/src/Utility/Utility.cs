namespace server.Utility {
    public class Utility {
        public async static Task<byte[]> getDefaultProfilePic() {
            var defaultPicturePath = Path.Combine(Directory.GetCurrentDirectory(), "src", "images", "defaultPicture.jpg");
            var defaultPicture = File.ReadAllBytesAsync(defaultPicturePath);
            return await defaultPicture;
        }
    };
};