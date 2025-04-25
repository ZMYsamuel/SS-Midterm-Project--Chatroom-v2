import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import './styles.css';

function UserProfileModal({ currentUser, onClose }) {
  const [profilePicture, setProfilePicture] = useState(currentUser.photoURL || '');
  const [userName, setUserName] = useState(currentUser.displayName || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfilePicture(userData.photoURL || '');
          setUserName(userData.displayName || '');
          setEmail(userData.email || '');
          setPhoneNumber(userData.phoneNumber || '');
          setAddress(userData.address || '');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  const handleSave = async () => {
    try {
      console.log('Saving profile for user:', currentUser.uid);
      const userRef = doc(db, 'users', currentUser.uid);
      const profileData = {
        photoURL: profilePicture,
        displayName: userName,
        email,
        phoneNumber,
        address,
      };
      console.log('Profile data to save:', profileData);
      console.log('Attempting to save to Firestore:', userRef.path);
      await setDoc(userRef, profileData, { merge: true });
      console.log('Successfully saved to Firestore:', profileData);
      alert('Profile updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Profile</h2>
        <div className="profile-field">
          <label>Profile Picture:</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {profilePicture && <img src={profilePicture} alt="Profile" className="profile-picture-preview" />}
        </div>
        <div className="profile-field">
          <label>User Name:</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <div className="profile-field">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="profile-field">
          <label>Phone Number:</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
        <div className="profile-field">
          <label>Address:</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div className="modal-actions">
          <button onClick={handleSave} className="save-button">Save</button>
          <button onClick={onClose} className="cancel-button">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default UserProfileModal;