import React, { useState, useRef } from 'react';
import Cropper from 'react-cropper';
// import 'cropperjs/dist/cropper.css'; // CSS is now imported globally in src/index.js
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const PersonalInfoForm = ({ data, onChange }) => {
  const [imageToCrop, setImageToCrop] = useState(null);
  const [cropperInstance, setCropperInstance] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    e.preventDefault();
    const files = e.target.files;
    if (files && files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result);
      };
      reader.readAsDataURL(files[0]);
      // Reset file input value to allow re-uploading the same file if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCrop = () => {
    if (cropperInstance) {
      const croppedImageBase64 = cropperInstance.getCroppedCanvas().toDataURL();
      onChange({ ...data, profileImage: croppedImageBase64 });
      setImageToCrop(null); // Close cropper
    }
  };

  const handleCancelCrop = () => {
    setImageToCrop(null);
  };

  const handleRemoveImage = () => {
    onChange({ ...data, profileImage: null });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Personal Information</h3>

      {/* Image Upload and Cropping Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-600 mb-1">Profile Picture</label>
        {data?.profileImage && !imageToCrop && (
          <div className="mb-2">
            <img src={data.profileImage} alt="Profile" className="w-32 h-32 rounded-full object-cover mx-auto shadow-md" />
            <Button onClick={() => fileInputRef.current?.click()} size="sm" variant="outline" className="mt-2 mr-2">Change Image</Button>
            <Button onClick={handleRemoveImage} size="sm" variant="destructive" className="mt-2">Remove Image</Button>
          </div>
        )}
        {!data?.profileImage && !imageToCrop && (
           <Button onClick={() => fileInputRef.current?.click()} size="sm" variant="outline">Upload Image</Button>
        )}
         <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden" // Hidden, triggered by button
        />

        {imageToCrop && (
          <div className="mt-4 p-4 border rounded-md bg-gray-50">
            <h4 className="text-md font-semibold mb-2 text-gray-700">Crop Your Image</h4>
            <Cropper
              src={imageToCrop}
              style={{ height: 300, width: '100%' }}
              initialAspectRatio={1 / 1}
              aspectRatio={1 / 1}
              guides={true}
              viewMode={1}
              autoCropArea={0.8}
              responsive={true}
              checkOrientation={false} // Recommended to disable for base64 images
              onInitialized={(instance) => {
                setCropperInstance(instance);
              }}
            />
            <div className="mt-4 space-x-2">
              <Button onClick={handleCrop} size="sm">Crop & Save Image</Button>
              <Button onClick={handleCancelCrop} size="sm" variant="outline">Cancel</Button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
          <Input
            type="text"
            name="name"
            id="name"
            value={data?.name || ''}
            onChange={handleChange}
            placeholder="e.g., John Doe"
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">Email</label>
          <Input
            type="email"
            name="email"
            id="email"
            value={data?.email || ''}
            onChange={handleChange}
            placeholder="e.g., john.doe@example.com"
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
          <Input
            type="tel"
            name="phone"
            id="phone"
            value={data?.phone || ''}
            onChange={handleChange}
            placeholder="e.g., 123-456-7890"
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-600 mb-1">Address</label>
          <Input
            type="text"
            name="address"
            id="address"
            value={data?.address || ''}
            onChange={handleChange}
            placeholder="e.g., 123 Main St, Anytown"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
