import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const ProfilePage = () => {
  const navigate = useNavigate();

  // Mocked user data (replace with actual data fetching)
  const [avatar, setAvatar] = useState<string>('./profile-pics/default-profile.jpg');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [dob, setDob] = useState('');
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [language, setLanguage] = useState('english');

  // For avatar upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatar(imageUrl);
    }
  };

  return (
    <div
      className="w-full h-full min-h-screen bg-cover bg-center text-white relative p-8"
      style={{ backgroundImage: "url('/background/gray_background.jpg')" }}
    >
      <button
        onClick={() => navigate('/menu')}
        className="absolute top-6 left-6 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold shadow-md"
      >
        🔙 Back to Menu
      </button>

      <div className="bg-black bg-opacity-70 backdrop-blur-md p-8 rounded-xl max-w-5xl mx-auto mt-20">
        <h1 className="text-4xl font-bold mb-6 text-center">Mugshot & Street Cred 📸</h1>

        {/* Top Section */}
        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* Avatar Upload */}
          <div className="text-center">
            <img
              src={avatar}
              alt="avatar"
              className="w-40 h-40 rounded-full border-4 border-white object-cover mx-auto"
            />
            <input type="file" onChange={handleAvatarChange} className="mt-4 text-sm" />
          </div>

          {/* Username + Email */}
          <div className="text-left">
            <p className="text-xl"><strong>Username:</strong> pong_master69</p>
            <p className="text-xl mt-2"><strong>Email:</strong> pongmaster@gangmail.com</p>
          </div>
        </div>

        <hr className="my-6 border-gray-600" />

        {/* Editable Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
          <EditableField label="First Name" value={firstName} onChange={setFirstName} />
          <EditableField label="Last Name" value={lastName} onChange={setLastName} />
          <EditableField label="Age" value={age} onChange={setAge} type="number" />
          <EditableField label="Date of Birth" value={dob} onChange={setDob} type="date" />

          {/* Gender Dropdown */}
          <div>
            <label className="block text-white mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-2 rounded bg-white text-black"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Language Picker */}
          <div>
            <label className="block text-white mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2 rounded bg-white text-black"
            >
              <option value="english">English</option>
              <option value="finnish">Finnish</option>
              <option value="serbian">Serbian</option>
              <option value="russian">Russian</option>
            </select>
          </div>

          {/* Wins / Losses (read-only or you can allow edits) */}
          <div>
            <label className="block text-white mb-1">Wins</label>
            <input
              type="number"
              value={wins}
              onChange={(e) => setWins(Number(e.target.value))}
              className="w-full p-2 rounded bg-white text-black"
            />
          </div>
          <div>
            <label className="block text-white mb-1">Losses</label>
            <input
              type="number"
              value={losses}
              onChange={(e) => setLosses(Number(e.target.value))}
              className="w-full p-2 rounded bg-white text-black"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Component for updating a single field
const EditableField = ({
  label,
  value,
  onChange,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
}) => {
  return (
    <div>
      <label className="block text-white mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-2 rounded bg-white text-black"
        />
        <button
          onClick={() => alert(`Updated ${label.toLowerCase()} to "${value}"`)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded"
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;

