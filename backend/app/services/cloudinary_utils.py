import os
import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)

def upload_video_to_cloudinary(file_obj, folder: str):
    result = cloudinary.uploader.upload(
        file_obj,
        resource_type="video",
        folder=folder
    )
    return result["secure_url"]