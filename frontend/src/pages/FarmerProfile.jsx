import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, User, Briefcase, Loader2, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Added
import { getMe, updateProfile } from "@/api/auth"; // Added
import { toast } from "sonner"; // Added

//... (component start)
const FarmerProfile = ({ onBack }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null); // Add ref for hidden input

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    village: "",
    district: "",
    state: "",
    pincode: "",
    experience: "",
    specialization: "",
    landSize: "",
    bio: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getMe();
        const user = response.data;
        setFormData({
          name: user.name || "",
          mobile: user.mobile || "",
          email: user.email || "",
          bio: user.bio || "",
          village: user.location?.village || "",
          district: user.location?.district || "",
          state: user.location?.state || "",
          pincode: user.location?.pincode || "",
          experience: user.skills?.experience || "",
          specialization: user.skills?.specialization || "",
          landSize: user.skills?.landSize || ""
        });
        if (user.avatar) {
          setAvatarPreview(user.avatar);
        }
      } catch (error) {
        console.error("Failed to load profile", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image too large. Max 5MB.");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('mobile', formData.mobile);
      formDataToSend.append('bio', formData.bio);

      // Nested objects as bracket notation for express extended urlencoded/multer
      formDataToSend.append('location[village]', formData.village);
      formDataToSend.append('location[district]', formData.district);
      formDataToSend.append('location[state]', formData.state);
      formDataToSend.append('location[pincode]', formData.pincode);

      formDataToSend.append('skills[experience]', formData.experience);
      formDataToSend.append('skills[specialization]', formData.specialization);
      formDataToSend.append('skills[landSize]', formData.landSize);

      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      }

      const response = await updateProfile(formDataToSend);
      if (response.success) {
        toast.success("Profile updated successfully!");
        // Update local storage userInfo if it exists to reflect new avatar immediately in navbar
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
          const parsed = JSON.parse(userInfo);
          // Merge updates
          const updated = { ...parsed, ...response.data };
          localStorage.setItem('userInfo', JSON.stringify(updated));
          // Trigger storage event for Navigation update if needed, though Accessing Navigation state directly is better or reloading
          window.dispatchEvent(new Event('storage'));
        }
      }
    } catch (error) {
      console.error("Update failed", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Profile Management</h1>
            <p className="text-muted-foreground">Update your personal and farming information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your basic contact and location details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary bg-muted flex items-center justify-center">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Click camera icon to change photo</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
  // ... (rest of form)
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mobile">Phone Number</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange("mobile", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled // Usually email update requires re-verification
                    className="bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="village">Village</Label>
                <Input
                  id="village"
                  value={formData.village}
                  onChange={(e) => handleInputChange("village", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => handleInputChange("district", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                      <SelectItem value="Punjab">Punjab</SelectItem>
                      <SelectItem value="Haryana">Haryana</SelectItem>
                      <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                      <SelectItem value="Madhya Pradesh">Madhya Pradesh</SelectItem>
                      <SelectItem value="Bihar">Bihar</SelectItem>
                      <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">PIN Code</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange("pincode", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Farming Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Farming Information
              </CardTitle>
              <CardDescription>
                Update your agricultural expertise and land details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">


              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  value={formData.experience}
                  onChange={(e) => handleInputChange("experience", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Crop Specialization</Label>
                <Input
                  id="specialization"
                  placeholder="e.g., Wheat, Rice, Cotton"
                  value={formData.specialization}
                  onChange={(e) => handleInputChange("specialization", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="landSize">Total Land Size (Acres)</Label>
                <Input
                  id="landSize"
                  type="number"
                  value={formData.landSize}
                  onChange={(e) => handleInputChange("landSize", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio / Description</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell others about your farming experience and expertise..."
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <Button onClick={handleSave} className="w-full sm:w-auto" disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FarmerProfile;

