# File Upload API Documentation

## Overview
This API supports file uploads for images, videos, and documents. Files are stored locally in the server's `uploads` directory and served as static files.

## Supported File Types

### Images
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### Videos
- MP4 (.mp4)
- MPEG (.mpeg)
- QuickTime (.mov)
- AVI (.avi)
- WebM (.webm)

### Documents
- PDF (.pdf)
- Word Documents (.doc, .docx)

## File Size Limits
- Maximum file size: 50MB per file
- Maximum files per request: 10 files (for multiple uploads)

## Authentication
All upload endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Upload Endpoints

### 1. Upload Single Image
**POST** `/api/upload/image`
- **Field name**: `image`
- **Max files**: 1
- **Allowed types**: Images only

**Example using curl:**
```bash
curl -X POST "http://localhost:5000/api/upload/image" \
  -H "Authorization: Bearer <token>" \
  -F "image=@/path/to/image.jpg"
```

### 2. Upload Multiple Images
**POST** `/api/upload/images`
- **Field name**: `images`
- **Max files**: 10
- **Allowed types**: Images only

**Example using curl:**
```bash
curl -X POST "http://localhost:5000/api/upload/images" \
  -H "Authorization: Bearer <token>" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.png"
```

### 3. Upload Single Video
**POST** `/api/upload/video`
- **Field name**: `video`
- **Max files**: 1
- **Allowed types**: Videos only

### 4. Upload Document (CV/Resume)
**POST** `/api/upload/document`
- **Field name**: `document`
- **Max files**: 1
- **Allowed types**: Documents only

### 5. Upload Project Files (Mixed)
**POST** `/api/upload/project-files`
- **Field names**: 
  - `mainImage` (1 file max)
  - `images` (10 files max)
  - `videos` (5 files max)

**Example using curl:**
```bash
curl -X POST "http://localhost:5000/api/upload/project-files" \
  -H "Authorization: Bearer <token>" \
  -F "mainImage=@/path/to/main.jpg" \
  -F "images=@/path/to/img1.jpg" \
  -F "images=@/path/to/img2.png" \
  -F "videos=@/path/to/demo.mp4"
```

### 6. Delete Uploaded File
**DELETE** `/api/upload/:folder/:filename`
- **Parameters**: 
  - `folder`: One of `images`, `videos`, `documents`
  - `filename`: The filename to delete

## Project Endpoints with File Upload

### Create Project with Files
**POST** `/api/projects/with-files`

**Form fields:**
- `mainImage` (file, required)
- `images` (files, optional, max 10)
- `videos` (files, optional, max 5)
- `title` (text, required)
- `description` (text, required)
- `longDescription` (text, required)
- `features` (JSON array as string)
- `technologies` (JSON array as string)
- `category` (text, required)
- `completedDate` (text, required)
- `demoUrl` (text, optional)
- `githubUrl` (text, optional)
- `clientRemarks` (text, optional)

**Example using curl:**
```bash
curl -X POST "http://localhost:5000/api/projects/with-files" \
  -H "Authorization: Bearer <token>" \
  -F "mainImage=@/path/to/main.jpg" \
  -F "images=@/path/to/img1.jpg" \
  -F "videos=@/path/to/demo.mp4" \
  -F "title=My Project" \
  -F "description=Short description" \
  -F "longDescription=Detailed description" \
  -F "features=[\"Feature 1\", \"Feature 2\"]" \
  -F "technologies=[\"React\", \"Node.js\"]" \
  -F "category=Web Development" \
  -F "completedDate=May 2023"
```

## Site Settings Endpoints with File Upload

### Update Site Settings with Files
**PUT** `/api/site-settings/with-files`

**Form fields:**
- `profileImage` (file, optional)
- `cv` (file, optional)
- `name` (text)
- `title` (text)
- `description` (text)
- `email` (text)
- `phone` (text)
- `location` (text)
- `socialLinks` (JSON object as string)

**Example using curl:**
```bash
curl -X PUT "http://localhost:5000/api/site-settings/with-files" \
  -H "Authorization: Bearer <token>" \
  -F "profileImage=@/path/to/profile.jpg" \
  -F "cv=@/path/to/resume.pdf" \
  -F "name=John Doe" \
  -F "title=Full Stack Developer" \
  -F "socialLinks={\"linkedin\":\"https://linkedin.com/in/johndoe\"}"
```

## Response Format

### Success Response
```json
{
  "message": "File uploaded successfully",
  "file": {
    "filename": "image-1640995200000-123456789.jpg",
    "originalName": "my-image.jpg",
    "size": 1024000,
    "url": "http://localhost:5000/uploads/images/image-1640995200000-123456789.jpg",
    "path": "/absolute/path/to/file"
  }
}
```

### Multiple Files Response
```json
{
  "message": "Files uploaded successfully",
  "files": [
    {
      "filename": "image-1640995200000-123456789.jpg",
      "originalName": "image1.jpg",
      "size": 1024000,
      "url": "http://localhost:5000/uploads/images/image-1640995200000-123456789.jpg"
    }
  ]
}
```

### Error Response
```json
{
  "message": "File too large. Maximum size is 50MB."
}
```

## File Access
Uploaded files can be accessed directly via their URLs:
- Images: `http://localhost:5000/uploads/images/<filename>`
- Videos: `http://localhost:5000/uploads/videos/<filename>`
- Documents: `http://localhost:5000/uploads/documents/<filename>`

## Important Notes

1. **File Storage**: Files are stored locally on the server. For production, consider using cloud storage services like AWS S3, Cloudinary, etc.

2. **File Cleanup**: When deleting projects or updating site settings, associated files are automatically deleted from the server.

3. **Security**: File types are validated on upload. Only allowed file types can be uploaded.

4. **Unique Filenames**: Uploaded files are automatically renamed with timestamps to avoid conflicts.

5. **Error Handling**: The API includes comprehensive error handling for various upload scenarios.

## Frontend Integration

### Using JavaScript Fetch API
```javascript
const uploadImage = async (file, token) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch('/api/upload/image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return response.json();
};
```

### Using Axios
```javascript
const uploadProjectWithFiles = async (projectData, files, token) => {
  const formData = new FormData();
  
  // Add text fields
  Object.keys(projectData).forEach(key => {
    formData.append(key, projectData[key]);
  });
  
  // Add files
  if (files.mainImage) {
    formData.append('mainImage', files.mainImage);
  }
  
  files.images?.forEach(image => {
    formData.append('images', image);
  });
  
  const response = await axios.post('/api/projects/with-files', formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};
```
