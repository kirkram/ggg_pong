import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { appClient } from '../../service'; // Import appClient

export const ConnectionsPage = () => {
  const navigate = useNavigate();

  // State variables
  const [players, setPlayers] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFriendships = async () => {
      try {

        // Fetch the list of friendships (for this user) from the backend
        const response = await appClient.get('/friendships');
        const friendships: {  sender_id: number; 
                              receiver_id: number;
                              receiver_username: string; 
                              online_status: string;
                              status: string }[] = response.data;  // Explicitly type the friendships array
  
        // Map to player objects from the friendships
        const players = friendships.map((f) => ({
          self_id: f.sender_id,
          id: f.receiver_id,
          username: f.receiver_username,
          online_status: f.online_status,
          friendStatus: f.status
          
          // id: f.receiver_id, // Receiver is the friend in this case
          // self_id: f.sender_id,
          // username: f.receiver_username,
          // friendStatus: f.status,
        }));
  
        setPlayers(players);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching friendships:", err);
        setError('Failed to load friendships');
        setLoading(false);
      }
    };
  
    fetchFriendships();
  }, []);


  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const response = await appClient.get('/friendships/requests');
        setFriendRequests(response.data);
      } catch (error) {
        console.error("Error fetching friend requests:", error);
      }
    };

    fetchFriendRequests(); // Initial fetch
    const interval = setInterval(fetchFriendRequests, 5000); // Poll every 5 seconds

    return () => clearInterval(interval); // Clean up on unmount
  }, []); 


  const handleAddFriend = async (index) => {
    const newPlayers = [...players];
    const player = newPlayers[index];
  
    if (player.friendStatus === 'Not Friend') {
      try {
        // Send request to backend
        await appClient.post('/friendships/request', { receiver_id: player.id });

        // Update frontend state only if request succeeds
        player.friendStatus = 'Pending';
        setPlayers(newPlayers);
      } catch (err) {
        console.error('Error sending friend request:', err);
      }
    }
  };

  const handleUnfriend = async (index) => {
    const newPlayers = [...players];
    const player = newPlayers[index];

    // Unfriend in backend
    await appClient.put('/friendships/unfriend', {
      sender_id: player.self_id,
      receiver_id: player.id,
    });
  
    // Unfriend in Frontend
    player.friendStatus = 'Not Friend';
    player.showUnfriend = false;
  
    // Save in Frontend state
    setPlayers(newPlayers);
  };

  // Clicking "Friend" button will reveal an "unfriend" button
  const handleFriendClick = (index) => {
    const newPlayers = [...players];
    const player = newPlayers[index];

    if (player.friendStatus === 'Friend') {
      player.showUnfriend = !player.showUnfriend;
    }
    setPlayers(newPlayers);
  };

  // Handle friend request accept or decline
  const handleRequestAction = async (index, action) => {
    const newRequests = [...friendRequests];
    const Request = newRequests[index]; 
  
    if (action === 'accept') {
      try {
        // Send a request to the backend to update both friendship statuses
        await appClient.put('/friendships/accept', {
          sender_id: Request.sender_id,       // The sender of the request
          receiver_id: Request.receiver_id,   // The receiver (current user)
        });
  
        // Remove the accepted request from the list
        newRequests.splice(index, 1);
  
        // Update the players' friend statuses
        const newPlayers = players.map(player => {
          if (player.id === Request.sender_id) {
            return {
              ...player,
              friendStatus: 'Friend',  // Update sender's friend status
            };
          }
          return player;
        });
  
        // Update state after accepting the request
        setPlayers(newPlayers);
        setFriendRequests(newRequests);
      } catch (error) {
        console.error("Error accepting friend request:", error);
      }
    } else if (action === 'decline') {
      await appClient.put('/friendships/decline', {
        sender_id: Request.sender_id,
        receiver_id: Request.receiver_id,
      }); 

      // Remove the declined request from the list
      newRequests.splice(index, 1);
      setFriendRequests(newRequests);

        // Update the players' friend statuses
        const newPlayers = players.map(player => {
          if (player.id === Request.sender_id) {
            return {
              ...player,
              friendStatus: 'Not Friend',  // Update sender's friend status
            };
          }
          if (player.id === Request.receiver_id) {
            return {
              ...player,
              friendStatus: 'Friend',  // Update receiver's friend status
            };
          }
          return player;
        });


        setPlayers(newPlayers);
    }
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
                  <span className="text-white mr-4">{request.sender_username}</span>
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
                {/* <td className="px-4 py-2">{player.online_status}</td>  */}
                  <td className="px-4 py-2">
                    <span
                      className={`font-bold ${player.online_status === 'online' ? 'text-green-500' : ''}`}
                    >
                      {player.online_status}
                    </span>
                  </td>
                {/* <td className="px-4 py-2">{player.online_status}</td> */}
                {/* <td className="px-4 py-2">{player.online ? 'Online' : 'Offline'}</td> */}

                <td className="px-4 py-2">
                  {player.friendStatus === 'Not Friend' && (
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
