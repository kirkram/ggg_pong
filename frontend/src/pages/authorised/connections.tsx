import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUserProfile } from '../../service/UserService'; // Import your service
import { appClient } from '../../service'; // Import appClient

export const ConnectionsPage = () => {
  const navigate = useNavigate();

  // State variables
  const [players, setPlayers] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

 useEffect(() => {

  const fetchUsers = async () => {
    try {
      // Get the current user's profile
      const currentUser = await getUserProfile();
  
      // Fetch the list of all users from the backend
      const response = await appClient.get('/users'); // This should now match the new endpoint
      const allUsers = response.data;

      // Exclude the current user from the list of players
      //const filteredUsers = allUsers.filter((user) => user.id !== currentUser.id);

      const filteredUsers = allUsers.filter((user) => user.id !== currentUser.id).map((user) => ({
        ...user,
        friendStatus: user.friendStatus || 'Add Friend', // Ensure default value
        showUnfriend: false,
      }));
    
    console.log("filteredUsers:", filteredUsers);
    setPlayers(filteredUsers);
    

      setPlayers(filteredUsers);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError('Failed to load users');
      setLoading(false);
    }
  };

    fetchUsers();
  }, []);  

//   // Fetch users from the backend
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         // Get the current user's profile
//         const currentUser = await getUserProfile();

//         // Fetch the list of all users from the backend
//         const response = await appClient.get('/users'); // Adjust the endpoint as needed
//         const allUsers = response.data;

//         // Exclude the current user from the list of players
//         const filteredUsers = allUsers.filter((user) => user.id !== currentUser.id);
//         setPlayers(filteredUsers);
//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching users:", err);  // Log the error
//         setError('Failed to load users');
//         setLoading(false);
//       }
//     };

//     fetchUsers();
//   }, []);

  // Handle adding friends, unfriending, etc.
  // const handleAddFriend = (index) => {
  //   const newPlayers = [...players];
  //   const player = newPlayers[index];

  //   if (player.friendStatus === 'Add Friend') {
  //     player.friendStatus = 'Pending';
  //   } else if (player.friendStatus === 'Friend' || player.friendStatus === 'Pending') {
  //     return;
  //   }
  //   setPlayers(newPlayers);
  // };

  const handleAddFriend = async (index) => {
    const newPlayers = [...players];
    const player = newPlayers[index];
  
    if (player.friendStatus === 'Add Friend') {
      try {
        // Send request to backend
        console.log("FWendship Request...");

        await appClient.post('/friendships/request', { receiver_id: player.id });
        console.log("FWendship Request DONE...");

        // Update frontend state only if request succeeds
        player.friendStatus = 'Pending';
        setPlayers(newPlayers);
      } catch (err) {
        console.error('Error sending friend request:', err);
      }
    }
  };

  const handleUnfriend = (index) => {
    const newPlayers = [...players];
    const player = newPlayers[index];

    if (player.friendStatus === 'Friend') {
      player.friendStatus = 'Add Friend';
      player.showUnfriend = false;
    }
    setPlayers(newPlayers);
  };

  const handleFriendClick = (index) => {
    const newPlayers = [...players];
    const player = newPlayers[index];

    if (player.friendStatus === 'Friend') {
      player.showUnfriend = !player.showUnfriend;
    }
    setPlayers(newPlayers);
  };

  // Handle friend request accept or decline
  const handleRequestAction = (index, action) => {
    const newRequests = [...friendRequests];
    if (action === 'accept') {
      const acceptedUser = newRequests.splice(index, 1)[0];
      const newPlayers = [...players, { username: acceptedUser.username, online: true, friendStatus: 'Friend', showUnfriend: false }];
      setPlayers(newPlayers);
    } else if (action === 'decline') {
      newRequests.splice(index, 1);
    }
    setFriendRequests(newRequests);
  };

  // Render the page
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div
      className="flex h-screen bg-gray-900 text-white relative bg-cover bg-center"
      style={{ backgroundImage: "url('/background/gray_background.jpg')" }}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate("/menu")}
        className="absolute top-6 left-6 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white font-semibold shadow-md"
      >
        🔙 Back to Menu
      </button>

      <div className="flex flex-col justify-center items-center w-full text-center">
        <h1 className="text-5xl font-bold bg-black bg-opacity-60 px-6 py-4 rounded-lg">
          Gang Connections 🤝
        </h1>
        <p className="mt-4 text-xl text-gray-700">
          Find your squad, challenge your rivals. Loyalty not guaranteed.
        </p>

        {/* Friend Requests Section */}
        <div className="mt-8 w-3/4 text-center">
          <h2 className="text-2xl text-gray-700">Friend Requests</h2>
          <div className="mt-4">
            {friendRequests.length === 0 ? (
              <p className="text-gray-500">No friend requests</p>
            ) : (
              friendRequests.map((request, index) => (
                <div key={index} className="flex justify-center items-center bg-gray-800 p-4 my-2 rounded-lg">
                  <span className="text-white mr-4">{request.username}</span>
                  <button
                    onClick={() => handleRequestAction(index, 'accept')}
                    className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white mx-2"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRequestAction(index, 'decline')}
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white mx-2"
                  >
                    Decline
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Player Table */}
        <table className="mt-8 w-3/4 text-center border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2 text-lg bg-gray-700">Username</th>
              <th className="px-4 py-2 text-lg bg-gray-700">Online Status</th>
              <th className="px-4 py-2 text-lg bg-gray-700">Friend Status</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr key={index} className="bg-gray-800">
                <td className="px-4 py-2">{player.username}</td>
                <td className="px-4 py-2">{player.online ? 'Online' : 'Offline'}</td>
                <td className="px-4 py-2">
                  {player.friendStatus === 'Add Friend' && (
                    <button
                      onClick={() => handleAddFriend(index)}
                      className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white inline-block mx-2"
                    >
                      Add Friend
                    </button>
                  )}
                  {player.friendStatus === 'Pending' && (
                    <span className="bg-yellow-500 px-4 py-2 rounded-lg text-white inline-block mx-2">
                      Pending
                    </span>
                  )}
                  {player.friendStatus === 'Friend' && (
                    <div className="inline-flex items-center mx-2">
                      <button
                        onClick={() => handleFriendClick(index)}
                        className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white"
                      >
                        Friend
                      </button>
                      {player.showUnfriend && (
                        <button
                          onClick={() => handleUnfriend(index)}
                          className="bg-red-500 hover:bg-red-600 px-2 py-1 rounded-lg text-white text-sm ml-2"
                        >
                          Unfriend
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConnectionsPage;
