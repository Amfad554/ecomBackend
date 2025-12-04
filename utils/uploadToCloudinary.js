const cloudinary = require('../config/cloudinary');



const uploadToCloudinary = async (fileBuffer, resourceType, folder_name) => {
    try {
        const uploadPromise = new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: resourceType, folder: folder_name }, (error, result) => {
                if (error) return reject(error);
                if (result) return resolve(result);
            })
                .end(fileBuffer);
        });
        const result = await uploadPromise;
        console.log("image uploaded succesfully");
        return result.secure_url;
    } catch (error) {
        console.log("image upload failed", error);
        throw error;
    }
}

module.exports = uploadToCloudinary;